import pool from '../config/db.js';

export default class JournalAction {
  static async enregistrer({ utilisateur_id, action, entite, entite_id, adresse_ip }) {
    const resultat = await pool.query(
      `INSERT INTO journal_audit (utilisateur_id, action, entite, entite_id, adresse_ip) VALUES ($1, $2, $3, $4, $5)`,
      [utilisateur_id, action, entite, entite_id, adresse_ip]
    );
    return resultat.rows[0];
  }

  static async lister({ utilisateur_id, entite, date_debut, date_fin } = {}) {
    let conditions = [];
    const params = [];
    let index = 1;

    if (utilisateur_id) { conditions.push(`utilisateur_id = $${index++}`); params.push(utilisateur_id); }
    if (entite) { conditions.push(`entite = $${index++}`); params.push(entite); }
    if (date_debut) { conditions.push(`cree_le >= $${index++}`); params.push(date_debut); }
    if (date_fin) { conditions.push(`cree_le <= $${index++}`); params.push(date_fin); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT j.*, u.nom, u.prenom, u.role
      FROM journal_audit j
      LEFT JOIN utilisateurs u ON u.id = j.utilisateur_id
      ${where} ORDER BY j.cree_le DESC LIMIT 100
    `, params);
    return resultat.rows;
  }
}