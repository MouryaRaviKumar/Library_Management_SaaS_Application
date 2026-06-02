# Library Management System API

A REST API for managing library operations across multiple libraries. The system supports role-based access for administrators, librarians, and students. It covers library setup, librarian management, student approval, book catalog management, borrowing, returns, lost books, and fines.

## Features

- JWT-based authentication
- Student self-registration using a library slug
- Role-based authorization for admins and librarians
- Multi-library data separation
- Student approval, rejection, blocking, and unblocking
- Book catalog browsing and title search
- Book issue, return, and lost-book tracking
- Late-return and lost-book fines
- Global API rate limiting

## Tech Stack

| Technology | Purpose |
| --- | --- |
| Node.js | JavaScript runtime |
| Express.js | REST API framework |
| MongoDB | Database |
| Mongoose | MongoDB object modeling |
| JSON Web Token | Authentication |
| bcryptjs | Password hashing |
| express-rate-limit | Request rate limiting |
| dotenv | Environment variable loading |

## Architecture

The project follows a layered Express.js architecture:

```text
Client
  |
  v
Express Application
  |
  +-- Global middleware
  |     +-- JSON and URL-encoded body parsing
  |     +-- Rate limiting
  |
  +-- Route modules
  |     +-- Authentication routes
  |     +-- Admin routes
  |     +-- Book routes
  |     +-- User routes
  |     +-- Librarian routes
  |
  +-- Access-control middleware
  |     +-- JWT authentication
  |     +-- Admin-only authorization
  |     +-- Librarian-only authorization
  |     +-- Blocked-user check
  |
  +-- Controllers
  |     +-- Validate requests
  |     +-- Apply business rules
  |     +-- Read and update data
  |
  +-- Mongoose models
        +-- User
        +-- Library
        +-- Book
        +-- Borrow
        +-- Fine
```

## Project Structure

```text
.
|-- src
|   |-- app.js
|   |-- config
|   |   `-- start.js
|   |-- controllers
|   |   |-- adminController.js
|   |   |-- authController.js
|   |   |-- bookController.js
|   |   |-- librarianBookController.js
|   |   |-- librarianStudentController.js
|   |   `-- userController.js
|   |-- middleware
|   |   |-- adminOnly.js
|   |   |-- authMiddleware.js
|   |   |-- BlockedUser.js
|   |   |-- librarianOnly.js
|   |   `-- rateLimiter.js
|   |-- models
|   |   |-- BookModel.js
|   |   |-- BorrowModel.js
|   |   |-- fineModel.js
|   |   |-- LibraryModel.js
|   |   `-- UserModel.js
|   `-- routes
|       |-- adminRoutes.js
|       |-- authRoutes.js
|       |-- bookRoutes.js
|       |-- librarianBookRoutes.js
|       |-- librarianStdentRoutes.js
|       `-- userRoutes.js
|-- .env
|-- .gitignore
|-- package.json
`-- package-lock.json
```

## Data Model

### User

Stores students, librarians, and admins. Each user has a `role` (`student`, `librarian`, or `admin`) and a `status` (`pending`, `approved`, `rejected`, or `blocked`). Library members reference a `Library`.

### Library

Stores the library profile, unique slug, admin reference, contact details, active state, daily fine amount, and lost-book fine amount.

### Book

Stores a library-owned catalog item with title, author, publication date, genre, availability, and lost-book status.

### Borrow

Connects a user to a borrowed book. A borrow record stores its library, issue date, expected return date, returned state, and lost-book state. The default borrowing period is 14 days.

### Fine

Stores a fine amount, reason, paid state, creation date, and the user responsible for payment.

## Application Workflow

### 1. Library Setup

1. An admin account is provisioned in the database.
2. The admin logs in and creates a library.
3. The library receives a unique `slug`.
4. The admin creates librarian accounts for that library.

### 2. Student Registration and Approval

1. A student self-registers with a valid library slug.
2. The account is created with the `student` role and `pending` status.
3. A librarian views pending students.
4. The librarian approves or rejects the account.
5. Librarians can later block or unblock approved students.

### 3. Catalog Management

1. A librarian adds books to the library catalog.
2. Authenticated users browse, search, and view available books.
3. A librarian can update or delete books when allowed.

### 4. Borrowing and Returns

1. A librarian issues an available book to a student.
2. The book becomes unavailable and a borrow record is created.
3. On return, the book becomes available again.
4. A late return creates a fine.
5. A lost book is marked as unavailable and creates a lost-book fine.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB instance or MongoDB Atlas connection string

### Installation

```bash
git clone <your-repository-url>
cd "Library Management System"
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Start the development server:

```bash
npm run dev
```

Start the production server:

```bash
npm start
```

The default base URL is:

```text
http://localhost:5000
```

## Authentication

Protected endpoints require a JWT access token:

```http
Authorization: Bearer <token>
```

Tokens are returned by registration and login and expire after one day.

