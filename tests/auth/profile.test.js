import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, getAuthToken, generateExpiredToken, generateInvalidToken } from '../setup/testUtils.js';

const app = createTestApp();

describe('GET /api/auth/profile', () => {
  describe('Casos exitosos', () => {
    it('debería obtener el perfil del usuario autenticado', async () => {
      const testUser = await createTestUser({
        name: 'Profile User',
        email: 'profile@example.com',
        phone: '555-9999'
      });
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Operación realizada correctamente');
    });

    it('debería retornar los datos correctos del usuario', async () => {
      const testUser = await createTestUser({
        name: 'Test Profile',
        email: 'testprofile@example.com',
        phone: '555-1234'
      });
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.phone).toBe(testUser.phone);
    });

    it('debería retornar usuario sin contraseña', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.password).toBeUndefined();
    });

    it('debería funcionar para diferentes usuarios', async () => {
      const user1 = await createTestUser({ email: 'user1@example.com' });
      const user2 = await createTestUser({ email: 'user2@example.com' });
      
      const token1 = getAuthToken(user1.id);
      const token2 = getAuthToken(user2.id);

      const response1 = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token1}`);

      const response2 = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token2}`);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.body.user.id).toBe(user1.id);
      expect(response2.body.user.id).toBe(user2.id);
      expect(response1.body.user.email).not.toBe(response2.body.user.email);
    });
  });

  describe('Casos de error - Sin autenticación', () => {
    it('debería retornar 401 si no se proporciona token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Unauthorized');
    });

    it('debería retornar 401 con token inválido', async () => {
      const invalidToken = generateInvalidToken();

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${invalidToken}`);

      expect(response.status).toBe(401);
    });

    it('debería retornar 401 con token expirado', async () => {
      const testUser = await createTestUser();
      const expiredToken = generateExpiredToken(testUser.id);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe('Casos de error - Usuario no encontrado', () => {
    it('debería retornar 404 si el usuario no existe en la base de datos', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);
      
      await request(app)
        .delete('/api/auth/delete')
        .set('Authorization', `Bearer ${token}`);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Estructura de respuesta', () => {
    it('debería incluir todos los campos esperados', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('phone');
    });
  });
});
