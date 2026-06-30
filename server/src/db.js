const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'db', 'tasks.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// 先清理已存在的重复分类（保留 id 最小的那条）
db.exec("DELETE FROM categories WHERE id NOT IN (SELECT MIN(id) FROM categories GROUP BY type, name)");

// 给 categories 表加上唯一约束
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_type_name ON categories(type, name)");

const initSqlPath = path.join(__dirname, '..', 'db', 'init.sql');
const initSql = fs.readFileSync(initSqlPath, 'utf8');
db.exec(initSql);

console.log('Database initialized');

module.exports = db;
