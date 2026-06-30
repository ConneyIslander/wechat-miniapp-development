// pages/add-bill/add-bill.js
const api = require('../../utils/api');

const EXPENSE_CATEGORIES = [
  { id: 1, name: '餐饮', icon: '餐', iconBg: 'bg-violet' },
  { id: 2, name: '交通', icon: '行', iconBg: 'bg-indigo' },
  { id: 3, name: '购物', icon: '购', iconBg: 'bg-rose' },
  { id: 4, name: '娱乐', icon: '娱', iconBg: 'bg-fuchsia' },
  { id: 5, name: '居住', icon: '住', iconBg: 'bg-emerald' },
  { id: 6, name: '医疗', icon: '医', iconBg: 'bg-sky' },
  { id: 7, name: '教育', icon: '教', iconBg: 'bg-amber' },
  { id: 8, name: '其他', icon: '它', iconBg: 'bg-orange' }
];

const INCOME_CATEGORIES = [
  { id: 101, name: '工资', icon: '工', iconBg: 'bg-emerald' },
  { id: 102, name: '奖金', icon: '奖', iconBg: 'bg-sky' },
  { id: 103, name: '理财', icon: '财', iconBg: 'bg-indigo' },
  { id: 104, name: '兑换', icon: '换', iconBg: 'bg-violet' },
  { id: 105, name: '其他', icon: '它', iconBg: 'bg-orange' }
];

Page({
  data: {
    type: 'expense',
    amount: '',
    selectedCategoryId: null,
    selectedCategory: null,
    date: '',
    note: '',
    amountFocus: true,
    currentCategories: EXPENSE_CATEGORIES
  },
  onLoad() {
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    this.setData({ date });
    // 尝试从 API 加载，失败则保持硬编码
    this._loadFromApi('expense');
  },
  _loadFromApi(type) {
    api.getCategories(type).then(res => {
      const raw = res.data || res || [];
      if (raw.length > 0) {
        const categories = raw.map(c => ({
          id: c.id,
          name: c.name,
          icon: c.iconChar || c.icon || c.name[0],
          iconBg: c.iconBg || this._getIconBg(c.name)
        }));
        this.setData({ currentCategories: categories });
      }
    }).catch(() => {});
  },
  _getIconBg(name) {
    const map = { '餐饮': 'bg-violet', '交通': 'bg-indigo', '购物': 'bg-rose', '娱乐': 'bg-fuchsia', '居住': 'bg-emerald', '医疗': 'bg-sky', '教育': 'bg-amber', '工资': 'bg-emerald', '奖金': 'bg-sky', '理财': 'bg-indigo' };
    return map[name] || 'bg-orange';
  },
  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    this.setData({ type, currentCategories: categories, selectedCategoryId: null, selectedCategory: null });
    this._loadFromApi(type);
  },
  onCategoryChange(e) {
    const { id, name, icon, iconBg } = e.detail;
    this.setData({ selectedCategoryId: id, selectedCategory: { id, name, icon, iconBg } });
  },
  onAmountInput(e) {
    this.setData({ amount: e.detail.value });
  },
  onDateChange(e) {
    this.setData({ date: e.detail.value });
  },
  onNoteInput(e) {
    this.setData({ note: e.detail.value });
  },
  onSubmit() {
    const { amount, selectedCategory, date, note, type } = this.data;
    if (!amount || parseFloat(amount) <= 0) {
      wx.showToast({ title: '请输入金额', icon: 'none' });
      return;
    }
    if (!selectedCategory) {
      wx.showToast({ title: '请选择分类', icon: 'none' });
      return;
    }

    const tempId = Date.now();
    const bill = {
      id: tempId,
      category: selectedCategory.name,
      iconChar: selectedCategory.icon,
      iconBg: selectedCategory.iconBg,
      amount: parseFloat(amount),
      note,
      type,
      date
    };

    const pages = getCurrentPages();
    const homePage = pages[pages.length - 2];
    if (homePage) homePage.updateTodayBills(bill);

    api.createBill({
      category: selectedCategory.name,
      category_id: selectedCategory.id,
      amount: parseFloat(amount),
      note,
      type,
      date
    }).then(res => {
      if (homePage) homePage.replaceTempBill(tempId, res);
    }).catch(() => {
      // API 不通时保留乐观更新结果，刷新确保状态正确
      if (homePage) homePage._loadData(homePage.data.month);
    });
    wx.navigateBack();
  }
});
