# SPEC.md — 记账本

## 1. 产品描述

一款个人记账微信小程序，用户可以记录日常的支出和收入，按分类管理，按月查看统计图表。

---

## 2. P0 功能清单

### F1 — 记一笔账
- **触发方式**：首页点击 + 按钮，进入记账页，填写金额、分类、日期、备注后提交
- **预期结果**：账单存入数据库，首页列表即时显示新记录，统计数据同步更新
- **完成判定**：提交后能在首页列表看到，刷新后数据仍然存在

### F2 — 首页月度概览
- **触发方式**：打开小程序默认进入首页
- **预期结果**：顶部显示当月总支出、总收入、结余三个数字；下方列出今日账单
- **完成判定**：数据来自后端，切换月份后数据正确更新

### F3 — 账单列表
- **触发方式**：首页点击"查看全部"进入账单列表页
- **预期结果**：按日期分组显示当月所有账单，每条显示分类图标、金额、备注，支持左滑删除
- **完成判定**：数据按日期倒序排列，删除一条后列表即时更新

### F4 — 月度统计
- **触发方式**：底部导航或首页入口进入统计页
- **预期结果**：Canvas 绘制分类支出饼图 + 月度收支对比柱状图，顶部显示月度切换器
- **完成判定**：切换月份图表数据联动更新，饼图各扇区比例正确

### F5 — 分类管理
- **触发方式**：设置页进入分类管理
- **预期结果**：预设 8 个支出分类 + 4 个收入分类，每项显示图标和名称；支持添加自定义分类
- **完成判定**：自定义分类能在记账页正常选择使用

### F6 — 月度预算
- **触发方式**：设置页设置月度预算金额
- **预期结果**：首页根据预算判断是否超支，超支时支出数字显示红色
- **完成判定**：修改预算后首页判断逻辑即时生效

### F7 — 愿望清单（目标储蓄）
- **触发方式**：首页入口或设置页进入愿望清单页
- **预期结果**：显示所有目标，每个目标显示名称、目标金额、已存金额、圆形进度条、状态标签；支持新建目标（名称+图标+目标金额）；支持手动存入金额到目标；支持删除目标；支持标记目标为已完成
- **完成判定**：新建目标后出现在列表；存入金额后进度条更新；达成 100% 时状态变为"已达成"

---

## 3. 数据模型

### categories（分类表）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | |
| name | TEXT | NOT NULL | 分类名 |
| icon | TEXT | NOT NULL | 图标（emoji 字符） |
| type | TEXT | NOT NULL | "expense" 或 "income" |
| is_preset | INTEGER | DEFAULT 0 | 0=自定义, 1=预设 |
| sort_order | INTEGER | DEFAULT 0 | 显示排序 |

预设支出分类：🍜 餐饮、🚌 交通、🛒 购物、🎮 娱乐、🏠 住房、💊 医疗、📚 学习、✏️ 其他
预设收入分类：💰 工资、🎁 红包、💼 兼职、✏️ 其他

### bills（账单表）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | |
| amount | REAL | NOT NULL | 金额 |
| category_id | INTEGER | NOT NULL, FK→categories.id | 分类 |
| type | TEXT | NOT NULL | "expense" 或 "income" |
| date | TEXT | NOT NULL | ISO 8601 日期，如 "2026-06-28" |
| note | TEXT | DEFAULT "" | 备注 |
| created_at | TEXT | NOT NULL, DEFAULT datetime('now') | 创建时间戳 |

### budgets（预算表）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | |
| month | TEXT | NOT NULL, UNIQUE | "2026-06" |
| amount | REAL | NOT NULL | 预算金额 |

### goals（愿望清单表）
| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INTEGER | PK, AUTOINCREMENT | |
| name | TEXT | NOT NULL | 目标名称，如"买iPhone" |
| icon | TEXT | NOT NULL | emoji 图标 |
| target_amount | REAL | NOT NULL | 目标金额 |
| saved_amount | REAL | DEFAULT 0 | 已存金额 |
| status | TEXT | DEFAULT "active" | "active" / "completed" |
| created_at | TEXT | NOT NULL, DEFAULT datetime('now') | 创建时间 |

---

## 4. API 接口

### GET /api/bills?month=2026-06
获取某月全部账单，按 date 倒序 + created_at 倒序排列。

