// pages/settings/settings.js
Page({
  data: {
    title: '设置',
    month: '',
    budget: 0,
    expenseCategories: [],
    incomeCategories: []
  },
  onLoad() {
    console.log('[settings] onLoad');
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  },
  onReady() {
    console.log('[settings] onReady');
  },
  onShow() {
    console.log('[settings] onShow');
  }
})