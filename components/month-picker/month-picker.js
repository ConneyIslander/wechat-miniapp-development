// components/month-picker/month-picker.js
Component({
  properties: {
    month: {
      type: String,
      value: '',
      observer: '_formatMonth'
    }
  },
  data: {
    displayMonth: ''
  },
  methods: {
    _formatMonth(month) {
      if (!month) return;
      const [y, m] = month.split('-');
      this.setData({ displayMonth: `${y}年${parseInt(m)}月` });
    },
    onPrev() {
      const [y, m] = this.data.month.split('-').map(Number);
      const date = new Date(y, m - 2, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      this.triggerEvent('change', { month });
    },
    onNext() {
      const [y, m] = this.data.month.split('-').map(Number);
      const date = new Date(y, m, 1);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      this.triggerEvent('change', { month });
    }
  }
});
