import pool from '../config/db.js';

export default class AnneeAcademique {
  static async creer({ libelle, date_debut, date_fin, actif = false }) {
    const resultat = await pool.query(
      `INSERT INTO annees_academiques (libelle, date_debut, date_fin, actif) VALUES ($1, $2, $3, $4) RETURNING *`,
      [libelle, date_debut, date_fin, actif]
    );
    return resultat.rows[0];
  }

  static async lister() {
    const resultat = await pool.query(`SELECT * FROM annees_academiques ORDER BY date_debut DESC`);
    return resultat.rows;
  }

  static async trouverActive() {
    const resultat = await pool.query(`SELECT * FROM annees_academiques WHERE actif = TRUE LIMIT 1`);
    return resultat.rows[0];
  }

  static async modifier(id, donnees) {
    const { libelle, date_debut, date_fin, actif } = donnees;
    const resultat = await pool.query(
      `UPDATE annees_academiques SET libelle = $1, date_debut = $2, date_fin = $3, actif = $4, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [libelle, date_debut, date_fin, actif, id]
    );
    return resultat.rows[0];
  }
}