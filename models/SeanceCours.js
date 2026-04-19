import pool from '../config/db.js';

export default class SeanceCours {
  static async creer({ enseignant_id, matiere_id, classe_id, salle_id, annee_academique_id,
                       date, heure_debut, heure_fin, type_seance, nombre_heures, remarques }) {
    const resultat = await pool.query(
      `INSERT INTO seances_cours (enseignant_id, matiere_id, classe_id, salle_id, annee_academique_id,
        date, heure_debut, heure_fin, type_seance, nombre_heures, remarques)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [enseignant_id, matiere_id, classe_id, salle_id, annee_academique_id,
       date, heure_debut, heure_fin, type_seance, nombre_heures, remarques || null]
    );
    return resultat.rows[0];
  }

  static async lister(filtres = {}) {
    const { enseignant_id, classe_id, salle_id, date_debut, date_fin, statut, annee_academique_id } = filtres;
    let conditions = [];
    const params = [];
    let index = 1;

    if (enseignant_id) { conditions.push(`s.enseignant_id = $${index++}`); params.push(enseignant_id); }
    if (classe_id) { conditions.push(`s.classe_id = $${index++}`); params.push(classe_id); }
    if (salle_id) { conditions.push(`s.salle_id = $${index++}`); params.push(salle_id); }
    if (date_debut) { conditions.push(`s.date >= $${index++}`); params.push(date_debut); }
    if (date_fin) { conditions.push(`s.date <= $${index++}`); params.push(date_fin); }
    if (statut) { conditions.push(`s.statut = $${index++}`); params.push(statut); }
    if (annee_academique_id) { conditions.push(`s.annee_academique_id = $${index++}`); params.push(annee_academique_id); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT s.*,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             m.nom as matiere_nom, m.code as matiere_code,
             c.nom as classe_nom, c.code as classe_code,
             sl.nom as salle_nom, sl.code as salle_code, sl.capacite as salle_capacite,
             a.libelle as annee_libelle
      FROM seances_cours s
      JOIN enseignants e ON e.id = s.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      JOIN matieres m ON m.id = s.matiere_id
      JOIN classes c ON c.id = s.classe_id
      JOIN salles sl ON sl.id = s.salle_id
      JOIN annees_academiques a ON a.id = s.annee_academique_id
      ${where} ORDER BY s.date DESC, s.heure_debut ASC
    `, params);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`
      SELECT s.*,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             m.nom as matiere_nom, m.code as matiere_code,
             c.nom as classe_nom, c.code as classe_code,
             sl.nom as salle_nom, sl.code as salle_code,
             a.libelle as annee_libelle
      FROM seances_cours s
      JOIN enseignants e ON e.id = s.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      JOIN matieres m ON m.id = s.matiere_id
      JOIN classes c ON c.id = s.classe_id
      JOIN salles sl ON sl.id = s.salle_id
      JOIN annees_academiques a ON a.id = s.annee_academique_id
      WHERE s.id = $1
    `, [id]);
    return resultat.rows[0];
  }

  static async verifierConflits(date, heureDebut, heureFin, salleId, enseignantId) {
    const resultat = await pool.query(`
      SELECT s.id, sl.nom as salle_nom,
             (SELECT u.nom || ' ' || u.prenom FROM enseignants en JOIN utilisateurs u ON u.id = en.utilisateur_id
              WHERE en.id = s.enseignant_id) as enseignant_nom
      FROM seances_cours s
      JOIN salles sl ON sl.id = s.salle_id
      WHERE s.date = $1 AND s.statut != 'annulee'
        AND s.heure_debut < $3 AND s.heure_fin > $2
        AND (s.salle_id = $4 OR s.enseignant_id = $5)
    `, [date, heureDebut, heureFin, salleId, enseignantId]);
    return resultat.rows;
  }

  static async valider(id, valideePar) {
    const resultat = await pool.query(`
      UPDATE seances_cours SET statut = 'effectuee', validee_par = $1, date_validation = CURRENT_DATE,
        modifie_le = CURRENT_TIMESTAMP
      WHERE id = $2 AND statut = 'planifiee' RETURNING *
    `, [validePar, id]);
    return resultat.rows[0];
  }

  static async annuler(id) {
    const resultat = await pool.query(`
      UPDATE seances_cours SET statut = 'annulee', modifie_le = CURRENT_TIMESTAMP
      WHERE id = $1 AND statut != 'effectuee' RETURNING *
    `, [id]);
    return resultat.rows[0];
  }
}