// pages/index/index.js
Page({
  data: {
    title: '首页',
    month: '',
    totalExpense: 0,
    totalIncome: 0,
    balance: 0,
    todayBills: []
  },
  onLoad() {
    console.log('[index] onLoad');
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  },
  onReady() {
    console.log('[index] onReady');
  },
  onShow() {
    console.log('[index] onShow');
  },
  onHide() {
    console.log('[index] onHide');
  },
  onAddTap() {
    console.log('[index] onAddTap');
    wx.navigateTo({
      url: '/pages/add-bill/add-bill'
    });
  }
})