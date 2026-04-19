import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, mot_de_passe } = req.body;

    console.log('=== TENTATIVE LOGIN ===');
    console.log('Email reçu:', email);
    console.log('Mot de passe reçu:', mot_de_passe);

    if (!email || !mot_de_passe) {
      console.log('❌ Email ou mot de passe manquant');
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const result = await pool.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    const utilisateur = result.rows[0];
    console.log('Utilisateur trouvé:', utilisateur ? utilisateur.email : 'NON TROUVÉ');

    if (!utilisateur) {
      console.log('❌ Email non trouvé en base');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    console.log('Hash en base:', utilisateur.mot_de_passe);

    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    console.log('Mot de passe valide:', motDePasseValide);

    if (!motDePasseValide) {
      console.log('❌ Mot de passe incorrect');
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    const token = jwt.sign(
      {
        id: utilisateur.id,
        email: utilisateur.email,
        role: utilisateur.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    console.log('✅ Connexion réussie !');

    res.json({
      token,
      utilisateur: {
        id: utilisateur.id,
        email: utilisateur.email,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        role: utilisateur.role,
      },
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});
export { router };