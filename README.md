# nodejs-cv-filter-training

## Prerequisites

Install the following software before starting:

- **Node.js**  
  https://nodejs.org/en/download

- **PostgreSQL**  
  https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

- **Visual Studio Code**  
  https://code.visualstudio.com/download

- **Git**  
  https://git-scm.com/downloads

- **TortoiseGit (Optional)**  
  https://tortoisegit.org/download/

---

## Verify Installation

Open a terminal and verify that Node.js and npm are installed:

```bash
node -v
npm -v
```

---

## Project Setup

Clone the repository:

```bash
git clone <repository-url>
cd nodejs-cv-filter-training
```

Install all project dependencies:

```bash
npm install
```

> **Note:** If this repository already contains a `package.json`, you **do not need** to run `npm init -y`.

If you are creating the project from scratch:

```bash
npm init -y
```

This creates the `package.json` file.

---

## Install Required Packages

Install Express:

```bash
npm install express
```

Install the PostgreSQL driver:

```bash
npm install pg
```

Install environment variable support:

```bash
npm install dotenv
```

---

## Database Setup

1. Open **pgAdmin**.
2. Create a new PostgreSQL database.
3. Configure the database connection in your application.

![Database Setup](https://github.com/user-attachments/assets/9da3db0c-ec54-4230-a63b-6b410062a30a)




## Training Objectives

During this training, you will implement and practice the following backend concepts:

- **Authentication** – Register users, log in, and manage JWT-based authentication.
- **Authorization** – Restrict access to resources using role-based permissions.
- **Database Design** – Create a normalized PostgreSQL schema with proper relationships.
- **CRUD Operations** – Build REST APIs for creating, reading, updating, and deleting data.
- **Fuzzy Search** – Implement intelligent candidate search with approximate text matching.
- **Pagination** – Return large datasets efficiently using page-based results.
- **Sorting & Filtering** – Allow clients to sort and filter data using query parameters.
- **Request Validation** – Validate incoming requests before processing them.
- **Global Error Handling** – Return consistent and meaningful API error responses.
- **File Uploads** – Upload and store CVs (PDF/DOCX) using multipart requests.
- **Logging** – Log application events, requests, and errors for debugging.
- **Environment Variables** – Manage application configuration using `.env` files.
- **SQL & Database Queries** – Write efficient SQL queries, joins, and transactions without relying on an ORM.
- **Unit & Integration Testing** – Write automated tests to verify application behavior.
- **Git Workflow** – Practice branching, pull requests, and writing meaningful commit messages.
