const express = require('express');
const cors = require('cors');
const billsRouter = require('./routes/bills');
const categoriesRouter = require('./routes/categories');
const budgetsRouter = require('./routes/budgets');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use('/api/bills', billsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/budgets', budgetsRouter);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
