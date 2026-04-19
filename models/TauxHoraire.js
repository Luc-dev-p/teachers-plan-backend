import pool from '../config/db.js';

export default class TauxHoraire {
  static async lister() {
    const resultat = await pool.query(`
      SELECT th.*, a.libelle as annee_libelle
      FROM taux_horaires th
      LEFT JOIN annees_academiques a ON a.id = th.annee_academique_id
      ORDER BY th.categorie, th.type_seance
    `);
    return resultat.rows;
  }

  static async trouver(categorie, typeSeance, anneeId) {
    const resultat = await pool.query(`
      SELECT montant FROM taux_horaires
      WHERE categorie = $1 AND type_seance = $2
        AND (annee_academique_id IS NULL OR annee_academique_id = $3)
      LIMIT 1
    `, [categorie, typeSeance, anneeId]);
    return resultat.rows[0];
  }

  static async creer({ categorie, type_seance, montant, annee_academique_id }) {
    const resultat = await pool.query(
      `INSERT INTO taux_horaires (categorie, type_seance, montant, annee_academique_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [categorie, type_seance, montant, annee_academique_id || null]
    );
    return resultat.rows[0];
  }

  static async modifier(id, { montant }) {
    const resultat = await pool.query(
      `UPDATE taux_horaires SET montant = $1, modifie_le = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [montant, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM taux_horaires WHERE id = $1 RETURNING *`, [id]);
    return resultat.rows[0];
  }
}