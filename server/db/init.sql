-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('expense', 'income')),
  is_preset INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0
);

-- 账单表
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

-- 预算表
CREATE TABLE IF NOT EXISTS budgets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  month TEXT NOT NULL UNIQUE,
  amount REAL NOT NULL
);

-- 愿望清单表
CREATE TABLE IF NOT EXISTS goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  saved_amount REAL DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'completed')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 插入预设支出分类
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('餐饮', '🍜', 'expense', 1, 1);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('交通', '🚌', 'expense', 1, 2);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('购物', '🛒', 'expense', 1, 3);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('娱乐', '🎮', 'expense', 1, 4);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('住房', '🏠', 'expense', 1, 5);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('医疗', '💊', 'expense', 1, 6);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('学习', '📚', 'expense', 1, 7);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('其他', '✏️', 'expense', 1, 8);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('愿望存入', '🎯', 'expense', 1, 9);

-- 插入预设收入分类
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('工资', '💰', 'income', 1, 1);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('红包', '🎁', 'income', 1, 2);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('兼职', '💼', 'income', 1, 3);
INSERT OR IGNORE INTO categories (name, icon, type, is_preset, sort_order) VALUES ('其他', '✏️', 'income', 1, 4);

-- 插入测试账单数据
INSERT INTO bills (amount, category_id, type, date, note) VALUES (35.5, 1, 'expense', '2026-06-28', '午餐');
INSERT INTO bills (amount, category_id, type, date, note) VALUES (15.0, 2, 'expense', '2026-06-25', '地铁');
INSERT INTO bills (amount, category_id, type, date, note) VALUES (5000.0, 9, 'income', '2026-06-01', '工资');
