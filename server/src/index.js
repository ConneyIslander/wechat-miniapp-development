const express = require('express');
const cors = require('cors');
require('./db');
const billsRouter = require('./routes/bills');
const categoriesRouter = require('./routes/categories');
const budgetsRouter = require('./routes/budgets');
const statisticsRouter = require('./routes/statistics');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/bills', billsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/statistics', statisticsRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 404 中间件：处理所有未匹配的路由
app.use((req, res, next) => {
  res.status(404).json({ error: 'Route not found' });
});

// 全局错误处理中间件：四个参数，Express 靠参数个数识别
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
