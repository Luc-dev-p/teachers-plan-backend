import SeanceCours from '../models/SeanceCours.js';
import HeureEffectuee from '../models/HeureEffectuee.js';
import Equivalence from '../models/Equivalence.js';
import TauxHoraire from '../models/TauxHoraire.js';
import Enseignant from '../models/Enseignant.js';
import pool from '../config/db.js';

export const lister = async (req, res) => {
  try {
    const filtres = { ...req.query };

    if (req.utilisateur.role === 'enseignant') {
      filtres.enseignant_id = req.utilisateur.enseignant_id;
    } else if (req.utilisateur.role === 'rh' && req.utilisateur.enseignant_id) {
      const enseignant = await Enseignant.trouverParId(req.utilisateur.enseignant_id);
      if (enseignant?.departement_id) {
        const result = await pool.query(
          `SELECT e.id FROM enseignants e WHERE e.departement_id = $1`,
          [enseignant.departement_id]
        );
        const ids = result.rows.map(r => r.id);
        if (ids.length > 0) {
          const donnees = await SeanceCours.lister(filtres);
          return res.json({ succes: true, donnees: donnees.filter(s => ids.includes(s.enseignant_id)) });
        }
        return res.json({ succes: true, donnees: [] });
      }
    }

    const donnees = await SeanceCours.lister(filtres);
    res.json({ succes: true, donnees });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creer = async (req, res) => {
  try {
    const donnees = req.body;

    // Vérification des conflits
    const conflits = await SeanceCours.verifierConflits(
      donnees.date, donnees.heure_debut, donnees.heure_fin,
      donnees.salle_id, donnees.enseignant_id
    );

    if (conflits.length > 0) {
      return res.status(409).json({ succes: false, message: 'Conflit détecté', conflits });
    }

    const seance = await SeanceCours.creer(donnees);
    res.status(201).json({ succes: true, donnees: seance, message: 'Séance créée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const valider = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Valider la séance
    const seanceResult = await client.query(`
      UPDATE seances_cours SET statut = 'effectuee', validee_par = $1, date_validation = CURRENT_DATE, modifie_le = CURRENT_TIMESTAMP
      WHERE id = $2 AND statut = 'planifiee' RETURNING *
    `, [req.utilisateur.id, req.params.id]);

    if (seanceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ succes: false, message: 'Séance non trouvée ou déjà validée' });
    }

    const seance = seanceResult.rows[0];

    // 2. Coefficient
    const equivResult = await client.query(`SELECT coefficient FROM equivalences WHERE type = $1`, [seance.type_seance]);
    if (equivResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ succes: false, message: 'Coefficient non trouvé pour ' + seance.type_seance });
    }
    const coefficient = parseFloat(equivResult.rows[0].coefficient);
    const heuresEquivTd = parseFloat(seance.nombre_heures) * coefficient;

    // 3. Taux horaire
    const ensResult = await client.query(`SELECT categorie FROM enseignants WHERE id = $1`, [seance.enseignant_id]);
    const categorie = ensResult.rows[0]?.categorie || 'Vacataire';

    const tauxResult = await client.query(`
      SELECT montant FROM taux_horaires
      WHERE categorie = $1 AND type_seance = $2
      AND (annee_academique_id IS NULL OR annee_academique_id = $3)
      LIMIT 1
    `, [categorie, seance.type_seance, seance.annee_academique_id]);

    const tauxHoraire = tauxResult.rows.length > 0 ? parseFloat(tauxResult.rows[0].montant) : 0;
    const montantCalcule = heuresEquivTd * tauxHoraire;

    // 4. Insérer heures_effectuees
    const heureResult = await client.query(`
      INSERT INTO heures_effectuees (enseignant_id, seance_cours_id, annee_academique_id, type_seance,
        heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, statut, mois)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'validee', $10) RETURNING *
    `, [seance.enseignant_id, seance.id, seance.annee_academique_id, seance.type_seance,
       seance.nombre_heures, coefficient, heuresEquivTd, tauxHoraire, montantCalcule, seance.date.substring(0, 7)]);

    await client.query('COMMIT');

    res.json({
      succes: true,
      seance: seanceResult.rows[0],
      heure_effectuee: heureResult.rows[0],
      message: 'Séance validée, heures calculées',
    });
  } catch (erreur) {
    await client.query('ROLLBACK');
    res.status(500).json({ succes: false, message: erreur.message });
  } finally {
    client.release();
  }
};

export const annuler = async (req, res) => {
  try {
    const resultat = await SeanceCours.annuler(req.params.id);
    if (!resultat) {
      return res.status(409).json({ succes: false, message: 'Impossible d\'annuler une séance déjà validée' });
    }
    res.json({ succes: true, message: 'Séance annulée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const emploiDuTemps = async (req, res) => {
  try {
    const { classe_id, salle_id, date_debut, date_fin } = req.query;

    let conditions = [];
    const params = [];
    let index = 1;

    if (classe_id) { conditions.push(`s.classe_id = $${index++}`); params.push(classe_id); }
    if (salle_id) { conditions.push(`s.salle_id = $${index++}`); params.push(salle_id); }
    if (date_debut) { conditions.push(`s.date >= $${index++}`); params.push(date_debut); }
    if (date_fin) { conditions.push(`s.date <= $${index++}`); params.push(date_fin); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') + ' AND s.statut != \'annulee\'' : 'WHERE s.statut != \'annulee\'';

    const resultat = await pool.query(`
      SELECT s.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             m.nom as matiere_nom, m.code as matiere_code,
             c.nom as classe_nom, sl.nom as salle_nom, sl.code as salle_code
      FROM seances_cours s
      JOIN enseignants e ON e.id = s.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      JOIN matieres m ON m.id = s.matiere_id
      JOIN classes c ON c.id = s.classe_id
      JOIN salles sl ON sl.id = s.salle_id
      ${where}
      ORDER BY s.date ASC, s.heure_debut ASC
    `, params);

    res.json({ succes: true, donnees: resultat.rows });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};