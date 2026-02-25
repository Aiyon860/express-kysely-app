# Express Kysely App

A simple inventory management REST API built with **Express 5**, **Kysely** (type-safe SQL query builder), and **MySQL**. Supports categories, items, and stock transactions (in/out) with full transactional integrity and rollback protection.

## Tech Stack

- **Runtime:** Node.js (ESM)
- **Language:** TypeScript
- **Framework:** Express 5
- **Query Builder:** Kysely
- **Database:** MySQL
- **Testing:** Jest + Supertest
- **Environment:** dotenv

## Project Structure

```
express-kysely-app/
├── src/
│   ├── migrations/
│   │   └── 20260225_initial_schema.ts   # Database schema migration
│   ├── config.ts                        # Centralized config (reads .env)
│   ├── database.ts                      # Kysely database instance
│   ├── migrate.ts                       # Migration CLI (up/down/fresh)
│   ├── server.ts                        # Express app and routes
│   └── types.ts                         # Database types and interfaces
├── tests/
│   └── inventory.test.ts                # Integration tests
├── .env                                 # Environment variables (git-ignored)
├── .env.example                         # Environment variables template
├── .gitignore
├── jest.config.js
├── package.json
└── tsconfig.json
```

## Prerequisites

- **Node.js** >= 18
- **MySQL** >= 8.0

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=express_kysely_app
DB_CONNECTION_LIMIT=10

APP_PORT=3000
```

### 3. Create the database

Make sure the database exists in MySQL before running migrations:

```sql
CREATE DATABASE express_kysely_app;
```

### 4. Run migrations

```bash
npm run migrate
```

## Database Schema

### `categories`

| Column       | Type         | Description              |
| ------------ | ------------ | ------------------------ |
| `id`         | INT (PK, AI) | Primary key              |
| `nama`       | VARCHAR(255) | Category name            |
| `created_at` | TIMESTAMP    | Auto-set on creation     |
| `updated_at` | TIMESTAMP    | Auto-updated on change   |

### `items`

| Column        | Type         | Description                          |
| ------------- | ------------ | ------------------------------------ |
| `id`          | INT (PK, AI) | Primary key                          |
| `nama`        | VARCHAR(255) | Item name                            |
| `category_id` | INT (FK)     | References `categories.id` (cascade) |
| `stock`       | INT          | Current stock quantity (default: 0)  |
| `created_at`  | TIMESTAMP    | Auto-set on creation                 |
| `updated_at`  | TIMESTAMP    | Auto-updated on change               |

### `transactions`

| Column       | Type         | Description            |
| ------------ | ------------ | ---------------------- |
| `id`         | INT (PK, AI) | Primary key            |
| `type`       | VARCHAR(10)  | `"in"` or `"out"`      |
| `created_at` | TIMESTAMP    | Auto-set on creation   |

### `transaction_items`

| Column           | Type         | Description                            |
| ---------------- | ------------ | -------------------------------------- |
| `id`             | INT (PK, AI) | Primary key                            |
| `transaction_id` | INT (FK)     | References `transactions.id` (cascade) |
| `item_id`        | INT (FK)     | References `items.id` (cascade)        |
| `stock_before`   | INT          | Stock before the transaction           |
| `stock_after`    | INT          | Stock after the transaction            |
| `created_at`     | TIMESTAMP    | Auto-set on creation                   |

### Relationships

```
categories 1──────N items
items      1──────N transaction_items
transactions 1────N transaction_items
```

## Running the App

### Development (with hot reload)

```bash
npm run dev
```

The server starts at `http://localhost:3000` (or whichever port is set in `.env`).

## API Endpoints

### 1. Create Category

```
POST /categories
```

**Request body:**

```json
{
  "nama": "Office Supplies"
}
```

**Response (201):**

```json
{
  "id": 1,
  "message": "Category created successfully"
}
```

### 2. Create Item

```
POST /items
```

**Request body:**

```json
{
  "nama": "A4 Paper",
  "category_id": 1,
  "stock": 10
}
```

**Response (201):**

```json
{
  "id": 1,
  "message": "Item added successfully"
}
```

### 3. Get All Items

```
GET /items
```

**Response (200):**

```json
[
  {
    "id": 1,
    "nama": "A4 Paper",
    "category_name": "Office Supplies",
    "stock": 10,
    "created_at": "2025-02-25T00:00:00.000Z"
  }
]
```

### 4. Create Transaction (Stock In/Out)

```
POST /transactions
```

**Stock In — Request body:**

```json
{
  "type": "in",
  "items": [
    { "item_id": 1, "qty": 5 }
  ]
}
```

**Stock Out — Request body:**

```json
{
  "type": "out",
  "items": [
    { "item_id": 1, "qty": 3 }
  ]
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transactionId": 1
  }
}
```

**Error — Insufficient stock (400):**

```json
{
  "error": "Stock for item \"1\" is not enough!"
}
```

> Stock-out transactions that exceed available stock are fully rolled back — no partial updates occur.

## Migration Commands

| Command                | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `npm run migrate`      | Run all pending migrations (alias for `migrate:up`) |
| `npm run migrate:up`   | Run all pending migrations                         |
| `npm run migrate:down` | Rollback the last migration                        |
| `npm run migrate:fresh`| Drop **all** tables and re-run migrations from scratch |

> **Warning:** `migrate:fresh` destroys all data. Only use it in development.

## Testing

Tests automatically reset all tables before running, so each test run starts from a clean state.

```bash
npm test
```

**Test suite covers:**

1. Creating a new category
2. Creating a new item
3. Stock-in transaction (verifies stock is updated)
4. Stock-out exceeding available stock (verifies rollback)

> **Warning:** Tests run against the database configured in `.env`. Use a dedicated testing database to avoid losing data.

## Type System

Following [Kysely best practices](https://kysely.dev/docs/getting-started), each table has three utility types:

| Type Wrapper              | Purpose                          | Example             |
| ------------------------- | -------------------------------- | ------------------- |
| `Selectable<Table>`       | SELECT results (all fields)      | `Item`, `Category`  |
| `Insertable<Table>`       | INSERT values (generated fields are optional) | `NewItem`, `NewCategory` |
| `Updateable<Table>`       | UPDATE values (all fields optional)           | `ItemUpdate`, `CategoryUpdate` |

These are defined in `src/types.ts` and used throughout the codebase for type-safe query operations.

## Scripts Reference

| Script               | Command                                              |
| -------------------- | ---------------------------------------------------- |
| `npm run dev`        | Start dev server with hot reload (`tsx watch`)        |
| `npm run migrate`    | Run pending migrations                               |
| `npm run migrate:up` | Run pending migrations                               |
| `npm run migrate:down` | Rollback last migration                            |
| `npm run migrate:fresh` | Drop all tables + re-migrate                      |
| `npm test`           | Run integration tests with Jest                      |

## License

ISC