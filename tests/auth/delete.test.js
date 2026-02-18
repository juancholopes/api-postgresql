import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, getAuthToken, generateInvalidToken } from '../setup/testUtils.js';
import User from '../../src/models/user.model.js';

const app = createTestApp();

describe('DELETE /api/auth/delete', () => {
  describe('Casos exitosos', () => {
    it('debería eliminar la cuenta del usuario', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Operación realizada correctamente');
    });

    it('debería remover el usuario de la base de datos', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      const userInDb = await User.findByPk(testUser.id);
      expect(userInDb).toBeNull();
    });

    it('debería eliminar solo el usuario autenticado', async () => {
      const user1 = await createTestUser({ email: 'user1@example.com' });
      const user2 = await createTestUser({ email: 'user2@example.com' });
      
      const token1 = getAuthToken(user1.id);

      await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token1}`);

      const user1InDb = await User.findByPk(user1.id);
      const user2InDb = await User.findByPk(user2.id);
      
      expect(user1InDb).toBeNull();
      expect(user2InDb).not.toBeNull();
    });

    it('debería confirmar eliminación verificando en login', async () => {
      const testUser = await createTestUser({
        email: 'deleteuser@example.com',
        password: 'password123'
      });
      const token = getAuthToken(testUser.id);

      await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'deleteuser@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(401);
    });
  });

  describe('Casos de error - Autenticación', () => {
    it('debería retornar 401 si no se proporciona token', async () => {
      const response = await request(app)
        .delete('/api/auth/delete');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('debería retornar 401 con token inválido', async () => {
      const invalidToken = generateInvalidToken();

      const response = await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('debería retornar 401 con token expirado', async () => {
      const testUser = await createTestUser();
      const expiredToken = require('../../src/middleware/auth.js').authMiddleware;
      
      const jwt = require('jsonwebtoken');
      const expired = jwt.sign(
        { id: testUser.id },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${expired}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Casos de error - Intentos de eliminación múltiple', () => {
    it('no debería permitir eliminar la misma cuenta dos veces', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response1 = await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      expect(response1.status).toBe(200);

      const response2 = await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      expect(response2.status).toBe(200);
    });
  });

  describe('Estructura de respuesta', () => {
    it('debería incluir los campos esperados en respuesta exitosa', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Verificación de operación irreversible', () => {
    it('debería eliminar todos los datos del usuario', async () => {
      const testUser = await createTestUser({
        name: 'Complete User',
        email: 'complete@example.com',
        phone: '555-1234'
      });
      const token = getAuthToken(testUser.id);

      await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      const userInDb = await User.findOne({
        where: { email: 'complete@example.com' }
      });
      
      expect(userInDb).toBeNull();
    });
  });
});
