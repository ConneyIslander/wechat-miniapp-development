// pages/index/index.js
const api = require('../../utils/api');

Page({
  data: {
    month: '',
    totalExpense: 0,
    totalIncome: 0,
    balance: 0,
    groupedBills: [] // [{ date: '06-28', dateLabel: '6月28日', expense: 35.5, income: 0, bills: [...] }]
  },
  onLoad() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
    this._loadData(month);
  },
  onShow() {
    const pages = getCurrentPages();
    const homePage = pages[pages.length - 1];
    if (homePage && homePage._refreshAfterAdd) {
      homePage._refreshAfterAdd = false;
      this._loadData(this.data.month);
    }
  },
  _loadData(month) {
    Promise.all([
      api.getBills(month),
      api.getStatistics(month)
    ]).then(([billsRes, statRes]) => {
      const bills = billsRes.data || billsRes || [];
      const stats = statRes.data || statRes || {};
      this.setData({
        totalExpense: stats.totalExpense || 0,
        totalIncome: stats.totalIncome || 0,
        balance: stats.balance || 0,
        groupedBills: this._groupByDate(bills)
      });
    }).catch(() => {
      this.setData({ groupedBills: [], totalExpense: 0, totalIncome: 0, balance: 0 });
    });
  },
  _groupByDate(bills) {
    const map = {};
    bills.forEach(bill => {
      const date = bill.date || bill.createdAt;
      if (!map[date]) {
        map[date] = { date, expense: 0, income: 0, bills: [] };
      }
      map[date].bills.push(bill);
      if (bill.type === 'expense') map[date].expense += parseFloat(bill.amount);
      else map[date].income += parseFloat(bill.amount);
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  },
  onAddTap() {
    wx.navigateTo({ url: '/pages/add-bill/add-bill' });
  },
  onPrevMonth() {
    const [y, m] = this.data.month.split('-').map(Number);
    const date = new Date(y, m - 2, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
    this._loadData(month);
  },
  onNextMonth() {
    const [y, m] = this.data.month.split('-').map(Number);
    const date = new Date(y, m, 1);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
    this._loadData(month);
  },
  updateTodayBills(bill) {
    const grouped = this._groupByDate([bill, ...this._flattenBills()]);
    let { totalExpense, totalIncome } = this.data;
    if (bill.type === 'expense') totalExpense += bill.amount;
    else totalIncome += bill.amount;
    this.setData({ groupedBills: grouped, totalExpense, totalIncome, balance: totalIncome - totalExpense });
  },
  replaceTempBill(tempId, realBill) {
    const bills = this._flattenBills().map(b => b.id === tempId ? { ...b, id: realBill.id } : b);
    this.setData({ groupedBills: this._groupByDate(bills) });
  },
  rollbackTempBill(tempId) {
    const bill = this._flattenBills().find(b => b.id === tempId);
    if (!bill) return;
    const bills = this._flattenBills().filter(b => b.id !== tempId);
    let { totalExpense, totalIncome } = this.data;
    if (bill.type === 'expense') totalExpense -= bill.amount;
    else totalIncome -= bill.amount;
    this.setData({ groupedBills: this._groupByDate(bills), totalExpense, totalIncome, balance: totalIncome - totalExpense });
  },
  _flattenBills() {
    return this.data.groupedBills.flatMap(g => g.bills);
  }
});
