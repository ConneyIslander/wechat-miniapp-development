const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'db', 'accounting.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
    is_preset INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount REAL NOT NULL,
    category_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
    date TEXT NOT NULL,
    note TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    month TEXT NOT NULL UNIQUE,
    amount REAL NOT NULL
  );
`);

const presetCategories = [
  { name: '餐饮', icon: '🍜', type: 'expense', sort_order: 1 },
  { name: '交通', icon: '🚌', type: 'expense', sort_order: 2 },
  { name: '购物', icon: '🛒', type: 'expense', sort_order: 3 },
  { name: '娱乐', icon: '🎮', type: 'expense', sort_order: 4 },
  { name: '住房', icon: '🏠', type: 'expense', sort_order: 5 },
  { name: '医疗', icon: '💊', type: 'expense', sort_order: 6 },
  { name: '学习', icon: '📚', type: 'expense', sort_order: 7 },
  { name: '其他', icon: '✏️', type: 'expense', sort_order: 8 },
  { name: '工资', icon: '💰', type: 'income', sort_order: 1 },
  { name: '红包', icon: '🎁', type: 'income', sort_order: 2 },
  { name: '兼职', icon: '💼', type: 'income', sort_order: 3 },
  { name: '其他', icon: '✏️', type: 'income', sort_order: 4 }
];

const insertCategory = db.prepare(`
  INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order)
  VALUES (?, ?, ?, 1, ?)
`);

for (const cat of presetCategories) {
  insertCategory.run(cat.name, cat.icon, cat.type, cat.sort_order);
}

module.exports = db;
