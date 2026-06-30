// pages/bill-list/bill-list.js
const api = require('../../utils/api');

Page({
  data: {
    month: '',
    filterType: 'all', // 'all' | 'expense' | 'income'
    bills: [],         // 扁平账单列表（用于非乐观删除）
    groupedBills: [],  // 按日期分组
    openId: null       // 当前左滑展开的 id
  },

  onLoad(query) {
    const month = query.month || '';
    this.setData({ month });
    this._loadData();
  },

  onShow() {
    if (this._needRefresh) {
      this._needRefresh = false;
      this._loadData();
    }
  },

  _loadData() {
    if (!this.data.month) return;
    api.getBills(this.data.month).then(res => {
      const bills = (res.bills || []).map(b => ({
        id: b.id,
        category: b.category_name,
        iconChar: b.category_icon,
        iconBg: 'bg-violet',
        amount: b.amount,
        type: b.type,
        date: b.date,
        note: b.note
      }));
      this.setData({ bills }, () => this._applyFilter());
    }).catch(() => {
      this.setData({ bills: [], groupedBills: [] });
    });
  },

  _applyFilter() {
    let bills = this.data.bills;
    const ft = this.data.filterType;
    if (ft !== 'all') {
      bills = bills.filter(b => b.type === ft);
    }
    this.setData({ groupedBills: this._groupByDate(bills), openId: null });
  },

  _groupByDate(bills) {
    const map = {};
    bills.forEach(bill => {
      const date = bill.date;
      if (!map[date]) {
        map[date] = { date, expense: 0, income: 0, bills: [] };
      }
      map[date].bills.push(bill);
      if (bill.type === 'expense') map[date].expense += parseFloat(bill.amount);
      else map[date].income += parseFloat(bill.amount);
    });
    return Object.values(map).sort((a, b) => b.date.localeCompare(a.date));
  },

  _formatDateLabel(dateStr) {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (dateStr === todayStr) return '今天';
    if (dateStr === yesterdayStr) return '昨天';
    return dateStr;
  },

  // ---- 顶部筛选 ----
  onFilterTap(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.filterType) return;
    this.setData({ filterType: type }, () => this._applyFilter());
  },

  // ---- 左滑删除 ----
  onTouchStart(e) {
    this._touchStartX = e.touches[0].clientX;
    this._touchStartY = e.touches[0].clientY;
    this._swipingId = e.currentTarget.dataset.id;
  },

  onTouchMove(e) {
    const dx = e.touches[0].clientX - this._touchStartX;
    const dy = e.touches[0].clientY - this._touchStartY;
    if (Math.abs(dy) > Math.abs(dx)) return; // 纵向滑动不处理
    const openId = dx < -30 ? this._swipingId : null;
    if (openId !== this.data.openId) {
      this.setData({ openId });
    }
  },

  onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - this._touchStartX;
    const openId = dx < -60 ? this._swipingId : null;
    if (this.data.openId !== openId) {
      this.setData({ openId });
    }
  },

  onDeleteTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '确定删除这条账单吗？',
      confirmColor: '#e74c3c',
      success: res => {
        if (!res.confirm) return;
        this._doDelete(id);
      }
    });
  },

  _doDelete(id) {
    api.deleteBill(id).then(() => {
      const bills = this.data.bills.filter(b => b.id !== id);
      this.setData({ bills, openId: null }, () => this._applyFilter());
      const pages = getCurrentPages();
      const home = pages.find(p => p.route === 'pages/index/index');
      if (home) home._needRefresh = true;
    }).catch(() => {
      wx.showToast({ title: '删除失败', icon: 'none' });
    });
  }
});
