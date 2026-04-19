import pool from '../config/db.js';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

export const exportHeuresExcel = async (req, res) => {
  try {
    const { annee_academique_id, departement_id, mois } = req.query;

    let conditions = [];
    const params = [];
    let index = 1;

    if (annee_academique_id) { conditions.push(`he.annee_academique_id = $${index++}`); params.push(annee_academique_id); }
    if (departement_id) { conditions.push(`e.departement_id = $${index++}`); params.push(departement_id); }
    if (mois) { conditions.push(`he.mois = $${index++}`); params.push(mois); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT u.nom, u.prenom, e.matricule, e.categorie, d.nom as departement,
             he.type_seance, he.heures_reelles, he.coefficient, he.heures_equiv_td,
             he.taux_horaire, he.montant_calcule, he.mois
      FROM heures_effectuees he
      JOIN enseignants e ON e.id = he.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON d.id = e.departement_id
      ${where} ORDER BY d.nom, u.nom, he.mois
    `, params);

    const classeur = new ExcelJS.Workbook();
    const feuille = classeur.addWorksheet('Heures Effectuées');

    feuille.columns = [
      { header: 'Nom', key: 'nom', width: 20 },
      { header: 'Prénom', key: 'prenom', width: 20 },
      { header: 'Matricule', key: 'matricule', width: 18 },
      { header: 'Catégorie', key: 'categorie', width: 15 },
      { header: 'Département', key: 'departement', width: 20 },
      { header: 'Type', key: 'type_seance', width: 8 },
      { header: 'Heures', key: 'heures_reelles', width: 10 },
      { header: 'Coeff.', key: 'coefficient', width: 8 },
      { header: 'Équiv. TD', key: 'heures_equiv_td', width: 10 },
      { header: 'Taux', key: 'taux_horaire', width: 12 },
      { header: 'Montant', key: 'montant_calcule', width: 15 },
      { header: 'Mois', key: 'mois', width: 10 },
    ];

    feuille.addRows(resultat.rows);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=heures-effectuees.xlsx');

    await classeur.xlsx.write(res);
    res.end();
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const exportHeuresPDF = async (req, res) => {
  try {
    const { annee_academique_id, departement_id, mois } = req.query;

    let conditions = [];
    const params = [];
    let index = 1;

    if (annee_academique_id) { conditions.push(`he.annee_academique_id = $${index++}`); params.push(annee_academique_id); }
    if (departement_id) { conditions.push(`e.departement_id = $${index++}`); params.push(departement_id); }
    if (mois) { conditions.push(`he.mois = $${index++}`); params.push(mois); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const resultat = await pool.query(`
      SELECT u.nom, u.prenom, e.matricule, e.categorie, d.nom as departement,
             SUM(he.heures_reelles) as total_reelles, SUM(he.heures_equiv_td) as total_equiv_td,
             SUM(he.montant_calcule) as total_montant
      FROM heures_effectuees he
      JOIN enseignants e ON e.id = he.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      LEFT JOIN departements d ON d.id = e.departement_id
      ${where}
      GROUP BY u.nom, u.prenom, e.matricule, e.categorie, d.nom
      ORDER BY d.nom, u.nom
    `, params);

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=heures-effectuees.pdf');
    doc.pipe(res);

    doc.fontSize(20).text("Rapport d'Heures Effectuées", { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`);
    doc.moveDown(1);

    resultat.rows.forEach((ligne) => {
      doc.fontSize(11).text(`${ligne.prenom} ${ligne.nom} (${ligne.matricule})`);
      doc.fontSize(9).text(`  ${ligne.departement || 'Non assigné'} | ${ligne.categorie}`);
      doc.fontSize(9).text(`  Heures : ${ligne.total_reelles} | Équiv TD : ${ligne.total_equiv_td} | Montant : ${ligne.total_montant} FCFA`);
      doc.moveDown(0.5);
    });

    doc.end();
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};

export const exportSeancesExcel = async (req, res) => {
  try {
    const { annee_academique_id, classe_id, date_debut, date_fin } = req.query;

    let conditions = ["s.statut != 'annulee'"];
    const params = [];
    let index = 1;

    if (annee_academique_id) { conditions.push(`s.annee_academique_id = $${index++}`); params.push(annee_academique_id); }
    if (classe_id) { conditions.push(`s.classe_id = $${index++}`); params.push(classe_id); }
    if (date_debut) { conditions.push(`s.date >= $${index++}`); params.push(date_debut); }
    if (date_fin) { conditions.push(`s.date <= $${index++}`); params.push(date_fin); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const resultat = await pool.query(`
      SELECT s.date, s.heure_debut, s.heure_fin, s.type_seance, s.statut, s.nombre_heures,
             u.nom as enseignant_nom, u.prenom as enseignant_prenom,
             m.nom as matiere_nom, c.nom as classe_nom, sl.nom as salle_nom
      FROM seances_cours s
      JOIN enseignants e ON e.id = s.enseignant_id
      JOIN utilisateurs u ON u.id = e.utilisateur_id
      JOIN matieres m ON m.id = s.matiere_id
      JOIN classes c ON c.id = s.classe_id
      JOIN salles sl ON sl.id = s.salle_id
      ${where} ORDER BY s.date ASC, s.heure_debut ASC
    `, params);

    const classeur = new ExcelJS.Workbook();
    const feuille = classeur.addWorksheet('Séances de Cours');

    feuille.columns = [
      { header: 'Date', key: 'date', width: 12 },
      { header: 'Début', key: 'heure_debut', width: 8 },
      { header: 'Fin', key: 'heure_fin', width: 8 },
      { header: 'Type', key: 'type_seance', width: 8 },
      { header: 'Enseignant', key: 'enseignant', width: 25 },
      { header: 'Matière', key: 'matiere_nom', width: 25 },
      { header: 'Classe', key: 'classe_nom', width: 22 },
      { header: 'Salle', key: 'salle_nom', width: 18 },
      { header: 'Heures', key: 'nombre_heures', width: 10 },
      { header: 'Statut', key: 'statut', width: 12 },
    ];

    feuille.addRows(resultat.rows.map(r => ({
      ...r,
      enseignant: `${r.enseignant_prenom} ${r.enseignant_nom}`,
    })));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=seances-cours.xlsx');
    await classeur.xlsx.write(res);
    res.end();
  } catch (erreur) {
    res.status(500).json({ succes: false, message: erreur.message });
  }
};