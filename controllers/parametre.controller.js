import pool from '../config/db.js';

export const lister = async (req, res) => {
  try {
    const [etablissement, niveaux, semestres, alertes, equivalences, taux, annees] = await Promise.all([
      pool.query(`SELECT * FROM parametres_etablissement LIMIT 1`),
      pool.query(`SELECT * FROM parametres_niveaux LIMIT 1`),
      pool.query(`SELECT * FROM parametres_semestres LIMIT 1`),
      pool.query(`SELECT * FROM parametres_alertes LIMIT 1`),
      pool.query(`SELECT * FROM equivalences ORDER BY type ASC`),
      pool.query(`SELECT * FROM taux_horaires ORDER BY categorie, type_seance`),
      pool.query(`SELECT * FROM annees_academiques ORDER BY date_debut DESC`),
    ]);

    res.json({
      succes: true,
      donnees: {
        etablissement: etablissement.rows[0] || {},
        niveaux: niveaux.rows[0] || {},
        semestres: semestres.rows[0] || {},
        alertes: alertes.rows[0] || {},
        equivalences: equivalences.rows,
        taux_horaires: taux.rows,
        annees_academiques: annees.rows,
      },
    });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

const upsertParametre = async (table, colonnes, valeurs, idRecherche) => {
  const existant = await pool.query(`SELECT id FROM ${table} LIMIT 1`);
  if (existant.rows.length > 0) {
    const setClause = colonnes.map(c => `${c} = $${colonnes.indexOf(c) + 1}`).join(', ');
    return await pool.query(
      `UPDATE ${table} SET ${setClause}, modifie_le = CURRENT_TIMESTAMP WHERE id = $${colonnes.length + 1} RETURNING *`,
      [...valeurs, existant.rows[0].id]
    );
  }
  const placeholders = colonnes.map((_, i) => `$${i + 1}`).join(', ');
  return await pool.query(
    `INSERT INTO ${table} (${colonnes.join(', ')}) VALUES (${placeholders}) RETURNING *`,
    valeurs
  );
};

export const modifierEtablissement = async (req, res) => {
  try {
    const { nom_etablissement, adresse, telephone, email, site_web, logo, logo_clair } = req.body;
    const resultat = await upsertParametre(
      'parametres_etablissement',
      ['nom_etablissement', 'adresse', 'telephone', 'email', 'site_web', 'logo', 'logo_clair'],
      [nom_etablissement, adresse, telephone, email, site_web, logo, logo_clair]
    );
    res.json({ succes: true, donnees: resultat.rows[0], message: 'Établissement modifié' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierNiveaux = async (req, res) => {
  try {
    const { niveaux } = req.body;
    const resultat = await upsertParametre('parametres_niveaux', ['niveaux'], [niveaux]);
    res.json({ succes: true, donnees: resultat.rows[0], message: 'Niveaux modifiés' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierSemestres = async (req, res) => {
  try {
    const { nombre_semestres, debut_semestre_1, fin_semestre_1, debut_semestre_2, fin_semestre_2 } = req.body;
    const resultat = await upsertParametre(
      'parametres_semestres',
      ['nombre_semestres', 'debut_semestre_1', 'fin_semestre_1', 'debut_semestre_2', 'fin_semestre_2'],
      [nombre_semestres, debut_semestre_1, fin_semestre_1, debut_semestre_2, fin_semestre_2]
    );
    res.json({ succes: true, donnees: resultat.rows[0], message: 'Semestres modifiés' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierAlertes = async (req, res) => {
  try {
    const { alerte_heures_min, seuil_heures_min, alerte_conflit_salle,
            alerte_seance_sans_salle, alerte_enseignant_inactif, rappel_validation, delai_rappel_jours } = req.body;
    const resultat = await upsertParametre(
      'parametres_alertes',
      ['alerte_heures_min', 'seuil_heures_min', 'alerte_conflit_salle',
       'alerte_seance_sans_salle', 'alerte_enseignant_inactif', 'rappel_validation', 'delai_rappel_jours'],
      [alerte_heures_min, seuil_heures_min, alerte_conflit_salle,
       alerte_seance_sans_salle, alerte_enseignant_inactif, rappel_validation, delai_rappel_jours]
    );
    res.json({ succes: true, donnees: resultat.rows[0], message: 'Alertes modifiées' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const modifierEquivalence = async (req, res) => {
  try {
    const { coefficient, description } = req.body;
    const resultat = await pool.query(
      `UPDATE equivalences SET coefficient = $1, description = $2, modifie_le = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *`,
      [coefficient, description || null, req.params.id]
    );
    if (resultat.rows.length === 0) {
      return res.status(404).json({ succes: false, message: 'Équivalence non trouvée' });
    }
    res.json({ succes: true, donnees: resultat.rows[0], message: 'Équivalence modifiée' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const creerTauxHoraire = async (req, res) => {
  try {
    const resultat = await pool.query(
      `INSERT INTO taux_horaires (categorie, type_seance, montant, annee_academique_id)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.body.categorie, req.body.type_seance, req.body.montant, req.body.annee_academique_id || null]
    );
    res.status(201).json({ succes: true, donnees: resultat.rows[0], message: 'Taux horaire créé' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const supprimerTauxHoraire = async (req, res) => {
  try {
    const resultat = await pool.query(`DELETE FROM taux_horaires WHERE id = $1 RETURNING *`, [req.params.id]);
    if (resultat.rows.length === 0) {
      return res.status(404).json({ succes: false, message: 'Taux non trouvé' });
    }
    res.json({ succes: true, message: 'Taux supprimé' });
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};