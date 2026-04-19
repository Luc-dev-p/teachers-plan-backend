import pool from '../config/db.js';

export default class Equivalence {
  static async lister() {
    const resultat = await pool.query(`SELECT * FROM equivalences ORDER BY type ASC`);
    return resultat.rows;
  }

  static async trouverParType(type) {
    const resultat = await pool.query(`SELECT * FROM equivalences WHERE type = $1`, [type]);
    return resultat.rows[0];
  }

  static async modifier(id, { coefficient, description }) {
    const resultat = await pool.query(
      `UPDATE equivalences SET coefficient = $1, description = $2, modifie_le = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [coefficient, description || null, id]
    );
    return resultat.rows[0];
  }
}