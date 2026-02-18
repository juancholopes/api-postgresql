import testSequelize from './testDb.js';
import { clearDatabase } from './testUtils.js';

beforeAll(async () => {
  try {
    await testSequelize.authenticate();
    await testSequelize.sync({ force: true });
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    process.exit(1);
  }
});

afterEach(async () => {
  await clearDatabase();
});

afterAll(async () => {
  await testSequelize.close();
});
