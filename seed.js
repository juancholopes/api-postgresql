import sequelize from './src/db.js';
import User from './src/models/user.model.js';
import bcrypt from 'bcrypt';

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const users = [
      {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        password: 'password123',
        phone: '555-0001'
      },
      {
        name: 'Carlos Rodriguez',
        email: 'carlos@example.com',
        password: 'password123',
        phone: '555-0002'
      },
      {
        name: 'Ana Martinez',
        email: 'ana@example.com',
        password: 'password123',
        phone: '555-0003'
      }
    ];

    for (const user of users) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password, 10);
        try {
            await User.create({
                ...user,
                password: hashedPassword
            });
            console.log(`User ${user.name} created.`);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                console.log(`User ${user.name} already exists.`);
            } else {
                console.error(`Error creating ${user.name}:`, error);
            }
        }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

seedDatabase();
