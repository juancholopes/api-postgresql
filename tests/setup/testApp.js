import express from 'express';
import authRoutes from '../../src/routes/auth.routes.js';

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  return app;
};

export default createTestApp;
