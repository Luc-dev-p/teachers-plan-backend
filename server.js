import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'dotenv/config';
import { errorHandler } from './middlewares/errorHandler.js';

// Routes
import { router as authRoutes } from './routes/auth.routes.js';
import { router as utilisateurRoutes } from './routes/utilisateur.routes.js';
import { router as enseignantRoutes } from './routes/enseignant.routes.js';
import { router as dashboardRoutes } from './routes/dashboard.routes.js';
import { router as seanceRoutes } from './routes/seance.routes.js';
import { router as heureRoutes } from './routes/heure.routes.js';
import { router as matiereRoutes } from './routes/matiere.routes.js';
import { router as parametreRoutes } from './routes/parametre.routes.js';
import { router as exportRoutes } from './routes/export.routes.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/enseignants', enseignantRoutes);
app.use('/api/tableau-de-bord', dashboardRoutes);
app.use('/api/seances', seanceRoutes);
app.use('/api/heures', heureRoutes);
app.use('/api/matieres', matiereRoutes);
app.use('/api/parametres', parametreRoutes);
app.use('/api/exports', exportRoutes);

// Routes manquantes à ajouter quand les fichiers seront créés
// import { router as departementRoutes } from './routes/departement.routes.js';
// import { router as filiereRoutes } from './routes/filiere.routes.js';
// import { router as niveauRoutes } from './routes/niveau.routes.js';
// import { router as classeRoutes } from './routes/classe.routes.js';
// import { router as salleRoutes } from './routes/salle.routes.js';
// import { router as presenceRoutes } from './routes/presence.routes.js';
// app.use('/api/departements', departementRoutes);
// app.use('/api/filieres', filiereRoutes);
// app.use('/api/niveaux', niveauRoutes);
// app.use('/api/classes', classeRoutes);
// app.use('/api/salles', salleRoutes);
// app.use('/api/presences', presenceRoutes);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`✅ Teacher's Plan Backend démarré sur le port ${process.env.PORT}`);
});