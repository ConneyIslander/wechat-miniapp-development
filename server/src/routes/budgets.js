const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { month } = req.query;
  
  if (!month) {
    return res.status(400).json({ error: 'month is required' });
  }
  
  const budget = db.prepare('SELECT * FROM budgets WHERE month = ?').get(month);
  res.json({ budget: budget || null });
});

router.post('/', (req, res) => {
  const { month, amount } = req.body;
  
  if (!month || amount === undefined) {
    return res.status(400).json({ error: 'month and amount are required' });
  }
  
  db.prepare(`
    INSERT INTO budgets (month, amount) VALUES (?, ?)
    ON CONFLICT(month) DO UPDATE SET amount = ?
  `).run(month, amount, amount);
  
  const budget = db.prepare('SELECT * FROM budgets WHERE month = ?').get(month);
  res.json(budget);
});

module.exports = router;
