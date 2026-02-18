import request from 'supertest';
import express from 'express';
import { authMiddleware } from '../../src/middleware/auth.js';
import { createTestUser, getAuthToken, generateExpiredToken, generateInvalidToken } from '../setup/testUtils.js';

const createTestAppWithMiddleware = () => {
  const app = express();
  app.use(express.json());
  
  app.get('/protected', authMiddleware, (req, res) => {
    res.json({ success: true, userId: req.userId });
  });
  
  return app;
};

describe('Auth Middleware', () => {
  describe('Casos exitosos', () => {
    it('debería permitir acceso con token válido', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('debería adjuntar userId al request con token válido', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.userId).toBe(testUser.id);
    });
  });

  describe('Casos de error - Token ausente', () => {
    it('debería retornar 401 si no hay header Authorization', async () => {
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('debería retornar 401 si el header Authorization está vacío', async () => {
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });
  });

  describe('Casos de error - Token inválido', () => {
    it('debería retornar 401 con token malformado', async () => {
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalidtoken');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No autorizado');
    });

    it('debería retornar 401 con token expirado', async () => {
      const testUser = await createTestUser();
      const expiredToken = generateExpiredToken(testUser.id);
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('No autorizado');
    });

    it('debería retornar 401 con token completamente inválido', async () => {
      const invalidToken = generateInvalidToken();
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('debería retornar 401 con token que tiene firma incorrecta', async () => {
      const testUser = await createTestUser();
      const wrongSecretToken = require('jsonwebtoken').sign(
        { id: testUser.id },
        'wrong_secret',
        { expiresIn: '1h' }
      );
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${wrongSecretToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Formato del header Authorization', () => {
    it('debería fallar si no incluye "Bearer" en el header', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', token);

      expect(response.status).toBe(401);
    });

    it('debería funcionar con "Bearer" (case sensitive)', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);
      const app = createTestAppWithMiddleware();

      const response = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
    });
  });
});
