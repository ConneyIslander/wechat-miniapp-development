const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res, next) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM categories';
    const params = [];
    
    if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY sort_order ASC, id ASC';
    
    const categories = db.prepare(sql).all(...params);
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { name, icon, type } = req.body;

    if (!name || !icon || !type) {
      return res.status(400).json({ error: 'name, icon, type are required' });
    }
    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({ error: 'type must be expense or income' });
    }

    const maxOrder = db.prepare(
      'SELECT MAX(sort_order) as max_order FROM categories WHERE type = ?'
    ).get(type);
    const sort_order = (maxOrder.max_order || 0) + 1;

    const result = db.prepare(`
      INSERT INTO categories (name, icon, type, is_preset, sort_order)
      VALUES (?, ?, ?, 0, ?)
    `).run(name, icon, type, sort_order);

    const newCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCategory);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);

    if (!cat) return res.status(404).json({ error: 'Category not found' });
    if (cat.is_preset) return res.status(403).json({ error: 'Preset category cannot be deleted' });

    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
