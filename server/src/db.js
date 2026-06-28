const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'db', 'tasks.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

const initSqlPath = path.join(__dirname, '..', 'db', 'init.sql');
const initSql = fs.readFileSync(initSqlPath, 'utf8');
db.exec(initSql);

console.log('Database initialized');

module.exports = db;
