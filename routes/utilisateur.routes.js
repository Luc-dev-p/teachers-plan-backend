import express from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

// GET /api/utilisateurs
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, nom, prenom, role, actif, cree_le FROM utilisateurs ORDER BY nom ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erreur utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET /api/utilisateurs/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, nom, prenom, role, actif, avatar, cree_le FROM utilisateurs WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST /api/utilisateurs
router.post('/', async (req, res) => {
  try {
    const { email, nom, prenom, mot_de_passe, role, actif } = req.body;

    const motDePasseHash = await bcrypt.hash(mot_de_passe, 10);

    const result = await pool.query(
      `INSERT INTO utilisateurs (email, nom, prenom, mot_de_passe, role, actif)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, nom, prenom, role, actif`,
      [email, nom, prenom, motDePasseHash, role || 'enseignant', actif !== undefined ? actif : true]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur création utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/utilisateurs/:id
router.put('/:id', async (req, res) => {
  try {
    const { email, nom, prenom, role, actif, avatar } = req.body;
    const result = await pool.query(
      `UPDATE utilisateurs SET email = $1, nom = $2, prenom = $3, role = $4, actif = $5, avatar = $6, modifie_le = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING id, email, nom, prenom, role, actif, avatar`,
      [email, nom, prenom, role, actif, avatar, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise à jour utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE /api/utilisateurs/:id
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM utilisateurs WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur suppression utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT /api/utilisateurs/:id/mot-de-passe
router.put('/:id/mot-de-passe', async (req, res) => {
  try {
    const { ancien_mdp, nouveau_mdp } = req.body;

    const utilisateurResult = await pool.query(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = $1',
      [req.params.id]
    );
    const utilisateur = utilisateurResult.rows[0];
    if (!utilisateur) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    const valide = await bcrypt.compare(ancien_mdp, utilisateur.mot_de_passe);
    if (!valide) {
      return res.status(401).json({ message: 'Ancien mot de passe incorrect' });
    }

    const nouveauHash = await bcrypt.hash(nouveau_mdp, 10);
    await pool.query(
      'UPDATE utilisateurs SET mot_de_passe = $1, modifie_le = CURRENT_TIMESTAMP WHERE id = $2',
      [nouveauHash, req.params.id]
    );

    res.json({ message: 'Mot de passe modifié avec succès' });
  } catch (error) {
    console.error('Erreur modification mot de passe:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

export { router };