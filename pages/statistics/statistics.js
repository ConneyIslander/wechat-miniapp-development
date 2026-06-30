// pages/statistics/statistics.js
const api = require('../../utils/api');

// 10 色数组
const COLORS = [
  '#6c5ce7', '#fd79a8', '#00cec9', '#e17055', '#fdcb6e',
  '#74b9ff', '#a29bfe', '#55efc4', '#ff7675', '#fab1a0'
];

Page({
  data: {
    month: '',
    totalExpense: 0,
    totalIncome: 0,
    expenseByCategory: [], // [{name, value, color}]
    budget: null,         // 当月预算
    // 近6月数据（柱状图用）
    last6Months: [],       // ['2026-01', '2026-02', ...]
    monthlyStats: [],      // [{month, income, expense, overBudget}]
    pieReady: false,
    barReady: false
  },

  onLoad() {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    this.setData({ month });
    this._loadAll();
  },

  onShow() {
    if (this._needRefresh) {
      this._needRefresh = false;
      this._loadAll();
    }
  },

  // 底部导航切过来时刷新
  onTabItemTap() {
    this._needRefresh = true;
  },

  onMonthChange(e) {
    const { month } = e.detail;
    this.setData({ month }, () => {
      this._loadStatistics();
      this._loadBudget();
    });
  },

  _loadAll() {
    Promise.all([
      this._loadMonthlyStats(),
      this._loadStatistics(),
      this._loadBudget()
    ]);
  },

  // 加载近6月统计（柱状图）
  _loadMonthlyStats() {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }

    const promises = months.map(m => api.getStatistics(m).then(r => ({ month: m, ...r })));
    return Promise.all(promises).then(results => {
      const stats = results.map(r => ({
        month: r.month,
        income: r.total_income || 0,
        expense: r.total_expense || 0,
        overBudget: false
      }));
      this.setData({ last6Months: months, monthlyStats: stats }, () => {
        this._renderBar();
      });
    }).catch(() => {});
  },

  // 加载当月统计（饼图）
  _loadStatistics() {
    return api.getStatistics(this.data.month).then(res => {
      const cats = res.by_category || [];
      const totalExpense = res.total_expense || 0;
      const totalIncome = res.total_income || 0;

      const expenseByCategory = cats.map((c, i) => {
        const val = parseFloat(c.total) || 0;
        return {
          name: c.category_name,
          value: val,
          color: COLORS[i % COLORS.length],
          pct: totalExpense > 0 ? (val / totalExpense * 100).toFixed(0) : 0
        };
      });

      this.setData({
        totalExpense,
        totalIncome,
        expenseByCategory,
        pieReady: false
      }, () => this._renderPie());

      // 同步更新柱状图的 overBudget
      this._updateOverBudget();
    }).catch(() => {
      this.setData({ totalExpense: 0, totalIncome: 0, expenseByCategory: [], pieReady: false });
    });
  },

  // 加载当月预算
  _loadBudget() {
    return api.getBudget(this.data.month).then(res => {
      const budget = res.budget;
      this.setData({ budget }, () => this._updateOverBudget());
    }).catch(() => {
      this.setData({ budget: null });
    });
  },

  // 标记超支月份
  _updateOverBudget() {
    const { monthlyStats, budget } = this.data;
    if (!budget || !monthlyStats.length) return;
    const updated = monthlyStats.map(s => ({
      ...s,
      overBudget: s.expense > budget
    }));
    this.setData({ monthlyStats: updated }, () => this._renderBar());
  },

  // ==================== 饼图渲染 ====================
  _renderPie() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#pie-canvas').fields({ node: true, size: true }).exec(([res]) => {
      if (!res || !res.node) return;
      const canvas = res.node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const W = res.width;
      const H = res.height;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      const data = this.data.expenseByCategory;
      const total = data.reduce((s, d) => s + d.value, 0);
      const cx = W / 2;
      const cy = H / 2 - 20;
      const R = Math.min(W, H) / 2 - 20;
      const innerR = R * 0.55; // 中间白色留白

      // 清空
      ctx.clearRect(0, 0, W, H);

      if (!data.length || total === 0) {
        ctx.fillStyle = '#ddd';
        ctx.font = '28rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('暂无支出数据', cx, cy + 10);
        this.setData({ pieReady: true });
        return;
      }

      // 画扇区
      let startAngle = -Math.PI / 2;
      data.forEach(d => {
        const ratio = d.value / total;
        const angle = ratio * Math.PI * 2;
        const gap = 0.02; // 扇区间隙
        const sA = startAngle + gap / 2;
        const eA = startAngle + angle - gap / 2;

        ctx.beginPath();
        ctx.moveTo(cx + innerR * Math.cos(sA), cy + innerR * Math.sin(sA));
        ctx.arc(cx, cy, R, sA, eA);
        ctx.arc(cx, cy, innerR, eA, sA, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();

        startAngle += angle;
      });

      // 中间白色留白显示总金额
      ctx.beginPath();
      ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();

      ctx.fillStyle = '#666';
      ctx.font = '24rpx sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('总支出', cx, cy - 16);
      ctx.fillStyle = '#e74c3c';
      ctx.font = 'bold 32rpx sans-serif';
      ctx.fillText(`¥${total.toFixed(2)}`, cx, cy + 20);

      this.setData({ pieReady: true });
    });
  },

  // ==================== 柱状图渲染 ====================
  _renderBar() {
    const query = wx.createSelectorQuery().in(this);
    query.select('#bar-canvas').fields({ node: true, size: true }).exec(([res]) => {
      if (!res || !res.node) return;
      const canvas = res.node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      const W = res.width;
      const H = res.height;

      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);

      const data = this.data.monthlyStats;

      // 布局参数
      const padding = { top: 50, right: 20, bottom: 60, left: 60 };
      const chartW = W - padding.left - padding.right;
      const chartH = H - padding.top - padding.bottom;
      const labels = data.map(d => d.month.slice(5) + '月'); // '06月'
      const n = data.length;
      const pairW = chartW / n;          // 每组（两个月柱）的宽度
      const barW = pairW * 0.35;         // 单根柱宽
      const gap = (pairW - barW * 2) / 2; // 两柱间距

      // Y 轴范围
      const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);

      const toY = val => padding.top + chartH - (val / maxVal) * chartH;

      ctx.clearRect(0, 0, W, H);

      // 网格线 + Y 轴刻度
      ctx.strokeStyle = '#eee';
      ctx.fillStyle = '#999';
      ctx.font = '20rpx sans-serif';
      ctx.textAlign = 'right';
      const ySteps = 5;
      for (let i = 0; i <= ySteps; i++) {
        const val = (maxVal / ySteps * i).toFixed(0);
        const y = toY(maxVal / ySteps * i);
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(W - padding.right, y);
        ctx.stroke();
        ctx.fillText(`¥${val}`, padding.left - 8, y + 6);
      }

      // X 轴标签
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666';
      labels.forEach((label, i) => {
        const x = padding.left + pairW * i + pairW / 2;
        ctx.fillText(label, x, H - padding.bottom + 30);
      });

      // 画柱子
      data.forEach((d, i) => {
        const pairX = padding.left + pairW * i;

        // 支出柱（红）
        const expX = pairX + gap;
        const expY = toY(d.expense);
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(expX, expY, barW, padding.top + chartH - expY);
        // 金额文字
        ctx.fillStyle = '#e74c3c';
        ctx.font = 'bold 18rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`¥${d.expense}`, expX + barW / 2, expY - 6);

        // 收入柱（绿）
        const incX = pairX + gap + barW;
        const incY = toY(d.income);
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(incX, incY, barW, padding.top + chartH - incY);
        // 金额文字
        ctx.fillStyle = '#2ecc71';
        ctx.font = 'bold 18rpx sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`¥${d.income}`, incX + barW / 2, incY - 6);

        // 超支感叹号
        if (d.overBudget) {
          const exclaimX = expX + barW + 4;
          ctx.fillStyle = '#e74c3c';
          ctx.font = 'bold 24rpx sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('!', exclaimX, expY - 6);
        }
      });

      // 图例（放在图表顶部）
      ctx.font = '20rpx sans-serif';
      // 支出
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(padding.left + 20, padding.top, 16, 16);
      ctx.fillStyle = '#666';
      ctx.textAlign = 'left';
      ctx.fillText('支出', padding.left + 44, padding.top + 14);
      // 收入
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(padding.left + 100, padding.top, 16, 16);
      ctx.fillStyle = '#666';
      ctx.fillText('收入', padding.left + 124, padding.top + 14);

      this.setData({ barReady: true });
    });
  }
});
