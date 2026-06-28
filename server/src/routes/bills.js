const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { month } = req.query;
  
  let sql = `
    SELECT bills.*, categories.name as category_name, categories.icon as category_icon
    FROM bills
    JOIN categories ON bills.category_id = categories.id
  `;
  const params = [];
  
  if (month) {
    sql += ' WHERE bills.date LIKE ?';
    params.push(`${month}%`);
  }
  
  sql += ' ORDER BY bills.date DESC, bills.created_at DESC';
  
  const bills = db.prepare(sql).all(...params);
  res.json({ bills, total: bills.length });
});

router.get('/:id', (req, res) => {
  const { id } = req.params;
  const bill = db.prepare(`
    SELECT bills.*, categories.name as category_name, categories.icon as category_icon
    FROM bills
    JOIN categories ON bills.category_id = categories.id
    WHERE bills.id = ?
  `).get(id);
  
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  res.json(bill);
});

router.post('/', (req, res) => {
  const { amount, category_id, type, date, note = '' } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number' });
  }
  if (!category_id) {
    return res.status(400).json({ error: 'category_id is required' });
  }
  if (!type || !['expense', 'income'].includes(type)) {
    return res.status(400).json({ error: 'type must be expense or income' });
  }
  if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }
  
  const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
  if (!category) {
    return res.status(400).json({ error: 'category_id does not exist' });
  }
  
  const result = db.prepare(`
    INSERT INTO bills (amount, category_id, type, date, note)
    VALUES (?, ?, ?, ?, ?)
  `).run(amount, category_id, type, date, note);
  
  const newBill = db.prepare(`
    SELECT bills.*, categories.name as category_name, categories.icon as category_icon
    FROM bills
    JOIN categories ON bills.category_id = categories.id
    WHERE bills.id = ?
  `).get(result.lastInsertRowid);
  
  res.status(201).json(newBill);
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category_id, type, date, note } = req.body;
  
  const existing = db.prepare('SELECT id FROM bills WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  
  const updates = [];
  const values = [];
  
  if (amount !== undefined) {
    if (amount <= 0) return res.status(400).json({ error: 'amount must be positive' });
    updates.push('amount = ?');
    values.push(amount);
  }
  if (category_id !== undefined) {
    const cat = db.prepare('SELECT id FROM categories WHERE id = ?').get(category_id);
    if (!cat) return res.status(400).json({ error: 'category_id does not exist' });
    updates.push('category_id = ?');
    values.push(category_id);
  }
  if (type !== undefined) {
    if (!['expense', 'income'].includes(type)) {
      return res.status(400).json({ error: 'type must be expense or income' });
    }
    updates.push('type = ?');
    values.push(type);
  }
  if (date !== undefined) {
    updates.push('date = ?');
    values.push(date);
  }
  if (note !== undefined) {
    updates.push('note = ?');
    values.push(note);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  values.push(id);
  db.prepare(`UPDATE bills SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  
  const updated = db.prepare(`
    SELECT bills.*, categories.name as category_name, categories.icon as category_icon
    FROM bills
    JOIN categories ON bills.category_id = categories.id
    WHERE bills.id = ?
  `).get(id);
  
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const existing = db.prepare('SELECT id FROM bills WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Bill not found' });
  }
  
  db.prepare('DELETE FROM bills WHERE id = ?').run(id);
  res.json({ message: 'deleted', id: parseInt(id) });
});

module.exports = router;
