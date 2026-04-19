import pool from '../config/db.js';

export default class Classe {
  static async creer({ nom, code, filiere_id, niveau_id, effectif }) {
    const resultat = await pool.query(
      `INSERT INTO classes (nom, code, filiere_id, niveau_id, effectif) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nom, code, filiere_id, niveau_id, effectif || 0]
    );
    return resultat.rows[0];
  }

  static async lister({ recherche, filiere_id, niveau_id } = {}) {
    let conditions = [];
    const params = [];
    let index = 1;

    if (recherche) {
      conditions.push(`c.code ILIKE $${index} OR c.nom ILIKE $${index}`);
      params.push(`%${recherche}%`);
      index++;
    }
    if (filiere_id) { conditions.push(`c.filiere_id = $${index++}`); params.push(filiere_id); }
    if (niveau_id) { conditions.push(`c.niveau_id = $${index++}`); params.push(niveau_id); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT c.*, f.nom as filiere_nom, f.code as filiere_code,
             n.nom as niveau_nom, n.code as niveau_code,
             d.nom as departement_nom
      FROM classes c
      JOIN filieres f ON f.id = c.filiere_id
      JOIN niveaux n ON n.id = c.niveau_id
      JOIN departements d ON d.id = f.departement_id
      ${where} ORDER BY c.code ASC
    `, params);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`
      SELECT c.*, f.nom as filiere_nom, n.nom as niveau_nom, d.nom as departement_nom
      FROM classes c
      JOIN filieres f ON f.id = c.filiere_id
      JOIN niveaux n ON n.id = c.niveau_id
      JOIN departements d ON d.id = f.departement_id
      WHERE c.id = $1
    `, [id]);
    return resultat.rows[0];
  }

  static async modifier(id, { nom, code, filiere_id, niveau_id, effectif }) {
    const resultat = await pool.query(
      `UPDATE classes SET nom = $1, code = $2, filiere_id = $3, niveau_id = $4, effectif = $5, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [nom, code, filiere_id, niveau_id, effectif || 0, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM classes WHERE id = $1 RETURNING *`, [id]);
    return resultat.rows[0];
  }
}