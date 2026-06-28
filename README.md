# 记账本

微信小程序 + Express 后端，用来记日常开销。

## 跑起来

**后端**
```bash
cd server
npm install
npm run dev        # http://localhost:3000
```

**前端**
微信开发者工具 → 导入项目目录 → 测试号 → 勾选「不校验合法域名」

## 项目结构

```
├── server/                  # 后端
│   ├── src/index.js         # Express 入口
│   ├── src/db.js            # SQLite 连接
│   ├── src/routes/          # API 路由
│   └── db/init.sql          # 建表语句
│
├── pages/                   # 页面
│   ├── index/               # 首页概览
│   ├── add-bill/            # 记账
│   ├── bill-list/           # 账单列表
│   ├── statistics/          # 统计图表
│   └── settings/            # 预算与分类管理
│
├── components/              # 组件
│   ├── bill-card/
│   ├── category-picker/
│   ├── month-picker/
│   └── pie-chart/           # Canvas 饼图
│
└── utils/
    ├── request.js           # wx.request 封装
    └── api.js               # 接口函数
```

## 数据库

三张表：categories（分类）、bills（账单）、budgets（预算）

## API

```
GET    /api/bills?month=2026-06    # 月度账单
POST   /api/bills                  # 创建账单
PATCH  /api/bills/:id              # 修改账单
DELETE /api/bills/:id              # 删除账单
GET    /api/categories             # 分类列表
POST   /api/categories             # 添加分类
GET    /api/statistics?month=      # 月度统计
GET    /api/budgets?month=         # 查询预算
POST   /api/budgets                # 设置预算
```

## 技术点

- Canvas 手写饼图和柱状图
- 乐观更新（记账立刻生效，失败回滚）
- SQL 聚合统计（GROUP BY / SUM）
- 自定义组件封装
