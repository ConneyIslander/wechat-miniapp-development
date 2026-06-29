// pages/bill-list/bill-list.js
Page({
  data: {
    title: '账单列表',
    month: '',
    bills: [],
    groupedBills: []
  },
  onLoad() {
    console.log('[bill-list] onLoad');
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  },
  onReady() {
    console.log('[bill-list] onReady');
  },
  onShow() {
    console.log('[bill-list] onShow');
  }
})