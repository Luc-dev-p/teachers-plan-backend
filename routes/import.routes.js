import express from 'express';
import multer from 'multer';
import pool from '../config/db.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers Excel sont acceptés'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// POST /api/import/enseignants
router.post('/enseignants', upload.single('fichier'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Fichier requis' });
    }

    // Placeholder - nécessite xlsx pour parser
    res.json({
      message: 'Import des enseignants en cours de traitement',
      fichier: req.file.originalname,
    });
  } catch (error) {
    console.error('Erreur import enseignants:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/import/seances
router.post('/seances', upload.single('fichier'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Fichier requis' });
    }

    res.json({
      message: 'Import des séances en cours de traitement',
      fichier: req.file.originalname,
    });
  } catch (error) {
    console.error('Erreur import séances:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };