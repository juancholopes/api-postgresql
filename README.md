

# Authentication API built with Node.js and PostgreSQL

A REST API for user registration and authentication built with Node.js, Express.js, Sequelize, and PostgreSQL.

## 🚀 Features

- ✅ User registration with validation
- ✅ Password encryption with bcrypt
- ✅ PostgreSQL database with Sequelize ORM
- ✅ Database migrations
- ✅ Clean Architecture
- ✅ Separation of concerns (Routes, Controllers, Models)
- ✅ Proper HTTP status codes
- ✅ Input data validation

## 🛠️ Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **Sequelize** - ORM for database
- **bcrypt** - Password encryption
- **dotenv** - Environment variables

## 📁 Project Structure

```
.
├── .env.example
├── package.json
├── package-lock.json
├── README.md
├── .sequelizerc
└── src
    ├── config
    │   └── config.json
    ├── controllers
    │   ├── delete.controller.js
    │   ├── login.controller.js
    │   ├── logout.controller.js
    │   ├── profile.controller.js
    │   ├── register.controller.js
    │   └── update.controller.js
    ├── db.js
    ├── index.js
    ├── middleware
    │   └── auth.js
    ├── migrations
    │   └── 20250709233401-create-users-table.js
    ├── models
    │   └── user.model.js
    └── routes
        └── auth.routes.js
```

## ⚡ Installation and Usage

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL
- npm

### 1. Clone the repository

```bash
git clone <repository-url>
cd api-auth
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=authdb
DB_PORT=5432
```

### 4. Set up the database

```bash
# Create the database
sudo -u postgres createdb authdb

# Run migrations
npx sequelize-cli db:migrate
```

### 5. Run the application

```bash
node src/index.js
```


## � Useful Commands

### PostgreSQL on WSL (Arch Linux)

```bash
# Create required directory for PostgreSQL
sudo mkdir -p /run/postgresql && sudo chown postgres:postgres /run/postgresql

# Start PostgreSQL
sudo -u postgres pg_ctl start -D /var/lib/postgres/data

# Check status
sudo -u postgres pg_ctl status -D /var/lib/postgres/data

# Stop PostgreSQL
sudo -u postgres pg_ctl stop -D /var/lib/postgres/data
```

### Development commands with cURL

```bash
# User registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456",
    "phone": "555-0000"
  }'

# User login (get JWT)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'

# Get profile (replace <TOKEN> with your JWT)
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <TOKEN>"

# Update profile
curl -X PUT http://localhost:3001/api/auth/account \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated User",
    "phone": "555-1111"
  }'

# Delete account
curl -X DELETE http://localhost:3001/api/auth/delete \
  -H "Authorization: Bearer <TOKEN>"

# Logout
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer <TOKEN>"
```

The server will be available at `http://localhost:3001`

## 📡 API Endpoints

### User Registration

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "123456",
  "phone": "555-1234"
}
```

**Successful response (201):**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "555-1234"
  }
}
```

### User Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "123456"
}
```
**Successful response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "phone": "555-1234"
  }
}
```

## 🔒 Security

- Passwords are hashed with bcrypt (saltRounds: 10)
- Passwords are never returned in responses
- Unique email validation
- Required fields validation

## 🧠 Applied Concepts

- **Clean Architecture**: Clear separation between routes, controllers, and models
- **ORM**: Using Sequelize for database abstraction
- **Migrations**: Database schema version control
- **Password hashing**: Security with bcrypt and salt
- **REST API**: Endpoints following REST conventions
- **HTTP Codes**: Proper use of status codes

## 📝 Next Features

- [x] User login
- [x] Authentication middleware
- [x] JWT tokens
- [x] Logout
- [x] Profile update
- [x] Account deletion
- [ ] Rate Limiting

**Developed as a backend development learning project with Node.js**
