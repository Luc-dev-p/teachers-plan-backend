import pool from '../config/db.js';

export default class Enseignant {
  static async creer({ matricule, utilisateur_id, telephone, date_naissance, categorie, grade, departement_id }) {
    const resultat = await pool.query(
      `INSERT INTO enseignants (matricule, utilisateur_id, telephone, date_naissance, categorie, grade, departement_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [matricule, utilisateur_id, telephone || null, date_naissance || null,
       categorie || 'Vacataire', grade || null, departement_id || null]
    );
    return resultat.rows[0];
  }

  static async lister({ recherche, departement_id, statut, categorie } = {}) {
    let conditions = [];
    const params = [];
    let index = 1;

    if (recherche) {
      conditions.push(`(u.nom ILIKE $${index} OR u.prenom ILIKE $${index} OR e.matricule ILIKE $${index})`);
      params.push(`%${recherche}%`);
      index++;
    }
    if (departement_id) { conditions.push(`e.departement_id = $${index++}`); params.push(departement_id); }
    if (statut) { conditions.push(`e.statut = $${index++}`); params.push(statut); }
    if (categorie) { conditions.push(`e.categorie = $${index++}`); params.push(categorie); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT e.*, u.email, u.nom, u.prenom, u.actif, u.avatar,
             d.nom as departement_nom, d.code as departement_code,
             (SELECT COALESCE(SUM(he.heures_equiv_td), 0) FROM heures_effectuees he WHERE he.enseignant_id = e.id) as total_heures
      FROM enseignants e
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON d.id = e.departement_id
      ${where}
      ORDER BY u.nom ASC
    `, params);
    return resultat.rows;
  }

  static async trouverParId(id) {
    const resultat = await pool.query(`
      SELECT e.*, u.email, u.nom, u.prenom, u.actif, u.avatar,
             d.nom as departement_nom, d.code as departement_code
      FROM enseignants e
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON d.id = e.departement_id
      WHERE e.id = $1
    `, [id]);
    return resultat.rows[0];
  }

  static async trouverParUtilisateurId(utilisateur_id) {
    const resultat = await pool.query(`SELECT * FROM enseignants WHERE utilisateur_id = $1`, [utilisateur_id]);
    return resultat.rows[0];
  }

  static async modifier(id, donnees) {
    const { telephone, date_naissance, categorie, grade, departement_id, statut } = donnees;
    const resultat = await pool.query(
      `UPDATE enseignants SET telephone = $1, date_naissance = $2, categorie = $3, grade = $4,
       departement_id = $5, statut = $6, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [telephone || null, date_naissance || null, categorie, grade || null, departement_id || null, statut || 'actif', id]
    );
    return resultat.rows[0];
  }

  static async supprimer(id) {
    const resultat = await pool.query(`DELETE FROM enseignants WHERE id = $1 RETURNING id`, [id]);
    return resultat.rows[0];
  }
}