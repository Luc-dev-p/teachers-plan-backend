import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET /api/seances
router.get('/', async (req, res) => {
  try {
    const { enseignant_id, classe_id, annee_academique_id, statut } = req.query;

    let sql = `SELECT sc.*, 
       u.nom as enseignant_nom, u.prenom as enseignant_prenom,
       m.nom as matiere_nom, m.code as matiere_code,
       c.nom as classe_nom, s.nom as salle_nom,
       aa.libelle as annee_academique
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       LEFT JOIN classes c ON sc.classe_id = c.id
       LEFT JOIN salles s ON sc.salle_id = s.id
       LEFT JOIN annees_academiques aa ON sc.annee_academique_id = aa.id
       WHERE 1=1`;
    const params = [];
    let index = 1;

    if (enseignant_id) {
      sql += ` AND sc.enseignant_id = $${index++}`;
      params.push(enseignant_id);
    }
    if (classe_id) {
      sql += ` AND sc.classe_id = $${index++}`;
      params.push(classe_id);
    }
    if (annee_academique_id) {
      sql += ` AND sc.annee_academique_id = $${index++}`;
      params.push(annee_academique_id);
    }
    if (statut) {
      sql += ` AND sc.statut = $${index++}`;
      params.push(statut);
    }

    sql += ' ORDER BY sc.date DESC, sc.heure_debut ASC';

    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur séances:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/seances/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sc.*, 
        u.nom as enseignant_nom, u.prenom as enseignant_prenom,
        m.nom as matiere_nom, c.nom as classe_nom, s.nom as salle_nom
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       LEFT JOIN utilisateurs u ON e.utilisateur_id = u.id
       LEFT JOIN matieres m ON sc.matiere_id = m.id
       LEFT JOIN classes c ON sc.classe_id = c.id
       LEFT JOIN salles s ON sc.salle_id = s.id
       WHERE sc.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur séance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/seances
router.post('/', async (req, res) => {
  try {
    const { enseignant_id, matiere_id, classe_id, salle_id, annee_academique_id, date, heure_debut, heure_fin, type_seance, nombre_heures, remarques } = req.body;

    const result = await pool.query(
      `INSERT INTO seances_cours (enseignant_id, matiere_id, classe_id, salle_id, annee_academique_id, date, heure_debut, heure_fin, type_seance, nombre_heures, remarques)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [enseignant_id, matiere_id, classe_id, salle_id, annee_academique_id, date, heure_debut, heure_fin, type_seance || 'TD', nombre_heures || 0, remarques]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création séance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/seances/:id
router.put('/:id', async (req, res) => {
  try {
    const { matiere_id, classe_id, salle_id, date, heure_debut, heure_fin, type_seance, nombre_heures, remarques, statut } = req.body;
    const result = await pool.query(
      `UPDATE seances_cours 
       SET matiere_id = $1, classe_id = $2, salle_id = $3, date = $4, heure_debut = $5, heure_fin = $6, 
           type_seance = $7, nombre_heures = $8, remarques = $9, statut = $10, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
      [matiere_id, classe_id, salle_id, date, heure_debut, heure_fin, type_seance, nombre_heures, remarques, statut, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour séance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/seances/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM seances_cours WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Séance non trouvée' });
    }
    res.json({ message: 'Séance supprimée' });
  } catch (error) {
    console.error('Erreur suppression séance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/seances/:id/valider
router.post('/:id/valider', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Récupérer la séance avec l'enseignant
    const seanceResult = await client.query(
      `SELECT sc.*, e.categorie as enseignant_categorie
       FROM seances_cours sc
       LEFT JOIN enseignants e ON sc.enseignant_id = e.id
       WHERE sc.id = $1`,
      [req.params.id]
    );
    const seance = seanceResult.rows[0];
    if (!seance) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Séance non trouvée' });
    }

    // Récupérer le coefficient d'équivalence
    const eqResult = await client.query(
      "SELECT coefficient FROM equivalences WHERE type = $1",
      [seance.type_seance]
    );
    const coefficient = parseFloat(eqResult.rows[0]?.coefficient || 1);
    const heures_equiv_td = parseFloat(seance.nombre_heures) * coefficient;

    // Récupérer le taux horaire (catégorie + type de séance)
    const tauxResult = await client.query(
      "SELECT montant FROM taux_horaires WHERE categorie = $1 AND type_seance = $2 AND annee_academique_id = $3 LIMIT 1",
      [seance.enseignant_categorie || 'Vacataire', seance.type_seance, seance.annee_academique_id]
    );
    const taux_horaire = parseFloat(tauxResult.rows[0]?.montant || 0);
    const montant_calcule = heures_equiv_td * taux_horaire;

    // Mettre à jour la séance
    await client.query(
      `UPDATE seances_cours SET statut = 'validee', validee_par = $1, date_validation = $2, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [req.body.utilisateur_id || null, new Date().toISOString().split('T')[0], req.params.id]
    );

    // Insérer dans heures_effectuees
    await client.query(
      `INSERT INTO heures_effectuees (enseignant_id, seance_cours_id, annee_academique_id, type_seance, heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, statut, mois)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'validee', $10)
       ON CONFLICT (seance_cours_id) DO UPDATE SET
         heures_reelles = $5, coefficient = $6, heures_equiv_td = $7, taux_horaire = $8, montant_calcule = $9, modifie_le = CURRENT_TIMESTAMP`,
      [seance.enseignant_id, req.params.id, seance.annee_academique_id, seance.type_seance, seance.nombre_heures, coefficient, heures_equiv_td, taux_horaire, montant_calcule, seance.date?.substring(0, 7)]
    );

    await client.query('COMMIT');
    res.json({ message: 'Séance validée avec succès', heures_equiv_td, montant_calcule });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Erreur validation séance:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  } finally {
    client.release();
  }
});

export { router };