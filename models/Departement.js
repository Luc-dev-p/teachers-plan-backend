import pool from '../config/db.js';

export default class Departement {
  static async creer({ code, nom, description }) {
    const resultat = await pool.query(
      `INSERT INTO departements (code, nom, description) VALUES ($1, $2, $3) RETURNING *`,
      [code, nom, description || null]
    );
    return resultat.rows[0];
  }

  static async lister({ recherche } = {}) {
    let where = '';
    const params = [];
    if (recherche) {
      where = 'WHERE d.code ILIKE $1 OR d.nom ILIKE $1';
      params.push(`%${recherche}%`);
    }
    const resultat = await pool.query(`
      SELECT d.*,
             u.nom as chef_nom, u.prenom as chef_prenom,
             (SELECT COUNT(*) FROM enseignants e WHERE e.departement_id = d.id) as nb_enseignants,
             (SELECT COUNT(*) FROM filieres f WHERE f.departement_id = d.id) as nb_filieres
      FROM departements d
      LEFT JOIN enseignants chef ON chef.id = d.chef_id
      LEFT JOIN utilisateurs u ON u.id = chef.utilisateur_id
      ${where} ORDER BY d.nom ASC
    `, params);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`
      SELECT d.*, u.nom as chef_nom, u.prenom as chef_prenom,
             (SELECT COUNT(*) FROM enseignants e WHERE e.departement_id = d.id) as nb_enseignants,
             (SELECT COUNT(*) FROM filieres f WHERE f.departement_id = d.id) as nb_filieres
      FROM departements d
      LEFT JOIN enseignants chef ON chef.id = d.chef_id
      LEFT JOIN utilisateurs u ON u.id = chef.utilisateur_id
      WHERE d.id = $1
    `, [id]);
    return resultat.rows[0];
  }

  static async modifier(id, { code, nom, description, chef_id }) {
    const resultat = await pool.query(
      `UPDATE departements SET code = $1, nom = $2, description = $3, chef_id = $4, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $5 RETURNING *`,
      [code, nom, description || null, chef_id || null, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM departements WHERE id = $1 RETURNING *`, [id]);
    return resultat.rows[0];
  }
}