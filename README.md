"# nodejs-cv-filter-training" 
NodeJS
https://nodejs.org/en/download


PostgreSQL
https://www.enterprisedb.com/downloads/postgres-postgresql-downloads


VSCode
https://code.visualstudio.com/download?_exp_download=fb315fc982


GIT
https://git-scm.com/install/windows


TortoiseGIT (Optional)
https://tortoisegit.org/download/


make sure that you have installed
node -v
npm -v


npm install (install all dependencies)

Initialize npm:
npm init -y 
this creates package.json


Install Express:
npm install express


Install PostgreSQL driver:
npm install pg


Install environment variable support:
npm install dotenv


CV_project/
│
├── server.js           ← Starting point. Boots the server & creates the DB table on first run.
│
├── .env                ← Your DB credentials (host, port, user, password).
│
└── src/
    │
    ├── app.js          ← Glues everything together: registers middleware & routes.
    │
    ├── db/
    │   └── index.js    ← Opens & exports the PostgreSQL connection pool.
    │                     All DB queries use this single shared connection.
    │
    ├── routes/
    │   └── cvRoutes.js ← Defines URL paths (GET /api/cvs, POST /api/cvs, etc.)
    │                     and maps each one to a controller function.
    │
    ├── controllers/
    │   └── cvController.js ← The actual business logic.
    │                          Each function handles one action:
    │                          get all, get one, create, update, delete.
    │                          Talks to the DB, sends back JSON.
    │
    └── public/         ← Static files served directly to the browser.
        ├── index.html  ← The single UI page (form + CV list).
        ├── style.css   ← All the styling.
        └── app.js      ← Frontend JS: calls the REST API and updates the page.


create database connection in PGAdmin
