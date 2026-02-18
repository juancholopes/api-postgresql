import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';

const envTestPath = path.join(process.cwd(), '.env.test');
dotenv.config({ path: envTestPath, override: true });

const testSequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: process.env.DB_DIALECT || 'postgres',
    logging: false,
  }
);

export default testSequelize;