## API Endpoints

### Authentication

Base path: `/api/auth`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | Public | Register a student using a library slug |
| `POST` | `/login` | Public | Log in and receive a JWT |
| `POST` | `/me/password` | Authenticated | Change the current user's password |
| `GET` | `/me` | Authenticated | Get the current user's details |

Student registration body:

```json
{
  "name": "Student Name",
  "librarySlug": "central-library",
  "email": "student@example.com",
  "password": "securePassword",
  "address": "Student address",
  "mobile": "1234567890"
}
```

Login body:

```json
{
  "email": "student@example.com",
  "password": "securePassword"
}
```

### Books

Base path: `/api/books`

All book routes require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | List books in the current user's library |
| `GET` | `/available` | List available books |
| `GET` | `/search?query=<title>` | Search books by title |
| `GET` | `/:id` | Get a book by ID |

### User Account

Base path: `/api/user`

All user routes require authentication.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/profile` | Get the current user's profile |
| `PUT` | `/profile` | Update the current user's profile |
| `GET` | `/borrows` | Get active borrows |
| `GET` | `/borrows/history` | Get borrow history |
| `GET` | `/fines` | Get unpaid fines |
| `GET` | `/fines/history` | Get fine history |

### Admin

Base path: `/api/admin`

All admin routes require authentication and the `admin` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/library` | Create a library |
| `GET` | `/api/admin/library` | Get the admin's library details |
| `PUT` | `/library` | Update library details |
| `PUT` | `/deactivate` | Deactivate the library |
| `POST` | `/librarian` | Create a librarian |
| `GET` | `/librarians` | List librarians |
| `PUT` | `/:id/block` | Block a user or librarian |
| `PUT` | `/:id/unblock` | Unblock a user or librarian |
| `GET` | `/users` | List library users |
| `GET` | `/users/:id` | Get a user by ID |
| `DELETE` | `/users/:id` | Delete a user |

Create-library body:

```json
{
  "name": "Central Library",
  "slug": "central-library",
  "address": "Library address",
  "contactNumber": "1234567890",
  "email": "library@example.com",
  "fine": 50,
  "lostFine": 500
}
```

Create-librarian body:

```json
{
  "name": "Librarian Name",
  "email": "librarian@example.com",
  "password": "securePassword",
  "address": "Librarian address",
  "mobile": "1234567890"
}
```

### Librarian: Student Management

Base path: `/api/librarian`

All librarian routes require authentication and the `librarian` role.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/pending-students` | List students awaiting approval |
| `PUT` | `/approve/:id` | Approve a pending student |
| `PUT` | `/reject/:id` | Reject a pending student |
| `PUT` | `/block/:id` | Block an approved student |
| `PUT` | `/unblock/:id` | Unblock a blocked student |

### Librarian: Book and Borrow Management

Base path: `/api/librarian`

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/borrow` | Issue a book to a student |
| `GET` | `/borrows` | List active borrows |
| `PUT` | `/return/:id` | Return a borrowed book using its borrow ID |
| `PUT` | `/paid/:id` | Mark a fine as paid |
| `PUT` | `/lost/:id` | Mark a borrowed book as lost using its borrow ID |
| `GET` | `/lost-books ` | List lost books |
| `POST` | `/books ` | Add a book |
| `PUT` | `/books/id ` | Update a book |
| `DELETE` | `/books/:id` | Delete a book |

Issue-book body:

```json
{
  "studentId": "student_object_id",
  "bookId": "book_object_id"
}
```

Add-book body:

```json
{
  "title": "Book Title",
  "author": "Author Name",
  "publicationDate": "2026-01-01",
  "genre": "Fiction"
}
```

## Rate Limiting

The application limits each IP address to 200 requests per hour.

## Current Implementation Notes

This README documents the current codebase as implemented. Before using the API in production, review these points:

- There is no public admin-registration endpoint. An initial admin user must be provisioned in MongoDB.
- `GET /api/admin/api/admin/library` is the effective mounted path for fetching library details because the route module currently includes `/api/admin/library` under the `/api/admin` mount point.
- The librarian routes `/lost-books `, `/books `, and `/books/id ` include literal trailing spaces. The update-book route also uses `id` as a fixed path segment instead of `:id`.
- The blocked-user middleware compares `role` with `"blocked"`, while blocked students are represented by `status: "blocked"`.
- Some admin operations reference `isActive` on users and filter for a `"user"` role, while the user schema stores students with the `"student"` role and does not define `isActive`.
- Fine-related controllers reference fields that are not currently present in the fine schema, including `libraryId`, `isPaid`, and `book`.
- Profile password updates reference `bcrypt` without importing it in `userController.js`.
- Automated tests are not currently included.

## GitHub Notes

The `.gitignore` file already excludes `.env`, `node_modules`, logs, coverage output, and common editor settings. Keep secrets in `.env` and never commit them.

## License

This project currently uses the ISC license as declared in `package.json`.
