import pool from '../config/db.js';

export default class Utilisateur {
  static async creer({ email, mot_de_passe, nom, prenom, role = 'enseignant' }) {
    const resultat = await pool.query(
      `INSERT INTO utilisateurs (email, mot_de_passe, nom, prenom, role) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email, mot_de_passe, nom, prenom, role]
    );
    return resultat.rows[0];
  }

  static async trouverParEmail(email) {
    const resultat = await pool.query(
      `SELECT * FROM utilisateurs WHERE email = $1`,
      [email]
    );
    return resultat.rows[0];
  }

  static async trouverParId(id) {
    const resultat = await pool.query(
      `SELECT u.id, u.email, u.nom, u.prenom, u.role, u.actif, u.avatar, u.cree_le
       FROM utilisateurs u WHERE u.id = $1`,
      [id]
    );
    return resultat.rows[0];
  }

  static async lister() {
    const resultat = await pool.query(`
      SELECT u.id, u.email, u.nom, u.prenom, u.role, u.actif, u.avatar, u.cree_le,
             e.id as enseignant_id, e.matricule, e.categorie, e.statut as enseignant_statut,
             d.nom as departement_nom
      FROM utilisateurs u
      LEFT JOIN enseignants e ON e.utilisateur_id = u.id
      LEFT JOIN departements d ON d.id = e.departement_id
      ORDER BY u.nom ASC
    `);
    return resultat.rows;
  }

  static async modifierMotDePasse(id, nouveauHash) {
    const resultat = await pool.query(
      `UPDATE utilisateurs SET mot_de_passe = $1, modifie_le = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [nouveauHash, id]
    );
    return resultat.rows[0];
  }

  static async modifier(id, { nom, prenom, actif }) {
    const resultat = await pool.query(
      `UPDATE utilisateurs SET nom = $1, prenom = $2, actif = $3, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING id`,
      [nom, prenom, actif !== undefined ? actif : true, id]
    );
    return resultat.rows[0];
  }
}