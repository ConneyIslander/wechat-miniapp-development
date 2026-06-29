const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const { month } = req.query;
  
  if (!month) {
    return res.status(400).json({ error: 'month is required' });
  }
  
  const totalExpense = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM bills
    WHERE type = 'expense' AND date LIKE ?
  `).get(`${month}%`);
  
  const totalIncome = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM bills
    WHERE type = 'income' AND date LIKE ?
  `).get(`${month}%`);
  
  const expenseByCategory = db.prepare(`
    SELECT c.id, c.name, c.icon, COALESCE(SUM(b.amount), 0) as total
    FROM categories c
    LEFT JOIN bills b ON c.id = b.category_id AND b.type = 'expense' AND b.date LIKE ?
    WHERE c.type = 'expense'
    GROUP BY c.id
    HAVING total > 0
    ORDER BY total DESC
  `).all(`${month}%`);
  
  const dailyExpense = db.prepare(`
    SELECT date, SUM(amount) as total
    FROM bills
    WHERE type = 'expense' AND date LIKE ?
    GROUP BY date
    ORDER BY date ASC
  `).all(`${month}%`);
  
  res.json({
    month,
    total_expense: totalExpense.total,
    total_income: totalIncome.total,
    expense_by_category: expenseByCategory,
    daily_expense: dailyExpense
  });
});

module.exports = router;
