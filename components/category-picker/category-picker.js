// components/category-picker/category-picker.js
Component({
  properties: {
    categories: {
      type: Array,
      value: []
    },
    selectedId: {
      type: Number,
      value: null
    }
  },
  methods: {
    onSelect(e) {
      const item = e.currentTarget.dataset.item;
      this.triggerEvent('change', {
        id: item.id,
        name: item.name,
        icon: item.icon,
        iconBg: item.iconBg
      });
    }
  }
});
