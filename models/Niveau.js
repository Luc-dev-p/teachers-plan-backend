import pool from '../config/db.js';

export default class Niveau {
  static async creer({ code, nom, ordre }) {
    const resultat = await pool.query(
      `INSERT INTO niveaux (code, nom, ordre) VALUES ($1, $2, $3) RETURNING *`,
      [code, nom, ordre || 0]
    );
    return resultat.rows[0];
  }

  static async lister() {
    const resultat = await pool.query(`
      SELECT n.*, (SELECT COUNT(*) FROM classes c WHERE c.niveau_id = n.id) as nb_classes
      FROM niveaux n ORDER BY n.ordre ASC
    `);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`SELECT * FROM niveaux WHERE id = $1`, [id]);
    return resultat.rows[0];
  }

  static async modifier(id, { code, nom, ordre }) {
    const resultat = await pool.query(
      `UPDATE niveaux SET code = $1, nom = $2, ordre = $3, modifie_le = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
      [code, nom, ordre || 0, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM niveaux WHERE id = $1 RETURNING *`, [id]);
    return resultat.rows[0];
  }
}