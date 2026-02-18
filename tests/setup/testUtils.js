import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { defineUser } from '../../src/models/user.model.js';
import testSequelize from './testDb.js';

const User = defineUser(testSequelize);

export const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    phone: '555-1234'
  };

  const userToCreate = { ...defaultUser, ...userData };
  
  const hashedPassword = await bcrypt.hash(userToCreate.password, 10);
  
  const user = await User.create({
    name: userToCreate.name,
    email: userToCreate.email,
    password: hashedPassword,
    phone: userToCreate.phone
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    plainPassword: userToCreate.password
  };
};

export const getAuthToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const clearDatabase = async () => {
  await User.destroy({ where: {}, truncate: true, cascade: true });
};

export const closeDatabase = async () => {
  await testSequelize.close();
};

export const generateExpiredToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '-1h' }
  );
};

export const generateInvalidToken = () => {
  return 'invalid.token.here';
};

export const createMultipleUsers = async (count = 3) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      email: `user${i}@example.com`,
      name: `User ${i}`
    });
    users.push(user);
  }
  return users;
};
