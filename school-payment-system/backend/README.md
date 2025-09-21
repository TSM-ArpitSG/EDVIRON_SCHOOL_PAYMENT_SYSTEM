

**Built with ❤️ for Edviron Software Developer Assessment**

# 🏫 School Payment System Backend

**Written by:** Arpit Singh  
**Assessment:** EDVIRON Software Developer Assessment  
**Technology Stack:** Node.js, NestJS, MongoDB Atlas, TypeScript

## 📋 **Project Overview**

A comprehensive payment processing backend system built with NestJS framework, featuring real payment gateway integration with Edviron APIs, JWT authentication, webhook handling, and advanced transaction management capabilities.

## ✨ **Key Features**

- 🔐 **JWT Authentication System** - Secure user registration and login
- 💳 **Real Payment Gateway Integration** - Edviron API with JWT signing
- 📊 **Advanced Transaction Management** - MongoDB aggregation pipelines
- 🔄 **Webhook Processing** - Real-time payment status updates
- 🎯 **Comprehensive API Endpoints** - RESTful APIs with filtering, pagination, and sorting
- 🛡️ **Security & Validation** - Input validation and error handling
- 📈 **Production Ready** - Environment configuration and professional architecture

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js (v16 or higher) - [Download](https://nodejs.org/)
- npm (v8 or higher)
- MongoDB Atlas account - [Sign up](https://cloud.mongodb.com/)
- Git

### **Installation**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd school-payment-system/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   # Create .env file in the backend root directory
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   ```bash
   # Edit .env file with your credentials
   nano .env
   ```

5. **Build the Application**
   ```bash
   npm run build
   ```

6. **Start Development Server**
   ```bash
   npm run start:dev
   ```

## ⚙️ **Environment Configuration**

Create a `.env` file in the backend root directory with the following variables:

```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
DATABASE_NAME=school_payment_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_2024
JWT_EXPIRES_IN=24h

# Payment Gateway Configuration (Edviron Assessment Credentials)
PAYMENT_PG_KEY=edvtest01
PAYMENT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0
SCHOOL_ID=65b0e6293e9f76a9694d84b4

# Server Configuration
PORT=3000
NODE_ENV=development
```

### **MongoDB Atlas Setup**

1. Create MongoDB Atlas account at [cloud.mongodb.com](https://cloud.mongodb.com/)
2. Create a new cluster (Free tier available)
3. Create database user with username and password
4. Add your IP address to Network Access
5. Get connection string and update `MONGODB_URI` in `.env`

## 🔗 **API Endpoints**

### **Base URL:** `http://localhost:3000`

### **Authentication Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | User registration | ❌ |
| POST | `/auth/login` | User login | ❌ |

### **Core API Endpoints**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Health check | ❌ |
| GET | `/test-db` | Database connectivity test | ❌ |
| GET | `/orders/test` | Orders service test | ❌ |
| GET | `/orders/test-auth` | JWT authentication test | ✅ |
| POST | `/orders/create-payment` | Create new payment | ✅ |
| POST | `/orders/webhook` | Payment status webhook | ❌ |
| GET | `/orders/transactions` | Get all transactions | ✅ |
| GET | `/orders/transactions/school/:schoolId` | Get school-specific transactions | ✅ |
| GET | `/orders/transaction-status/:id` | Get transaction status by ID | ✅ |

### **Query Parameters**

#### **Transactions Endpoints Support:**

- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10)
- `status` - Filter by status (success, pending, failed)
- `start_date` - Start date filter (YYYY-MM-DD)
- `end_date` - End date filter (YYYY-MM-DD)
- `sortBy` - Sort field (payment_time, order_amount, etc.)
- `sortOrder` - Sort direction (asc, desc)

## 📝 **API Usage Examples**

### **1. User Registration**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **2. User Login**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### **3. Create Payment**
```bash
curl -X POST http://localhost:3000/orders/create-payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 100,
    "student_info": {
      "name": "John Doe",
      "id": "S12345",
      "email": "john.doe@example.com"
    }
  }'
```

### **4. Get All Transactions**
```bash
curl -X GET "http://localhost:3000/orders/transactions?page=1&limit=10&status=success" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **5. Webhook Processing**
```bash
curl -X POST http://localhost:3000/orders/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": 200,
    "order_info": {
      "order_id": "ORD_1234567890_abc123",
      "order_amount": 100,
      "transaction_amount": 100,
      "gateway": "PayU",
      "status": "success",
      "payment_mode": "credit_card",
      "payment_details": "Payment successful",
      "payment_message": "Transaction completed",
      "payment_time": "2024-01-01 12:00:00"
    }
  }'
```

## 📮 **Postman Collection**

### **Import Collection**

Create a new collection in Postman with the following requests:

1. **Create Collection:** "School Payment System API"
2. **Set Base URL Variable:** `{{baseUrl}}` = `http://localhost:3000`
3. **Add Authorization Token Variable:** `{{authToken}}` = `Bearer YOUR_JWT_TOKEN`

### **Request Examples:**

#### **Authentication**
- **Register User:** POST `{{baseUrl}}/auth/register`
- **Login User:** POST `{{baseUrl}}/auth/login`

#### **Payments**
- **Create Payment:** POST `{{baseUrl}}/orders/create-payment`
- **Process Webhook:** POST `{{baseUrl}}/orders/webhook`

#### **Transactions**
- **All Transactions:** GET `{{baseUrl}}/orders/transactions`
- **School Transactions:** GET `{{baseUrl}}/orders/transactions/school/:schoolId`
- **Transaction Status:** GET `{{baseUrl}}/orders/transaction-status/:id`

### **Environment Variables for Postman:**
```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "schoolId": "65b0e6293e9f76a9694d84b4"
}
```

## 🗄️ **Database Schema**

### **Collections:**

1. **users** - User authentication data
2. **orders** - Basic payment order information
3. **orderstatuses** - Detailed payment status and transaction data
4. **webhooklogs** - Audit logs for webhook events

### **Key Relationships:**
- `Order.custom_order_id` ↔ `OrderStatus.order_id`
- `Order._id` ↔ `OrderStatus.collect_id`

## 🧪 **Testing**

### **Unit Tests**
```bash
npm run test
```

### **E2E Tests**
```bash
npm run test:e2e
```

### **Manual Testing Checklist**
- [ ] Server startup and database connection
- [ ] User registration and login
- [ ] JWT token validation
- [ ] Payment creation with Edviron API
- [ ] Webhook processing
- [ ] Transaction queries with filtering
- [ ] Error handling for edge cases

## 📦 **Available Scripts**

```bash
# Development
npm run start:dev          # Start in development mode with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start in production mode

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

## 🏗️ **Project Structure**

```
backend/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   └── jwt.strategy.ts
│   ├── orders/            # Orders/payments module
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   └── orders.module.ts
│   ├── schemas/           # MongoDB schemas
│   │   ├── order.schema.ts
│   │   ├── order-status.schema.ts
│   │   ├── user.schema.ts
│   │   └── webhook-logs.schema.ts
│   ├── common/            # Shared utilities
│   │   └── http-exception.filter.ts
│   ├── app.controller.ts  # Root controller
│   ├── app.service.ts     # Root service
│   ├── app.module.ts      # Root module
│   └── main.ts           # Application entry point
├── .env                   # Environment variables
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🔧 **Technology Stack**

- **Framework:** NestJS (Node.js)
- **Language:** TypeScript
- **Database:** MongoDB Atlas
- **Authentication:** JWT with Passport
- **Payment Gateway:** Edviron API
- **Validation:** class-validator, class-transformer
- **Security:** bcryptjs for password hashing
- **Documentation:** Swagger/OpenAPI (optional)

## 🛡️ **Security Features**

- JWT-based authentication with 24-hour expiration
- bcrypt password hashing with salt rounds
- Input validation and sanitization
- Global exception handling
- CORS configuration
- Environment variable protection

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **MongoDB Connection Failed**
   - Check MongoDB Atlas credentials
   - Verify IP whitelist in MongoDB Atlas
   - Ensure correct connection string format

2. **JWT Token Expired**
   - Re-authenticate to get new token
   - Check JWT_EXPIRES_IN configuration

3. **Payment API Errors**
   - Verify Edviron API credentials
   - Check PAYMENT_API_KEY and SCHOOL_ID

4. **Port Already in Use**
   - Change PORT in .env file
   - Kill existing process: `lsof -ti:3000 | xargs kill -9`

## 📞 **Support**

For technical support or questions:
- **Developer:** Arpit Singh
- **Assessment:** EDVIRON Software Developer Assessment
- **Documentation:** This README and detailed implementation guide

## 📄 **License**

This project is created for the EDVIRON Software Developer Assessment.

---

**🎉 Ready to start development!** Follow the setup instructions and refer to the API documentation for implementation details.
