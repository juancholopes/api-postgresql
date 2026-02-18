import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, getAuthToken, generateInvalidToken } from '../setup/testUtils.js';

const app = createTestApp();

describe('POST /api/auth/logout', () => {
  describe('Casos exitosos', () => {
    it('debería cerrar sesión exitosamente', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Operación realizada correctamente');
    });

    it('debería retornar respuesta de éxito con usuario autenticado', async () => {
      const testUser = await createTestUser({
        name: 'Logout User',
        email: 'logout@example.com'
      });
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('Casos de error - Autenticación', () => {
    it('debería retornar 401 si no se proporciona token', async () => {
      const response = await request(app)
        .post('/api/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('debería retornar 401 con token inválido', async () => {
      const invalidToken = generateInvalidToken();

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('debería retornar 401 con header Authorization malformado', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', token);

      expect(response.status).toBe(401);
    });

    it('debería retornar 401 con token expirado', async () => {
      const testUser = await createTestUser();
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Comportamiento del token JWT', () => {
    it('el token debería seguir siendo válido después del logout (limitación conocida)', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(profileResponse.status).toBe(200);
    });
  });

  describe('Estructura de respuesta', () => {
    it('debería incluir los campos esperados en respuesta exitosa', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Múltiples logout', () => {
    it('debería permitir múltiples logout con el mismo token', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response1 = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      const response2 = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
    });
  });
});
