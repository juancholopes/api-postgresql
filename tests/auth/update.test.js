import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, getAuthToken, generateInvalidToken } from '../setup/testUtils.js';
import User from '../../src/models/user.model.js';
import bcrypt from 'bcrypt';

const app = createTestApp();

describe('PUT /api/auth/account', () => {
  describe('Casos exitosos - Actualización de campos', () => {
    it('debería actualizar el nombre del usuario', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Nombre Actualizado' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Perfil actualizado exitosamente');
      expect(response.body.user.name).toBe('Nombre Actualizado');
    });

    it('debería actualizar el teléfono del usuario', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '999-8888' });

      expect(response.status).toBe(200);
      expect(response.body.user.phone).toBe('999-8888');
    });

    it('debería actualizar múltiples campos a la vez', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Nuevo Nombre',
          phone: '111-2222'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.name).toBe('Nuevo Nombre');
      expect(response.body.user.phone).toBe('111-2222');
    });

    it('debería actualizar la contraseña y hashearla', async () => {
      const testUser = await createTestUser({ password: 'oldpassword' });
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newpassword123' });

      expect(response.status).toBe(200);

      const userInDb = await User.findByPk(testUser.id);
      const isOldPassword = await bcrypt.compare('oldpassword', userInDb.password);
      const isNewPassword = await bcrypt.compare('newpassword123', userInDb.password);
      
      expect(isOldPassword).toBe(false);
      expect(isNewPassword).toBe(true);
    });

    it('debería reflejar los cambios en la base de datos', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated in DB' });

      const userInDb = await User.findByPk(testUser.id);
      expect(userInDb.name).toBe('Updated in DB');
    });
  });

  describe('Casos exitosos - Respuesta', () => {
    it('debería retornar los datos actualizados del usuario', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Response Test' });

      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(testUser.id);
    });

    it('debería mantener campos no actualizados', async () => {
      const testUser = await createTestUser({
        name: 'Original Name',
        email: 'original@example.com',
        phone: '555-0000'
      });
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Changed Name' });

      expect(response.body.user.email).toBe('original@example.com');
      expect(response.body.user.phone).toBe('555-0000');
    });
  });

  describe('Casos de error - Autenticación', () => {
    it('debería retornar 401 si no se proporciona token', async () => {
      const response = await request(app)
        .put('/api/auth/account')
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });

    it('debería retornar 401 con token inválido', async () => {
      const invalidToken = generateInvalidToken();

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ name: 'Test' });

      expect(response.status).toBe(401);
    });
  });

  describe('Casos edge', () => {
    it('debería aceptar body vacío sin errores', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(200);
    });

    it('debería actualizar a null si phone se envía como null', async () => {
      const testUser = await createTestUser({ phone: '555-1234' });
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: null });

      expect(response.status).toBe(200);
      expect(response.body.user.phone).toBeNull();
    });
  });

  describe('Estructura de respuesta', () => {
    it('debería incluir todos los campos esperados', async () => {
      const testUser = await createTestUser();
      const token = getAuthToken(testUser.id);

      const response = await request(app)
        .put('/api/auth/account')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Structure Test' });

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
