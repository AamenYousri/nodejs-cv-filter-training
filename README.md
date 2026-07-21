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

During this training, you will learn and practice these backend and frontend concepts:

### Backend

- **Authentication** Register and log in users using JWT.
- **Authorization** Control what different users are allowed to do.
- **Database Design** Create PostgreSQL tables and relationships.
- **CRUD Operations** Create, read, update, and delete data.
- **Fuzzy Search** Search for data even if the text is not an exact match.
- **Pagination** Split large results into smaller pages.
- **Sorting & Filtering** Sort and filter data using request parameters.
- **Request Validation** Check that user input is correct before saving it.
- **Error Handling** Return clear error messages when something goes wrong.
- **File Uploads** Upload and store CV files.
- **Logging** Log requests and errors for troubleshooting.
- **Environment Variables** Store configuration values in a `.env` file.
- **SQL Queries** Write SQL queries to work with the database.
- **Testing** Write unit and integration tests.

### Frontend

- **Routing** Navigate between pages without reloading the application.
- **UI Components** Build reusable and responsive user interface components.
- **Forms** Create forms with validation and error messages.
- **API Integration** Connect the frontend to the backend APIs.
- **Search & Filters** Build search, filtering, and sorting in the UI.
- **Responsive Design** Make the application work well on different screen sizes.

### Development

- **Git Workflow** Work with branches, pull requests, and commit messages.
