import db from '../config/db.js';

export default class Filiere {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM filieres ORDER BY nom');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM filieres WHERE id = ?', [id]);
    return rows[0];
  }

  static async getByDepartement(departementId) {
    const [rows] = await db.query('SELECT * FROM filieres WHERE departement_id = ? ORDER BY nom', [departementId]);
    return rows;
  }

  static async create(donnees) {
    const [result] = await db.query(
      'INSERT INTO filieres (id, code, nom, description, departement_id) VALUES (UUID(), ?, ?, ?, ?)',
      [donnees.code, donnees.nom, donnees.description || '', donnees.departement_id]
    );
    return result.insertId;
  }

  static async update(id, donnees) {
    await db.query(
      'UPDATE filieres SET code = ?, nom = ?, description = ?, departement_id = ? WHERE id = ?',
      [donnees.code, donnees.nom, donnees.description || '', donnees.departement_id, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    const [result] = await db.query('DELETE FROM filieres WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}