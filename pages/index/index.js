// pages/index/index.js
const api = require('../../utils/api');

Page({
  data: {
    month: '2026-06',
    totalExpense: 3250.50,
    totalIncome: 6000.00,
    balance: 2749.50,
    todayBills: [
      { id: 1, category: '餐饮', iconChar: '餐', iconBg: 'bg-violet', amount: 35.50, note: '午饭', type: 'expense' },
      { id: 2, category: '交通', iconChar: '行', iconBg: 'bg-indigo', amount: 4.00, note: '地铁', type: 'expense' },
      { id: 3, category: '工资', iconChar: '收', iconBg: 'bg-emerald', amount: 6000.00, note: '6月工资', type: 'income' }
    ]
  },
  onLoad() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
    api.getBills('2026-06').then(res => {
      console.log('【测试成功】', res);
    }).catch(err => {
      console.error('【测试失败】', err);
    });
  },
  onAddTap() {
    wx.navigateTo({ url: '/pages/add-bill/add-bill' });
  },
  onPrevMonth() {
    const [y, m] = this.data.month.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  },
  onNextMonth() {
    const [y, m] = this.data.month.split('-').map(Number);
    const date = new Date(y, m, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  }
});
