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

---


## Project Architecture: 

This project follows a **Layered (N-Tier) Architecture**, separating the application into Presentation (public), Business Logic (controllers), and Data Access layers (db).

![Project Setup](https://github.com/user-attachments/assets/9da3db0c-ec54-4230-a63b-6b410062a30a)

---


## Training Objectives

During this training, you will learn and practice these backend and frontend concepts:

### Backend

- **Authentication** Register and log in users using JWT _npm install bcrypt jsonwebtoken_.
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
- **Testing** Write unit tests (optional).

### Frontend

- **Routing** Navigate between pages without reloading the application.
- **UI Components** Build reusable and responsive user interface components.
- **Forms** Create forms with validation and error messages.
- **API Integration** Connect the frontend to the backend APIs.
- **Search & Filters** Build search, filtering, and sorting in the UI.
- **Responsive Design** Make the application work well on different screen sizes - you can use bootstrap.

### Development

- **Git Workflow** Work with branches, pull requests, and commit messages.

---

## Git Workflow

### Push Your Changes

Follow these steps every time you want to push your work:

1. **Pull latest changes first** - Right-click the project folder → **TortoiseGit** → **Pull**
   - This fetches and merges the latest code from the remote before you push
   - Always do this before committing to reduce conflicts

2. **Stage your changes** - Right-click the project folder → **TortoiseGit** → **Commit...**
   - A window opens showing all modified files
   - Check the files you want to include in this commit

3. **Write a commit message** - In the message box at the top, write a clear and descriptive message, for example:
   ```
   Add CV create endpoint with validation
   ```

4. **Commit and Push** - Click the **Commit & Push** button (bottom of the commit window)
   - This commits your changes locally and pushes them to the remote branch in one step

---

### Resolve a Merge Conflict

A conflict happens when two people edited the same lines differently. To resolve:

1. **Pull** - Right-click the project folder → **TortoiseGit** → **Pull**
   - TortoiseGit will warn you that there are conflicts

2. **Open the conflict resolver** - Right-click the conflicted file → **TortoiseGit** → **Edit Conflicts**
   - A three-panel diff tool opens:
     - **Left panel** - your local changes
     - **Right panel** - the incoming changes from the remote
     - **Bottom panel** - the final merged result

3. **Resolve each conflict** - For each conflicting block, right-click and choose:
   - **Use this text block from mine** - to keep your version
   - **Use this text block from theirs** - to keep the incoming version
   - Or manually edit the bottom panel to combine both

4. **Save and mark as resolved** - Save the file, then right-click it → **TortoiseGit** → **Resolved**

5. **Commit the merge** - Right-click the project folder → **TortoiseGit** → **Commit...**
   - The message will be pre-filled as a merge commit - you can keep it or edit it
   - Click **Commit & Push**

---

### Branch Workflow

1. **Create a new branch** - Right-click → **TortoiseGit** → **Create Branch**
   - Name it after the feature, e.g. `feature/add-pagination`
   - Check **Switch to new branch**

2. **Work on your branch** - make changes, commit as normal

3. **Push your branch** - Right-click → **TortoiseGit** → **Push**
   - Select your branch name and push it to origin

4. **Open a Pull Request** - go to the repository on GitHub/GitLab and open a PR from your branch into `main`

5. **After merge** - switch back to `main` (Right-click → **TortoiseGit** → **Switch/Checkout** → select `main`), then **Pull** to get the latest

