/**
 * 请求封装
 * @param {Object} options
 * @param {string} options.method - GET/POST/PATCH/DELETE
 * @param {string} options.path - 请求路径，如 /api/bills
 * @param {Object} [options.data] - 请求数据
 * @param {boolean} [options.showLoading] - 是否显示 loading，默认 false
 */
function request(options) {
  const { method = 'GET', path, data, showLoading = false } = options;

  if (showLoading) {
    wx.showLoading({ title: '加载中...', mask: true });
  }

  const baseUrl = getApp().globalData.apiBase;

  return new Promise((resolve, reject) => {
    wx.request({
      url: baseUrl + path,
      method,
      data,
      header: {
        'Content-Type': 'application/json'
      },
      success(res) {
        if (showLoading) wx.hideLoading();

        if (res.statusCode >= 400) {
          const msg = res.data && res.data.error ? res.data.error : '请求失败';
          reject({ statusCode: res.statusCode, message: msg });
        } else {
          resolve(res.data);
        }
      },
      fail(err) {
        if (showLoading) wx.hideLoading();
        console.error('[请求失败]', baseUrl + path, err);
        wx.showToast({ title: '网络错误', icon: 'none', duration: 2000 });
        reject({ message: '网络错误', err });
      }
    });
  });
}

module.exports = { request };
