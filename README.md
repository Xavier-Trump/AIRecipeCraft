# 🍳 AI食谱生成器 - 冰箱里有啥做啥

> 智能食材搭配，解决你的“今天吃啥”选择困难症

[![GitHub Stars](https://img.shields.io/github/stars/Xavier-Trump/AIRecipeCraft?style=social)](https://github.com/Xavier-Trump/AIRecipeCraft)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## ✨ 功能特色

- 🎯 **智能搭配**：基于现有食材推荐创意菜谱
- 🛒 **购物清单**：一键生成待采购食材清单
- ⭐ **智能评分**：记录尝试过的菜谱并评分
- 💾 **本地保存**：收藏喜欢的菜谱和常用食材组合
- 📱 **响应式设计**：电脑、手机都能完美使用

## 🚀 快速开始

### 1. 获取项目

```bash
# 克隆项目到本地

git clone https://github.com/Xavier-Trump/AIRecipeCraft.git
cd AIRecipeCraft
```

### 2. 配置API密钥（关键步骤！）

本项目运行需要调用AI工具，你需要自己去注册来获取免费API密钥：

#### 第一步：获取API密钥

1. 访问 [火山引擎](https://www.volcengine.com/)
    
2. 注册账号并登录
    
3. 进入「控制台」→「应用管理」
    
4. 创建新应用，获取 API Key
    
    - 免费额度：足够个人日常使用
        
    - 无需绑卡，注册即用
        

#### 第二步：配置到项目中
# 复制配置文件模板
cp api.config.js

编辑 api.config.js 文件：

```javascript
const API_CONFIG = {
    // 🔑 修改这一行！填入你刚获取的API密钥
    API_KEY: '这里填入你的实际API密钥',  // ← 修改这里
    
    // 以下参数需要自行查找
    ENDPOINT: '接入点是和API KEY配套发放的',
    MODEL: '填入你申请的模型名称(英文，申请时可查)',
    AUTH_TYPE: 'Bearer（默认参数，国外API不是这个）',
    TEMPERATURE: 0.7,
    MAX_TOKENS: 6000  // ← 可自行修改上限
};
```

### 3. 开始使用

直接在浏览器中打开 index.html 即可！
// 双击文件夹内的 index.html 也能快速跳转

## 📖 使用指南

### 1️⃣ 选择食材

点击「选择/添加你的食材」卡片，从分类中选择或自定义添加食材

### 2️⃣ 添加调料

点击「选择/添加你的调料」卡片，选择烹饪所需调料

### 3️⃣ 设置筛选条件（可选）

- 🍜 菜系：中餐、西餐、日韩等
    
- 🌶️ 口味：清淡、微辣、麻辣等
    
- ⏱️ 时间：15分钟以内、30分钟以内等
    
- 📊 难度：新手友好、家常菜、大厨级

### 4️⃣ 生成菜谱

点击「开始生成创意食谱」按钮，AI将为你推荐3-5道创意菜谱

### 5️⃣ 管理你的菜谱

- ⭐ 收藏喜欢的菜谱
    
- ✅ 标记尝试并评分
    
- 📋 生成购物清单（针对缺少的食材）
    
- 💾 保存常用组合（一键加载你的招牌菜配方）
    

## 🛠️ 项目结构

```text
AI食谱生成器/
├── index.html              # 主页面
├── style.css               # 样式文件
├── script.js               # 主逻辑代码
├── api.config.js           # API配置文件
├── assets/                 # 图片资源
│   ├── main_background.jpg
│   └── next_background.jpg
└── README.md               # 本文件
```

## ❓ 常见问题

### Q: 为什么需要API密钥？

A: 菜谱生成功能依赖AI模型分析食材搭配。使用你自己的密钥可以：

- 保护你的隐私和数据安全
    
- 确保服务稳定（使用你自己的额度）
    
- 免费额度足够个人日常使用
    
### Q: 如何获取免费的API额度？

A: 大部分市面AI平台都会为新用户提供免费额度：

1. 注册即送试用额度
    
2. 每日有免费调用次数
    
3. 可在控制台查看剩余额度
    
4. 豆包每个模型都会送50W额度，建议申请豆包的API

### Q: 我的数据安全吗？

A: 完全安全！本项目是纯前端应用：

- 所有数据保存在你的浏览器本地（LocalStorage）
    
- API密钥仅用于与豆包服务器通信
    
- 不会上传你的食材数据到其他服务器
    
### Q: 可以在手机上使用吗？

A: 可以！本页面是响应式设计，在手机浏览器上也能完美显示。

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 本仓库
    
2. 创建功能分支：git checkout -b feature/新功能
    
3. 提交更改：git commit -m '添加新功能'
    
4. 推送到分支：git push origin feature/新功能
    
5. 提交Pull Request
    
## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](https://github.com/Xavier-Trump/AIRecipeCraft/blob/main/LICENSE) 文件了解详情。

## 🙏 致谢

感谢

---

## 📞 支持与反馈

遇到问题？有改进建议？

1. 查看 [Issues](https://github.com/Xavier-Trump/AIRecipeCraft/issues) 是否有类似问题
    
2. 提交新的 Issue

提示：提交Issue时，请包含：

- 使用的浏览器和版本
    
- 错误截图或描述
    
- 复现步骤
    
---

如果这个项目对你有帮助，请给个 ⭐ 星标支持！ 谢谢！😊