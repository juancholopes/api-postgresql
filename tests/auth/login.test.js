import request from 'supertest';
import createTestApp from '../setup/testApp.js';
import { createTestUser, getAuthToken } from '../setup/testUtils.js';
import jwt from 'jsonwebtoken';

const app = createTestApp();

describe('POST /api/auth/login', () => {
  describe('Casos exitosos', () => {
    it('debería iniciar sesión con credenciales válidas', async () => {
      const testUser = await createTestUser({
        email: 'login@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Operación realizada correctamente');
      expect(response.body.token).toBeDefined();
      expect(response.body.user).toBeDefined();
    });

    it('debería retornar un token JWT válido', async () => {
      const testUser = await createTestUser({
        email: 'jwt@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'jwt@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();

      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET);
      expect(decoded.id).toBe(testUser.id);
    });

    it('debería retornar información del usuario sin contraseña', async () => {
      const testUser = await createTestUser({
        email: 'userinfo@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'userinfo@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(testUser.id);
      expect(response.body.user.name).toBe(testUser.name);
      expect(response.body.user.email).toBe(testUser.email);
      expect(response.body.user.phone).toBe(testUser.phone);
      expect(response.body.user.password).toBeUndefined();
    });

    it('debería generar token con expiración de 1 hora', async () => {
      const testUser = await createTestUser({
        email: 'expire@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'expire@example.com',
          password: 'password123'
        });

      const decoded = jwt.decode(response.body.token);
      const currentTime = Math.floor(Date.now() / 1000);
      const expectedExpiration = currentTime + 3600;
      
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiration + 5);
    });
  });

  describe('Casos de error - Credenciales inválidas', () => {
    it('debería retornar error 401 si el usuario no existe', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Acceso denegado');
    });

    it('debería retornar error 401 si la contraseña es incorrecta', async () => {
      await createTestUser({
        email: 'wrongpass@example.com',
        password: 'correctpassword'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Credenciales incorrectas');
    });

    it('debería retornar error 401 con email y contraseña incorrectos', async () => {
      await createTestUser({
        email: 'both@example.com',
        password: 'correctpass'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpass'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Casos de error - Validaciones', () => {
    it('debería retornar error 400 si falta el email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Datos inválidos');
    });

    it('debería retornar error 400 si falta la contraseña', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('debería retornar error 400 si el body está vacío', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Estructura de respuesta', () => {
    it('debería incluir todos los campos esperados en respuesta exitosa', async () => {
      const testUser = await createTestUser({
        email: 'structure@example.com',
        password: 'password123'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'structure@example.com',
          password: 'password123'
        });

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user).toHaveProperty('name');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).toHaveProperty('phone');
    });
  });
});
