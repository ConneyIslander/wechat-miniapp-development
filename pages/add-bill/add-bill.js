// pages/add-bill/add-bill.js
Page({
  data: {
    title: '记一笔',
    amount: '',
    categoryId: null,
    type: 'expense',
    date: '',
    note: ''
  },
  onLoad(options) {
    console.log('[add-bill] onLoad', options);
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({ date });
  },
  onReady() {
    console.log('[add-bill] onReady');
  },
  onShow() {
    console.log('[add-bill] onShow');
  },
  onUnload() {
    console.log('[add-bill] onUnload');
  },
  onSave() {
    console.log('[add-bill] onSave', this.data);
  }
});
