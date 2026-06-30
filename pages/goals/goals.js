const api = require('../../utils/api');

Page({
  data: {
    goals: [],
    balance: 0,
    loaded: false,
    showModal: false,
    showSaveModal: false,
    showWithdrawModal: false,
    currentGoal: null,
    saveAmount: '',
    withdrawAmount: '',
    form: { name: '', target_amount: '' },
  },

  onLoad() { this._load(); },

  _load() {
    Promise.all([api.getGoals(), api.getTotalBalance()]).then(([goalsRes, balanceRes]) => {
      this.setData({
        goals: goalsRes.goals || [],
        balance: balanceRes.balance || 0,
        loaded: true
      });
    });
  },

  noop() {},

  onAddGoal() { this.setData({ showModal: true }); },

  onCloseModal() { this.setData({ showModal: false }); },

  onFormInput(e) {
    const f = e.currentTarget.dataset.field;
    this.setData({ form: { ...this.data.form, [f]: e.detail.value } });
  },

  onConfirmAdd() {
    const { name, target_amount } = this.data.form;
    if (!name || !target_amount) return wx.showToast({ title: '请填写完整', icon: 'none' });
    api.createGoal({ name, target_amount: parseFloat(target_amount) }).then(() => {
      this.setData({ showModal: false, form: { name: '', target_amount: '' } });
      this._load();
    });
  },

  onSave(e) {
    const goal = this.data.goals.find(g => g.id === e.currentTarget.dataset.id);
    this.setData({ showSaveModal: true, currentGoal: goal, saveAmount: '' });
  },

  onCloseSaveModal() { this.setData({ showSaveModal: false }); },

  onSaveAmountInput(e) { this.setData({ saveAmount: e.detail.value }); },

  onConfirmSave() {
    const amount = parseFloat(this.data.saveAmount);
    if (!amount || amount <= 0) return wx.showToast({ title: '请输入有效金额', icon: 'none' });
    if (amount > this.data.balance) return wx.showToast({ title: '积蓄不足', icon: 'none' });
    const newSaved = (this.data.currentGoal.saved_amount || 0) + amount;
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      api.updateGoal(this.data.currentGoal.id, { saved_amount: newSaved }),
      api.createBill({ type: 'expense', amount, category_id: 9, date: today, note: '存入目标：' + this.data.currentGoal.name })
    ]).then(() => {
      this.setData({ showSaveModal: false });
      this._load();
    });
  },

  onWithdraw(e) {
    const goal = this.data.goals.find(g => g.id === e.currentTarget.dataset.id);
    this.setData({ showWithdrawModal: true, currentGoal: goal, withdrawAmount: '' });
  },

  onCloseWithdrawModal() { this.setData({ showWithdrawModal: false }); },

  onWithdrawAmountInput(e) { this.setData({ withdrawAmount: e.detail.value }); },

  onConfirmWithdraw() {
    const amount = parseFloat(this.data.withdrawAmount);
    if (!amount || amount <= 0) return wx.showToast({ title: '请输入有效金额', icon: 'none' });
    if (amount > this.data.currentGoal.saved_amount) return wx.showToast({ title: '可取金额不足', icon: 'none' });
    const newSaved = Math.max(0, this.data.currentGoal.saved_amount - amount);
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      api.updateGoal(this.data.currentGoal.id, { saved_amount: newSaved }),
      api.createBill({ type: 'income', amount, category_id: 4, date: today, note: '取出目标：' + this.data.currentGoal.name })
    ]).then(() => {
      this.setData({ showWithdrawModal: false });
      this._load();
    });
  },

  onDelete(e) {
    wx.showModal({ title: '确认删除', content: '删除后无法恢复', success: res => {
      if (res.confirm) {
        api.deleteGoal(e.currentTarget.dataset.id).then(() => this._load());
      }
    }});
  }
});
