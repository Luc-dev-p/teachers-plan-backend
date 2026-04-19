import pool from '../config/db.js';

export default class HeureEffectuee {
  static async creer({ enseignant_id, seance_cours_id, annee_academique_id, type_seance,
                       heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, mois }) {
    const resultat = await pool.query(
      `INSERT INTO heures_effectuees (enseignant_id, seance_cours_id, annee_academique_id, type_seance,
        heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, statut, mois)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'validee', $10) RETURNING *`,
      [enseignant_id, seance_cours_id, annee_academique_id, type_seance,
       heures_reelles, coefficient, heures_equiv_td, taux_horaire, montant_calcule, mois]
    );
    return resultat.rows[0];
  }

  static async lister(filtres = {}) {
    const { departement_id, enseignant_id, mois, statut } = filtres;
    let conditions = [];
    const params = [];
    let index = 1;

    if (departement_id) { conditions.push(`e.departement_id = $${index++}`); params.push(departement_id); }
    if (enseignant_id) { conditions.push(`he.enseignant_id = $${index++}`); params.push(enseignant_id); }
    if (mois) { conditions.push(`he.mois = $${index++}`); params.push(mois); }
    if (statut) { conditions.push(`he.statut = $${index++}`); params.push(statut); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT he.*,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             e.matricule, e.categorie,
             m.nom as matiere_nom, m.code as matiere_code,
             c.nom as classe_nom, a.libelle as annee_libelle
      FROM heures_effectuees he
      JOIN enseignants e ON e.id = he.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      JOIN seances_cours sc ON sc.id = he.seance_cours_id
      JOIN matieres m ON m.id = sc.matiere_id
      JOIN classes c ON c.id = sc.classe_id
      JOIN annees_academiques a ON a.id = he.annee_academique_id
      ${where} ORDER BY u.nom ASC, he.mois ASC
    `, params);
    return resultat.rows;
  }

  static async totalHeures(filtres = {}) {
    const { departement_id, enseignant_id, mois, statut } = filtres;
    let conditions = [];
    const params = [];
    let index = 1;

    if (departement_id) { conditions.push(`e.departement_id = $${index++}`); params.push(departement_id); }
    if (enseignant_id) { conditions.push(`he.enseignant_id = $${index++}`); params.push(enseignant_id); }
    if (mois) { conditions.push(`he.mois = $${index++}`); params.push(mois); }
    if (statut) { conditions.push(`he.statut = $${index++}`); params.push(statut); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT SUM(he.heures_reelles) as total_reelles,
             SUM(he.heures_equiv_td) as total_equiv_td,
             SUM(he.montant_calcule) as total_montant,
             COUNT(DISTINCT he.enseignant_id) as nb_enseignants
      FROM heures_effectuees he
      JOIN enseignants e ON e.id = he.enseignant_id
      ${where}
    `, params);
    return resultat.rows[0];
  }
}