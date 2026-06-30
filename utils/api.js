const { request } = require('./request');

/** 获取账单列表 */
function getBills(month) {
  return request({ method: 'GET', path: `/api/bills?month=${month}` });
}

/** 获取累计积蓄（所有月份） */
function getTotalBalance() {
  return request({ method: 'GET', path: '/api/bills/total-balance' });
}

/** 创建账单 */
function createBill(data) {
  return request({ method: 'POST', path: '/api/bills', data });
}

/** 更新账单 */
function updateBill(id, data) {
  return request({ method: 'PATCH', path: `/api/bills/${id}`, data });
}

/** 删除账单 */
function deleteBill(id) {
  return request({ method: 'DELETE', path: `/api/bills/${id}` });
}

/** 获取分类列表 */
function getCategories(type) {
  return request({ method: 'GET', path: `/api/categories${type ? '?type=' + type : ''}` });
}

/** 添加自定义分类 */
function addCategory(data) {
  return request({ method: 'POST', path: '/api/categories', data });
}

/** 获取月度统计 */
function getStatistics(month) {
  return request({ method: 'GET', path: `/api/statistics?month=${month}` });
}

/** 获取月度预算 */
function getBudget(month) {
  return request({ method: 'GET', path: `/api/budgets?month=${month}` });
}

/** 设置月度预算 */
function setBudget(data) {
  return request({ method: 'POST', path: '/api/budgets', data });
}

/** 获取愿望清单 */
function getGoals() {
  return request({ method: 'GET', path: '/api/goals' });
}

/** 创建愿望目标 */
function createGoal(data) {
  return request({ method: 'POST', path: '/api/goals', data });
}

/** 更新愿望目标（存入/完成） */
function updateGoal(id, data) {
  return request({ method: 'PATCH', path: `/api/goals/${id}`, data });
}

/** 删除愿望目标 */
function deleteGoal(id) {
  return request({ method: 'DELETE', path: `/api/goals/${id}` });
}

module.exports = {
  getBills,
  createBill,
  updateBill,
  deleteBill,
  getCategories,
  addCategory,
  getStatistics,
  getBudget,
  setBudget,
  getTotalBalance,
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal
};
