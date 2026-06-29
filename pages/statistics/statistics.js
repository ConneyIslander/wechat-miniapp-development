// pages/statistics/statistics.js
Page({
  data: {
    title: '月度统计',
    month: '',
    totalExpense: 0,
    totalIncome: 0,
    expenseByCategory: [],
    dailyExpense: []
  },
  onLoad() {
    console.log('[statistics] onLoad');
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  },
  onReady() {
    console.log('[statistics] onReady');
  },
  onShow() {
    console.log('[statistics] onShow');
  }
})