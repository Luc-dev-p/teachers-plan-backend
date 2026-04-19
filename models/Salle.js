import pool from '../config/db.js';

export default class Salle {
  static async creer({ nom, code, capacite, type, batiment }) {
    const resultat = await pool.query(
      `INSERT INTO salles (nom, code, capacite, type, batiment) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nom, code, capacite || 30, type || 'standard', batiment || null]
    );
    return resultat.rows[0];
  }

  static async lister({ recherche, type } = {}) {
    let conditions = [];
    const params = [];
    let index = 1;

    if (recherche) {
      conditions.push(`s.code ILIKE $${index} OR s.nom ILIKE $${index}`);
      params.push(`%${recherche}%`);
      index++;
    }
    if (type) { conditions.push(`s.type = $${index++}`); params.push(type); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT s.*,
             (SELECT COUNT(*) FROM seances_cours sc
              WHERE sc.salle_id = s.id AND sc.statut != 'annulee' AND sc.date = CURRENT_DATE) as occupation_aujourdhui
      FROM salles s ${where} ORDER BY s.batiment ASC, s.code ASC
    `, params);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`SELECT * FROM salles WHERE id = $1`, [id]);
    return resultat.rows[0];
  }

  static async modifier(id, { nom, code, capacite, type, batiment }) {
    const resultat = await pool.query(
      `UPDATE salles SET nom = $1, code = $2, capacite = $3, type = $4, batiment = $5, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [nom, code, capacite || 30, type || 'standard', batiment || null, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM salles WHERE id = $1 RETURNING *`, [id]);
    return resultat.rows[0];
  }
}