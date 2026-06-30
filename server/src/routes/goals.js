const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/goals
router.get('/', (req, res) => {
  const goals = db.prepare(`
    SELECT id, name, target_amount, saved_amount, status, created_at
    FROM goals
    ORDER BY created_at DESC
  `).all();

  const result = goals.map(g => ({
    ...g,
    progress: g.target_amount > 0 ? Math.min(Math.round((g.saved_amount / g.target_amount) * 100), 100) : 0
  }));

  res.json({ goals: result });
});

// POST /api/goals
router.post('/', (req, res) => {
  const { name, target_amount } = req.body;

  if (!name || !target_amount) {
    return res.status(400).json({ error: 'name, target_amount 均为必填' });
  }
  if (typeof target_amount !== 'number' || target_amount <= 0) {
    return res.status(400).json({ error: 'target_amount 必须为正数' });
  }

  const stmt = db.prepare(`
    INSERT INTO goals (name, target_amount)
    VALUES (?, ?)
  `);
  const info = stmt.run(name, target_amount);

  const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ ...goal, progress: 0 });
});

// PATCH /api/goals/:id
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  const { saved_amount, status } = req.body;

  const existing = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: '目标不存在' });

  const newSaved = saved_amount !== undefined ? saved_amount : existing.saved_amount;
  const newStatus = status !== undefined ? status : existing.status;

  // 如果达成目标，自动标记完成
  const autoStatus = newSaved >= existing.target_amount ? 'completed' : newStatus;

  db.prepare(`
    UPDATE goals SET saved_amount = ?, status = ? WHERE id = ?
  `).run(newSaved, autoStatus, id);

  const updated = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
  res.json({
    ...updated,
    progress: updated.target_amount > 0
      ? Math.min(Math.round((updated.saved_amount / updated.target_amount) * 100), 100) : 0
  });
});

// DELETE /api/goals/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const info = db.prepare('DELETE FROM goals WHERE id = ?').run(id);
  if (info.changes === 0) return res.status(404).json({ error: '目标不存在' });
  res.json({ message: 'deleted' });
});

module.exports = router;
