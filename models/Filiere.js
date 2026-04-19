import db from '../config/db.js';

export default class Filiere {
  static async lister({ recherche = '', departement_id } = {}) {
    let sql = 'SELECT * FROM filieres WHERE 1=1';
    const params = [];
    if (recherche) {
      params.push(`%${recherche}%`);
      sql += ` AND (nom ILIKE $1 OR code ILIKE $1)`;
    }
    if (departement_id) {
      params.push(departement_id);
      sql += ` AND departement_id = $${params.length}`;
    }
    sql += ' ORDER BY nom';
    const resultat = await db.query(sql, params);
    return resultat.rows;
  }

  static async obtenir(id) {
    const resultat = await db.query('SELECT * FROM filieres WHERE id = $1', [id]);
    return resultat.rows[0];
  }

  static async creer({ code, nom, description, departement_id }) {
    const resultat = await db.query(
      'INSERT INTO filieres (id, code, nom, description, departement_id) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
      [code, nom, description || '', departement_id]
    );
    return resultat.rows[0];
  }

  static async modifier(id, donnees) {
    const resultat = await db.query(
      'UPDATE filieres SET code = $1, nom = $2, description = $3, departement_id = $4 WHERE id = $5 RETURNING *',
      [donnees.code, donnees.nom, donnees.description || '', donnees.departement_id, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await db.query('DELETE FROM filieres WHERE id = $1', [id]);
    return resultat.rowCount > 0;
  }
}