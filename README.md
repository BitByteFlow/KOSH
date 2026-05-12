> [!NOTE]
> **Video Tutorial:** A step-by-step video guide for KOSH operations is currently being processed and will be linked here shortly.

# Kosh - Modern inventory system and POS platform

Kosh is a comprehensive monorepo containing the Kosh API, Web interface, and Point of Sale (POS) system.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

*   **Node.js**: Version 18 or higher.
*   **Bun**: Recommended package manager for this project. [Install Bun](https://bun.sh/docs/installation).
*   **PostgreSQL**: A running PostgreSQL instance.

### 1. Clone the repository

```bash
git clone https://github.com/your-username/kosh.git
cd kosh
```

### 2. Install dependencies

```bash
bun install
```

### 3. Environment Setup

You need to set up environment variables for the different applications. Copy the `.env.example` files to `.env` in the respective directories and update the values.

#### API (v2)
```bash
cp apps/api/v2/.env.example apps/api/v2/.env
```
Update `DATABASE_URL` and `JWT_SECRET` in `apps/api/v2/.env`.

#### POS
```bash
cp apps/pos/.env.example apps/pos/.env
```
Update `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID` in `apps/pos/.env`.

### 4. Database Setup

The project uses Prisma for database management. You need to generate the Prisma client and push the schema to your database.

```bash
cd packages/db && bun run generate && cd ../..
```

### 5. Running the project

Start the development environment using Turbo:

```bash
bun dev
```

This will start all applications in development mode:
*   **Web**: [http://localhost:3000](http://localhost:3000)
*   **API**: [http://localhost:3001](http://localhost:3001)
*   **POS**: [http://localhost:5173](http://localhost:5173)

## Architecture

Kosh is built as a monorepo using [Turborepo](https://turbo.build/repo).

- **`apps/web`**: The main web application built with [Next.js](https://nextjs.org).
- **`apps/api/v1` & `apps/api/v2`**: RESTful APIs built with [NestJS](https://nestjs.com).
- **`apps/pos`**: Point of Sale interface built with [React](https://reactjs.org) and [Vite](https://vitejs.dev).
- **`packages/db`**: Shared database package containing the Prisma schema and client.
- **`packages/ui`**: Shared UI component library.
- **`packages/validation`**: Shared validation schemas (Zod).
- **`packages/typescript-config`**: Shared TypeScript configurations.
- **`packages/eslint-config`**: Shared ESLint configurations.

## Development

### Adding a new package or app

Use the workspace commands to add dependencies:

```bash
bun add <package-name> --filter <workspace-name>
```

### Formatting and Linting

We use [Biome](https://biomejs.dev) for formatting and linting.

```bash
bun run format
bun run lint
```
