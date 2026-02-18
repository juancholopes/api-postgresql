import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, clearDatabase } from '../setup/testUtils.js';
import User from '../../src/models/user.model.js';
import bcrypt from 'bcrypt';

const app = createTestApp();

describe('POST /api/auth/register', () => {
  describe('Casos exitosos', () => {
    it('debería registrar un usuario con todos los campos', async () => {
      const userData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
        phone: '555-1234'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Operación realizada correctamente');
      expect(response.body.user).toBeDefined();
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.phone).toBe(userData.phone);
      expect(response.body.user.id).toBeDefined();
      expect(response.body.user.password).toBeUndefined();

      const userInDb = await User.findOne({ where: { email: userData.email } });
      expect(userInDb).toBeDefined();
    });

    it('debería registrar un usuario con campos mínimos requeridos', async () => {
      const userData = {
        name: 'Test User',
        email: 'minimal@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user.email).toBe(userData.email);
    });

    it('debería hashear la contraseña correctamente', async () => {
      const userData = {
        name: 'Test Hash',
        email: 'hash@example.com',
        password: 'plainPassword'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);

      const userInDb = await User.findOne({ where: { email: userData.email } });
      expect(userInDb.password).not.toBe(userData.password);
      
      const isMatch = await bcrypt.compare(userData.password, userInDb.password);
      expect(isMatch).toBe(true);
    });

    it('debería asignar null al teléfono si no se proporciona', async () => {
      const userData = {
        name: 'No Phone User',
        email: 'nophone@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.user.phone).toBeNull();
    });
  });

  describe('Casos de error - Validaciones', () => {
    it('debería retornar error 400 si falta el nombre', async () => {
      const userData = {
        email: 'noemail@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos inválidos');
    });

    it('debería retornar error 400 si falta el email', async () => {
      const userData = {
        name: 'Test User',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 400 si falta la contraseña', async () => {
      const userData = {
        name: 'Test User',
        email: 'nopass@example.com'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 400 si el body está vacío', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Casos de error - Email duplicado', () => {
    it('debería retornar error 409 si el email ya existe', async () => {
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'password123'
      };

      await createTestUser({ email: userData.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('El correo electrónico ya está en uso');
    });

    it('debería retornar error 409 con email duplicado case-insensitive', async () => {
      await createTestUser({ email: 'test@example.com' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'TEST@EXAMPLE.COM',
          password: 'password123'
        });

      expect(response.status).toBe(409);
    });
  });

  describe('Estructura de respuesta', () => {
    it('debería incluir todos los campos esperados en la respuesta exitosa', async () => {
      const userData = {
        name: 'Complete User',
        email: 'complete@example.com',
        password: 'password123',
        phone: '555-9999'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

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
