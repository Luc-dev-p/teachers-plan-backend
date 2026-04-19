import pool from '../config/db.js';

export default class Matiere {
  static async creer({ code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id }) {
    const resultat = await pool.query(
      `INSERT INTO matieres (code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code, nom, description || null, credit || 2, heures_cm || 0, heures_td || 0,
       heures_tp || 0, type || 'fondamentale', departement_id]
    );
    return resultat.rows[0];
  }

  static async lister({ recherche, departement_id, type } = {}) {
    let conditions = [];
    const params = [];
    let index = 1;

    if (recherche) {
      conditions.push(`m.code ILIKE $${index} OR m.nom ILIKE $${index}`);
      params.push(`%${recherche}%`);
      index++;
    }
    if (departement_id) { conditions.push(`m.departement_id = $${index++}`); params.push(departement_id); }
    if (type) { conditions.push(`m.type = $${index++}`); params.push(type); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT m.*, d.nom as departement_nom, d.code as departement_code
      FROM matieres m JOIN departements d ON d.id = m.departement_id
      ${where} ORDER BY m.code ASC
    `, params);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`
      SELECT m.*, d.nom as departement_nom FROM matieres m
      JOIN departements d ON d.id = m.departement_id WHERE m.id = $1
    `, [id]);
    return resultat.rows[0];
  }

  static async modifier(id, donnees) {
    const { code, nom, description, credit, heures_cm, heures_td, heures_tp, type, departement_id } = donnees;
    const resultat = await pool.query(
      `UPDATE matieres SET code = $1, nom = $2, description = $3, credit = $4, heures_cm = $5,
       heures_td = $6, heures_tp = $7, type = $8, departement_id = $9, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [code, nom, description || null, credit || 2, heures_cm || 0, heures_td || 0,
       heures_tp || 0, type || 'fondamentale', departement_id, id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM matieres WHERE id = $1 RETURNING *`, [id]);
    return resultat.rows[0];
  }
}