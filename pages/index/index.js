// pages/index/index.js
const api = require('../../utils/api');

Page({
  data: {
    month: '',
    totalExpense: 0,
    totalIncome: 0,
    balance: 0,
    totalBalance: 0,
    groupedBills: []
  },
  onLoad() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
    this._loadData(month);
  },
  onShow() {
    // 从记账页返回时自动刷新
    if (this._needRefresh) {
      this._needRefresh = false;
      this._loadData(this.data.month);
    }
  },
  onAddTap() {
    this._needRefresh = true;
    wx.navigateTo({ url: '/pages/add-bill/add-bill' });
  },
  onSeeAll() {
    wx.navigateTo({ url: `/pages/bill-list/bill-list?month=${this.data.month}` });
  },
  onMonthChange(e) {
    const { month } = e.detail;
    this.setData({ month });
    this._loadData(month);
  },
  onPullDownRefresh() {
    this._loadData(this.data.month, () => wx.stopPullDownRefresh());
  },
  _loadData(month, callback) {
    Promise.all([
      api.getBills(month),
      api.getStatistics(month),
      api.getTotalBalance()
    ]).then(([billsRes, statRes, totalRes]) => {
      const bills = (billsRes.bills || []).map(b => ({
        id: b.id,
        category: b.category_name,
        iconChar: b.category_icon,
        iconBg: 'bg-violet',
        amount: b.amount,
        type: b.type,
        date: b.date,
        note: b.note
      }));
      const stats = statRes || {};
      const totalExpense = stats.total_expense || 0;
      const totalIncome = stats.total_income || 0;
      this.setData({
        totalExpense,
        totalIncome,
        balance: totalIncome - totalExpense,
        totalBalance: totalRes.balance || 0,
        groupedBills: this._groupByDate(bills)
      });
      if (callback) callback();
    }).catch(() => {
      this.setData({ groupedBills: [], totalExpense: 0, totalIncome: 0, balance: 0, totalBalance: 0 });
      if (callback) callback();
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
  // 乐观更新：记账页提交时先显示
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
