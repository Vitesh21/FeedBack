# FeedbackFlow

A full-stack feedback collection platform that allows businesses to create custom forms and collect customer feedback effortlessly.

## Features

### Admin/Business Features
- **User Authentication**: Secure registration and login system
- **Form Builder**: Create custom feedback forms with multiple question types:
  - Text input questions
  - Multiple choice questions  
  - Rating scale questions (1-5)
- **Form Management**: Publish/unpublish forms, edit existing forms
- **Response Analytics**: View detailed response data with summary statistics
- **Data Export**: Export responses as CSV files for further analysis
- **Dashboard**: Overview of all forms with response counts and statistics

### Customer/User Features
- **Public Form Access**: Submit feedback via public URLs without registration
- **Mobile Responsive**: Forms work seamlessly on all devices
- **Anonymous Submissions**: Optional contact information collection

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** with shadcn/ui components
- **TanStack Query** for state management
- **Wouter** for routing
- **React Hook Form** with Zod validation

### Backend
- **Node.js** with Express.js
- **TypeScript** throughout
- **PostgreSQL** with Neon serverless database
- **Drizzle ORM** for type-safe database operations
- **Passport.js** for authentication
- **Session-based authentication** with PostgreSQL session store

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (version 18 or higher)
- **PostgreSQL database** (or use Neon for serverless PostgreSQL)
- **npm** or **yarn** package manager

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd feedbackflow
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/feedbackflow
SESSION_SECRET=your-super-secret-session-key-here
NODE_ENV=development
```

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Secret key for session encryption (use a strong, random string)

### 4. Database Setup

The application uses Drizzle ORM for database management. To set up your database:

```bash
# Push the schema to your database
npm run db:push
```

This will create all necessary tables and relationships in your PostgreSQL database.

### 5. Run the Application

Start the development server:

```bash
npm run dev
```

This command will:
- Start the Express backend server on port 5000
- Start the Vite frontend development server
- Enable hot module replacement for fast development

The application will be available at `http://localhost:5000`

## Usage Guide

### For Admins/Businesses

1. **Create an Account**
   - Visit the application homepage
   - Click on the "Register" tab
   - Create your admin account

2. **Create a Feedback Form**
   - From the dashboard, click "New Form"
   - Add a form title and description
   - Add questions using the question types panel:
     - Text Input: For open-ended responses
     - Multiple Choice: For selecting from predefined options
     - Rating Scale: For 1-5 star ratings
   - Click "Publish Form" to make it publicly accessible

3. **Share Your Form**
   - Published forms get a public URL: `/f/{form-id}`
   - Copy and share this link with your customers
   - No registration required for form submission

4. **View Responses**
   - Click "View Responses" on any form in your dashboard
   - Switch between "Summary" view for analytics and "Raw Data" for detailed responses
   - Export data as CSV for further analysis

### For Customers/Users

1. **Access a Form**
   - Visit the public form URL shared by the business
   - No account creation required

2. **Submit Feedback**
   - Fill out all required questions
   - Optionally provide contact information
   - Submit your feedback

## Project Structure

```
feedbackflow/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Application pages/routes
│   │   └── App.tsx         # Main application component
├── server/                 # Backend Express application
│   ├── db.ts              # Database connection and configuration
│   ├── auth.ts            # Authentication middleware and routes
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations and storage interface
│   └── index.ts           # Server entry point
├── shared/                 # Shared TypeScript types and schemas
│   └── schema.ts          # Database schema and Zod validation schemas
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run db:generate` - Generate migration files

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user

### Forms (Protected)
- `GET /api/forms` - Get user's forms
- `POST /api/forms` - Create new form
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form

### Questions (Protected)
- `POST /api/forms/:formId/questions` - Add question to form
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Public Forms
- `GET /api/public/forms/:id` - Get public form
- `POST /api/public/forms/:id/responses` - Submit form response

### Responses (Protected)
- `GET /api/forms/:id/responses` - Get form responses
- `GET /api/forms/:id/export` - Export responses as CSV

## Security Features

- **Session-based Authentication**: Secure user sessions with PostgreSQL storage
- **Password Hashing**: Uses Node.js crypto module with scrypt for secure password storage
- **Input Validation**: Zod schemas validate all user inputs
- **CSRF Protection**: Session-based auth provides CSRF protection
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add feature-name'`
5. Push to the branch: `git push origin feature-name`
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support or questions, please create an issue in the repository or contact the development team.