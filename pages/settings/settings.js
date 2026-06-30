// pages/settings/settings.js
const api = require('../../utils/api');

Page({
  data: {
    month: '',
    budget: 0,
    budgetInput: '',
    remainingBudget: 0,
    overBudget: false,
    activeTab: 'expense',
    expenseCategories: [],
    incomeCategories: [],
    showBudgetModal: false,
    showAddCatModal: false,
    newCatIcon: '',
    newCatName: ''
  },

  onLoad() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
  },

  onShow() {
    this._loadAll();
  },

  _loadAll() {
    Promise.all([
      api.getBudget(this.data.month),
      api.getCategories('expense'),
      api.getCategories('income'),
      api.getStatistics(this.data.month)
    ]).then(([budgetRes, expCats, incCats, statRes]) => {
      const budget = budgetRes.budget ? budgetRes.budget.amount : 0;
      const expense = statRes.total_expense || 0;
      const remaining = budget - expense;
      this.setData({
        budget,
        budgetInput: budget > 0 ? String(budget) : '',
        remainingBudget: remaining > 0 ? remaining.toFixed(2) : 0,
        overBudget: budget > 0 && expense > budget,
        expenseCategories: (expCats.categories || []).map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          is_preset: c.is_preset
        })),
        incomeCategories: (incCats.categories || []).map(c => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          is_preset: c.is_preset
        }))
      });
    }).catch(() => {});
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.tab });
  },

  onBudgetTap() {
    this.setData({
      showBudgetModal: true,
      budgetInput: this.data.budget > 0 ? String(this.data.budget) : ''
    });
  },

  onBudgetInput(e) {
    this.setData({ budgetInput: e.detail.value });
  },

  onCancelBudget() {
    this.setData({ showBudgetModal: false });
  },

  onConfirmBudget() {
    const amount = parseFloat(this.data.budgetInput) || 0;
    api.setBudget({ month: this.data.month, amount }).then(() => {
      this.setData({ showBudgetModal: false, budget: amount }, () => {
        this._updateOverBudget();
      });
    }).catch(() => {
      wx.showToast({ title: '保存失败', icon: 'none' });
    });
  },

  onAddCat() {
    this.setData({ showAddCatModal: true, newCatIcon: '', newCatName: '' });
  },

  onIconInput(e) {
    this.setData({ newCatIcon: e.detail.value });
  },

  onNameInput(e) {
    this.setData({ newCatName: e.detail.value });
  },

  onCancelAddCat() {
    this.setData({ showAddCatModal: false });
  },

  onConfirmAddCat() {
    const { newCatIcon, newCatName, activeTab } = this.data;
    if (!newCatIcon.trim() || !newCatName.trim()) {
      wx.showToast({ title: '请填写图标和名称', icon: 'none' });
      return;
    }
    api.addCategory({ name: newCatName.trim(), icon: newCatIcon.trim(), type: activeTab }).then(() => {
      this.setData({ showAddCatModal: false });
      wx.showToast({ title: '添加成功', icon: 'success' });
      this._reloadCategories();
    }).catch(() => {
      wx.showToast({ title: '添加失败', icon: 'none' });
    });
  },

  onDeleteCat(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.showModal({
      title: '删除分类',
      content: `确定删除「${name}」吗？`,
      success: res => {
        if (res.confirm) {
          api.deleteCategory(id).then(() => {
            wx.showToast({ title: '已删除', icon: 'success' });
            this._reloadCategories();
          }).catch(err => {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          });
        }
      }
    });
  },

  _reloadCategories() {
    const type = this.data.activeTab;
    api.getCategories(type).then(res => {
      const cats = (res.categories || []).map(c => ({
        id: c.id,
        name: c.name,
        icon: c.icon,
        is_preset: c.is_preset
      }));
      if (type === 'expense') {
        this.setData({ expenseCategories: cats });
      } else {
        this.setData({ incomeCategories: cats });
      }
    });
  },

  _updateOverBudget() {
    api.getStatistics(this.data.month).then(res => {
      const expense = res.total_expense || 0;
      const budget = this.data.budget;
      const remaining = budget - expense;
      this.setData({
        overBudget: budget > 0 && expense > budget,
        remainingBudget: remaining > 0 ? remaining.toFixed(2) : 0
      });
    });
  }
});