**响应**：
```json
{
  "bills": [
    {
      "id": 1,
      "amount": 35.5,
      "category_id": 1,
      "type": "expense",
      "date": "2026-06-28",
      "note": "午餐",
      "created_at": "2026-06-28T12:00:00.000Z",
      "category_name": "餐饮",
      "category_icon": "🍜"
    }
  ],
  "total": 1
}
```

### POST /api/bills
创建一条账单。

**请求体**：
```json
{
  "amount": 35.5,
  "category_id": 1,
  "type": "expense",
  "date": "2026-06-28",
  "note": "午餐"
}
```
**校验**：amount 必填且 > 0；category_id 必填且存在；type 必须是 "expense" 或 "income"；date 必填。

**成功响应 201**：返回完整账单对象（同 GET 单条结构）
**失败响应 400**：`{ "error": "..." }`

### PATCH /api/bills/:id
修改一条账单。请求体同 POST（部分字段也可）。返回 200 + 更新后对象。id 不存在返回 404。

### DELETE /api/bills/:id
删除一条账单。成功返回 `{ "message": "deleted", "id": N }`。id 不存在返回 404。

### GET /api/categories?type=expense
获取分类列表，按 sort_order 排列。返回 `{ "categories": [...] }`。

### POST /api/categories
添加自定义分类。请求体：`{ "name": "宠物", "icon": "🐱", "type": "expense" }`。返回 201。

### GET /api/statistics?month=2026-06
月度统计数据。

**响应**：
```json
{
  "month": "2026-06",
  "total_expense": 2450.5,
  "total_income": 5000,
  "expense_by_category": [
    { "category_id": 1, "category_name": "餐饮", "category_icon": "🍜", "total": 980, "count": 15 }
  ],
  "income_by_category": [...],
  "daily_expense": [
    { "date": "2026-06-28", "total": 135.5 }
  ]
}
```

### GET /api/budgets?month=2026-06
查询月度预算。存在返回 `{ "month": "2026-06", "amount": 3000 }`，不存在返回 404。

### POST /api/budgets
设置或更新月度预算。请求体：`{ "month": "2026-06", "amount": 3000 }`。存在则更新，不存在则插入。返回 200。

### GET /api/goals
获取所有愿望清单目标。按 created_at 倒序。

**响应**：
```json
{
  "goals": [
    {
      "id": 1,
      "name": "买iPhone",
      "icon": "📱",
      "target_amount": 8000,
      "saved_amount": 3200,
      "progress": 40,
      "status": "active",
      "created_at": "2026-06-28T12:00:00.000Z"
    }
  ]
}
```

### POST /api/goals
创建愿望清单目标。请求体：`{ "name": "买iPhone", "icon": "📱", "target_amount": 8000 }`。返回 201。

### PATCH /api/goals/:id
更新目标（存入金额 / 标记完成）。请求体：`{ "saved_amount": 3500 }` 或 `{ "status": "completed" }`。返回 200。

### DELETE /api/goals/:id
删除目标。成功返回 `{ "message": "deleted" }`。

---

## 5. 页面结构

| 页面 | 路径 | 说明 |
|------|------|------|
| 首页 | pages/index | 月度概览卡片 + 今日账单 + + 按钮 |
| 记账页 | pages/add-bill | 金额输入 + 分类选择 + 日期 + 备注 |
| 账单列表 | pages/bill-list | 按日期分组 + 左滑删除 + 分类筛选 |
| 统计页 | pages/statistics | Canvas 饼图 + 柱状图 + 月份切换 |
| 愿望清单 | pages/goals | 目标列表 + 进度条 + 新建/存入/完成 |
| 设置页 | pages/settings | 预算设置 + 分类管理 |

**自定义组件**：bill-card、category-picker、month-picker、pie-chart

---

## 6. 不在范围内

- 用户登录 / 注册 / 多账户
- 多币种 / 汇率换算
- 数据导出（Excel / PDF）
- 账单搜索
- 家庭成员共享 / 多设备同步
- 语音输入 / OCR 识别
- 周期账单（每月固定）
- 多级分类（父分类 → 子分类）

---

## 7. 技术约束

- 前端：微信小程序原生，不使用 UI 框架（如 WeUI、Vant）
- 后端：Node.js 18+ + Express 4.x + better-sqlite3
- 数据库：SQLite，单文件存储
- 不使用云开发
- 不支持 ES Module，用 CommonJS（require / module.exports）
- 图表 Canvas 手写，不引入 ECharts 等第三方库
