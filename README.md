# Multi-Tenant Todo Application 🚀

A modern, secure, and scalable multi-tenant todo application built with Next.js, PayloadCMS, and TypeScript. This application empowers organizations to manage their tasks efficiently while ensuring complete data isolation between different tenants. ✨

## Features 🌟

### Multi-Tenancy 🏢

Automatic tenant creation upon user registration
Complete data isolation between tenants
Tenant-specific task management

### User Management 👤

Role-based access control (User, Admin)
Secure authentication with token-based sessions
Rate limiting for login attempts
User profile management

### Todo Management 📋

Create, read, update, and delete todos
Task prioritization (High, Medium, Low)
Task status tracking (Todo, In Progress, Done)
Task assignment to team members
Due date management
Detailed task descriptions

### Security Features 🔒

JWT-based authentication
Rate limiting for API endpoints
Secure password handling
CORS and CSRF protection
Environment-based configuration

### Tech Stack 💻

Frontend: Next.js 13+ with App Router
Backend: PayloadCMS
Database: PostgreSQL
Authentication: Built-in PayloadCMS auth with JWT
Type Safety: TypeScript
Styling: Modern UI with responsive design

### Prerequisites 🛠️

Node.js 18+
PostgreSQL 16+
npm or yarn

### Environment Variables 🌐

Create a .env file in the root directory with the following variables:

```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/todo_app

# PayloadCMS
PAYLOAD_SECRET=your-secret-key
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000

# Development URLs
NEXT_PUBLIC_DEV_URL=http://localhost:3000
NEXT_PUBLIC_DEV_ADMIN_URL=http://localhost:3000/admin

# Production URLs
NEXT_PUBLIC_PROD_URL=https://your-domain.com
NEXT_PUBLIC_PROD_ADMIN_URL=https://your-domain.com/admin
```

## Installation 🖥️

1. Clone the repository:

```
git clone https://github.com/akshay0077/todo-payload-app.git
cd todo-app
```

2. Install dependencies:

```
npm install
```

or

```
yarn install
```

3. Set up environment variables as described above.
4. Start the development server:

```
npm run dev
```

or

```
yarn dev
```

## Project Structure 📂

```
├── src/
│ ├── app/
│ │ ├── (frontend)/ # Client-side application routes
│ ├── collections/ # PayloadCMS collections
│ │ ├── Users.ts # User collection with multi-tenant support
│ │ └── Todos.ts # Todo collection with tenant isolation
│ ├── payload.config.ts # PayloadCMS configuration
│ └── types/ # TypeScript type definitions
├── public/
│ └── auth-templates/ # Authentication templates
└── package.json
```

## API Endpoints 🌍

### Authentication 🔐

- GET /api/users - User login
- POST /api/users - User registration & Create new tenant

### Todos 📝

- GET /api/todos - List todos (tenant-scoped)
- POST /api/todos - Create new todo
- PUT /api/todos/:id - Update todo
- DELETE /api/todos/:id - Delete todo

## Screenshots 📸

Here are snapshots of the key interfaces in the Multi-Tenant Todo Application:

1. Onboarding Screen 🖼️
   This is the initial user registration screen, built with HTML, CSS, and JavaScript, located in public/auth-templates/register.html. It provides a clean, responsive form for users to enter their details and create a new account.

![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png)

2. Website Dashboard 🌐
   The main todo web application, accessible after login at /todos, built with Next.js and PayloadCMS. It displays a user’s tasks, allows task management, and ensures tenant isolation.

![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png)

3. PayloadCMS Admin Panel 🛠️
   The admin interface at /admin, powered by PayloadCMS, allows administrators to manage users, todos, and tenant settings securely.

![Logo](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/th5xamgrr6se0x5ro4g6.png)

## Contributing 🤝

1. Fork the repository
2. Create your feature branch: git checkout -b feature/my-new-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin feature/my-new-feature
5. Submit a pull request

## License 📜

This project is licensed under the MIT License.

## Support 🆘

For support, please open an issue in the GitHub repository 😊
