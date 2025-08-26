# 🎓 Student Opportunities Portal - Backend Documentation

## 📁 Backend Structure

```
backend/
├── 📂 config/
│   └── database.js          # MongoDB connection configuration
├── 📂 controllers/          # Business logic for each route
│   ├── authController.js    # Authentication logic
│   ├── applicationController.js # Application handling
│   ├── opportunityController.js # Opportunity management
│   └── userController.js    # User management
├── 📂 middleware/           # Custom middleware functions
│   ├── auth.js             # Authentication & authorization
│   └── validation.js       # Request validation
├── 📂 models/              # MongoDB data models
│   ├── User.js             # User schema
│   ├── Application.js      # Application schema
│   ├── Opportunity.js      # Opportunity schema
│   └── Newsletter.js       # Newsletter subscription schema
├── 📂 routes/              # API route definitions
│   ├── auth.js             # Authentication routes
│   ├── applications.js     # Application routes
│   ├── opportunities.js    # Opportunity routes
│   ├── users.js            # User management routes
│   └── newsletter.js       # Newsletter routes
├── 📂 utils/               # Utility functions
│   ├── emailService.js     # Email sending functionality
│   └── upload.js          # File upload handling
├── 📂 uploads/             # Uploaded files storage
├── .env                   # Environment variables
├── package.json           # Dependencies and scripts
└── server.js             # Main server entry point
```

## 📋 File Purposes & Descriptions

### 🚀 Server Entry Point
**`server.js`** - Main application file that:
- Sets up Express server
- Connects to MongoDB
- Configures middleware
- Registers all API routes
- Handles error processing
- Serves static files

### 🔐 Configuration
**`config/database.js`** - MongoDB connection setup with error handling

### 🧾 Data Models

**`models/User.js`** - User schema with:
- Personal information (name, email, password)
- Demographic data (gender, race, etc.)
- Education background
- Contact information
- File uploads (resume, profile photo)
- Authentication fields

**`models/Opportunity.js`** - Opportunity/Bursary schema with:
- Title, description, and type
- Provider information
- Eligibility criteria
- Funding details
- Application deadline and process
- Contact information

**`models/Application.js`** - Application tracking with:
- Applicant and opportunity references
- Application status tracking
- Answers to application questions
- Document submissions
- Timestamps

**`models/Newsletter.js`** - Email subscription management

### ⚙️ Controllers

**`controllers/authController.js`** - Handles:
- User registration with password hashing
- User login with JWT generation
- Profile retrieval and updates
- Password management

**`controllers/opportunityController.js`** - Manages:
- Opportunity CRUD operations
- Filtering and searching
- Pagination
- View counting

**`controllers/applicationController.js`** - Processes:
- Application submission
- Status updates
- Application retrieval
- Duplicate prevention

**`controllers/userController.js`** - Administers:
- User management (admin only)
- User application history
- Profile updates

### 🛣️ API Routes

**`routes/auth.js`** - Authentication endpoints:
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

**`routes/opportunities.js`** - Opportunity endpoints:
- `GET /api/opportunities` - List opportunities (with filters)
- `GET /api/opportunities/:id` - Get specific opportunity
- `POST /api/opportunities` - Create opportunity (admin)
- `PUT /api/opportunities/:id` - Update opportunity (admin)
- `DELETE /api/opportunities/:id` - Delete opportunity (admin)

**`routes/applications.js`** - Application endpoints:
- `GET /api/applications` - Get user's applications
- `GET /api/applications/:id` - Get specific application
- `POST /api/applications` - Submit new application
- `PUT /api/applications/:id/status` - Update status (admin)

**`routes/users.js`** - User management endpoints (admin only):
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get specific user
- `GET /api/users/:id/applications` - Get user's applications
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

**`routes/newsletter.js`** - Newsletter endpoints:
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/newsletter/unsubscribe` - Unsubscribe from newsletter

### 🛡️ Middleware

**`middleware/auth.js`** - Authentication middleware:
- `protect` - Verifies JWT tokens
- `admin` - Restricts access to admin users only

**`middleware/validation.js`** - Request validation:
- Validates user registration data
- Validates user login data
- Validates opportunity data

### 📧 Utilities

**`utils/emailService.js`** - Email functionality:
- Welcome emails for new users
- Application confirmation emails
- Status update notifications

**`utils/upload.js`** - File upload handling:
- Configures Multer for file storage
- Validates file types (images/documents)
- Sets file size limits

## 🔐 Environment Variables (.env)

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:3000
PORT=5000
```

## 🚀 API Endpoints Summary

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | User registration | Public |
| POST | `/api/auth/login` | User login | Public |
| GET | `/api/auth/profile` | Get user profile | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| GET | `/api/opportunities` | List opportunities | Public |
| GET | `/api/opportunities/:id` | Get opportunity | Public |
| POST | `/api/opportunities` | Create opportunity | Admin |
| PUT | `/api/opportunities/:id` | Update opportunity | Admin |
| DELETE | `/api/opportunities/:id` | Delete opportunity | Admin |
| GET | `/api/applications` | Get applications | Private |
| GET | `/api/applications/:id` | Get application | Private |
| POST | `/api/applications` | Submit application | Private |
| PUT | `/api/applications/:id/status` | Update status | Admin |
| GET | `/api/users` | List users | Admin |
| GET | `/api/users/:id` | Get user | Admin |
| GET | `/api/users/:id/applications` | Get user apps | Private/Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |
| POST | `/api/newsletter/subscribe` | Subscribe | Public |
| POST | `/api/newsletter/unsubscribe` | Unsubscribe | Public |

## 📊 Database Collections

1. **users** - Student and admin accounts
2. **opportunities** - Bursaries, internships, programs
3. **applications** - Student applications to opportunities
4. **newsletters** - Email subscriptions

## 🛠️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Production start:**
   ```bash
   npm start
   ```

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT authentication tokens
- Role-based access control
- File upload validation
- Input sanitization and validation
- CORS protection
- Environment variable protection

## 📨 Email Notifications

The system automatically sends:
- Welcome emails upon registration
- Application confirmation emails
- Status update notifications

## 📁 File Uploads

Supported file types:
- Images: JPEG, JPG, PNG
- Documents: PDF, DOC, DOCX

File size limit: 10MB per file

This backend provides a complete foundation for your Student Opportunities Portal with user management, application processing, and administrative controls.