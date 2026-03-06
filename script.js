// ========== 配置区域 ==========
// ========== API 配置区域 ==========
// 从 api.config.js 导入配置
let API_KEY = '';
let ENDPOINT = '';
let MODEL = '';
let AUTH_TYPE = '';
let TEMPERATURE = 0.7;
let MAX_TOKENS = 6000;

// 尝试加载用户配置
try {
    // 从 api.config.js 中获取配置
    if (typeof API_CONFIG !== 'undefined') {
        API_KEY = API_CONFIG.API_KEY || '';
        ENDPOINT = API_CONFIG.ENDPOINT;
        MODEL = API_CONFIG.MODEL;
        AUTH_TYPE = API_CONFIG.AUTH_TYPE;
        TEMPERATURE = API_CONFIG.TEMPERATURE || 0.7;
        MAX_TOKENS = API_CONFIG.MAX_TOKENS || 6000;
    }
    
    // 检查配置是否有效
    if (!API_KEY || API_KEY === 'your_api_key_here') {
        console.warn('❌ API 密钥未配置！请修改 api.config.js 文件。');
    }
} catch (error) {
    console.error('❌ 加载 API 配置失败:', error);
}

// ========== 全局变量 ==========
let selectedIngredients = [];           // 已选主要食材
let selectedSeasonings = [];            // 已选调料
let currentRecipeId = '';               // 当前评价的菜谱ID
let starScore = 0;                      // 星级评分
let commonIngredientGroups = JSON.parse(localStorage.getItem('commonIngredientGroups')) || []; // 常用食材组合
let historyRecipes = JSON.parse(localStorage.getItem('historyRecipes')) || []; // 生成历史
let collectRecipes = JSON.parse(localStorage.getItem('collectRecipes')) || []; // 收藏菜谱
let tryRecipes = JSON.parse(localStorage.getItem('tryRecipes')) || {};        // 已尝试菜谱
let currentDisplayedRecipes = [];       // 当前显示的菜谱列表
let editingGroupIndex = -1;             // 当前编辑的组合索引
let isGeneratingFlow = false;           // 是否处于生成菜谱流程中
let isEditingGroupFlow = false;         // 是否处于编辑常用组合流程中
let editingGroupForFlow = -1;           // 编辑流程中的组合索引

// ========== DOM元素获取 ==========
// 筛选相关
const cuisineFilter = document.getElementById('cuisineFilter');
const tasteFilter = document.getElementById('tasteFilter');
const timeFilter = document.getElementById('timeFilter');
const levelFilter = document.getElementById('levelFilter');
// 食材相关
const categoryTabs = document.querySelectorAll('.category-tab');
const ingredientSearch = document.getElementById('ingredientSearch');
const ingredientList = document.getElementById('ingredientList');
const ingredientItems = document.querySelectorAll('.ingredient-item[data-type="ingredient"]');
const customIngredient = document.getElementById('customIngredient');
const addIngredientBtn = document.getElementById('addIngredientBtn');
const selectedIngredientsEl = document.getElementById('selectedIngredients');
// 调料相关
const seasoningSearch = document.getElementById('seasoningSearch');
const seasoningList = document.getElementById('seasoningList');
const seasoningItems = document.querySelectorAll('.ingredient-item[data-type="seasoning"]');
const customSeasoning = document.getElementById('customSeasoning');
const addSeasoningBtn = document.getElementById('addSeasoningBtn');
const selectedSeasoningsEl = document.getElementById('selectedSeasonings');
// 保存/管理
const saveGroupBtn = document.getElementById('saveGroupBtn');
const manageGroupBtn = document.getElementById('manageGroupBtn');
// 生成相关
const generateBtn = document.getElementById('generateBtn');
const loading = document.getElementById('loading');
const recipeList = document.getElementById('recipeList');
const emptyTip = document.getElementById('emptyTip');
// 购物清单
const shoppingList = []; // 购物清单数组
const shoppingModal = document.getElementById('shoppingModal'); 
const shoppingLoadingModal = document.getElementById('shoppingLoadingModal'); 
const shoppingContent = document.getElementById('shoppingContent');
const closeShoppingModal = document.getElementById('closeShoppingModal');
const cancelShoppingModal = document.getElementById('cancelShoppingModal');
const clearShoppingBtn = document.getElementById('clearShoppingBtn');
const exportShoppingBtn = document.getElementById('exportShoppingBtn');
// 历史/收藏相关
const historyCard = document.getElementById('historyCard');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const cancelHistoryModal = document.getElementById('cancelHistoryModal');
const historyContent = document.getElementById('historyContent');
const historyCountDisplay = document.getElementById('historyCountDisplay');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const collectCard = document.getElementById('collectCard');
const collectModal = document.getElementById('collectModal');
const closeCollectModal = document.getElementById('closeCollectModal');
const cancelCollectModal = document.getElementById('cancelCollectModal');
const collectContent = document.getElementById('collectContent');
const collectCountDisplay = document.getElementById('collectCountDisplay');
const clearCollectBtn = document.getElementById('clearCollectBtn');
// 常用组合管理相关
const groupModal = document.getElementById('groupModal');
const closeGroupModal = document.getElementById('closeGroupModal');
const cancelGroupModal = document.getElementById('cancelGroupModal');
const groupContent = document.getElementById('groupContent');
// 评价弹窗
const evaluateModal = document.getElementById('evaluateModal');
const starRating = document.getElementById('starRating');
const commentInput = document.getElementById('commentInput');
const cancelEvaluate = document.getElementById('cancelEvaluate');
const confirmEvaluate = document.getElementById('confirmEvaluate');
// 食材/调料模态窗口
const ingredientCard = document.getElementById('ingredientCard');
const ingredientModal = document.getElementById('ingredientModal');
const closeIngredientModal = document.getElementById('closeIngredientModal');
const cancelIngredientModal = document.getElementById('cancelIngredientModal');
const confirmIngredientModal = document.getElementById('confirmIngredientModal');
const clearAllIngredientsBtn = document.getElementById('clearAllIngredientsBtn');
const ingredientCount = document.getElementById('ingredientCount');
const seasoningCard = document.getElementById('seasoningCard');
const seasoningModal = document.getElementById('seasoningModal');
const closeSeasoningModal = document.getElementById('closeSeasoningModal');
const cancelSeasoningModal = document.getElementById('cancelSeasoningModal');
const confirmSeasoningModal = document.getElementById('confirmSeasoningModal');
const clearAllSeasoningsBtn = document.getElementById('clearAllSeasoningsBtn');
const seasoningCount = document.getElementById('seasoningCount');
// 菜谱详情弹窗
const recipeDetailModal = document.getElementById('recipeDetailModal');
const closeRecipeDetailModal = document.getElementById('closeRecipeDetailModal');
const cancelRecipeDetailModal = document.getElementById('cancelRecipeDetailModal');
const recipeDetailContent = document.getElementById('recipeDetailContent');

// ========== 初始化函数 ==========
/**
 * 初始化应用程序，设置初始状态并绑定事件
 */
function init() {
    renderSelectedIngredients();
    renderSelectedSeasonings();
    updateIngredientCount();
    updateSeasoningCount();
    updateHistoryCount();
    updateCollectCount();
    updateSaveButtonState();
    updateSaveButtonText();
    generateBtn.disabled = false;
    renderHistory();
    renderCollect();
    bindEvents();
}

// ========== 事件绑定 ==========
/**
 * 绑定所有DOM事件监听器
 */
function bindEvents() {
    // 食材卡片点击事件
    ingredientCard.addEventListener('click', () => {
        ingredientModal.classList.add('active');
    });

    // 关闭食材选择模态窗口
    closeIngredientModal.addEventListener('click', () => {
        ingredientModal.classList.remove('active');
        if (isGeneratingFlow) {
            isGeneratingFlow = false;
            updateModalButtons();
        }
    });

    cancelIngredientModal.addEventListener('click', () => {
        ingredientModal.classList.remove('active');
        if (isGeneratingFlow) {
            isGeneratingFlow = false;
            updateModalButtons();
        }
    });

    confirmIngredientModal.addEventListener('click', () => {
        if (isGeneratingFlow) {
            if (selectedIngredients.length === 0) {
                alert('请至少选择一种食材！');
                return;
            }
            ingredientModal.classList.remove('active');
            seasoningModal.classList.add('active');
            updateModalButtons();
        } else if (isEditingGroupFlow) {
            if (selectedIngredients.length === 0) {
                alert('请至少选择一种食材！');
                return;
            }
            ingredientModal.classList.remove('active');
            seasoningModal.classList.add('active');
            updateModalButtons();
        } else {
            ingredientModal.classList.remove('active');
            updateIngredientCount();
        }
    });

    // 一键清空食材
    clearAllIngredientsBtn.addEventListener('click', () => {
        if (selectedIngredients.length === 0) return;
        if (confirm('确定要清空所有已选食材吗？')) {
            ingredientItems.forEach(item => item.classList.remove('selected'));
            selectedIngredients = [];
            renderSelectedIngredients();
            updateIngredientCount();
        }
    });

    // 打开调料选择模态窗口
    seasoningCard.addEventListener('click', () => {
        seasoningModal.classList.add('active');
    });

    // 关闭调料选择模态窗口
    closeSeasoningModal.addEventListener('click', () => {
        seasoningModal.classList.remove('active');
        if (isGeneratingFlow) {
            isGeneratingFlow = false;
            updateModalButtons();
        } else if (isEditingGroupFlow) {
            isEditingGroupFlow = false;
            editingGroupForFlow = -1;
            updateModalButtons();
        }
    });

    cancelSeasoningModal.addEventListener('click', () => {
        seasoningModal.classList.remove('active');
        if (isGeneratingFlow) {
            ingredientModal.classList.add('active');
            updateModalButtons();
        } else if (isEditingGroupFlow) {
            ingredientModal.classList.add('active');
            updateModalButtons();
        }
    });

    confirmSeasoningModal.addEventListener('click', async () => {
        if (isGeneratingFlow) {
            seasoningModal.classList.remove('active');
            isGeneratingFlow = false;
            updateModalButtons();
            await handleGenerateRecipe();
        } else if (isEditingGroupFlow) {
            if (selectedIngredients.length === 0 || selectedSeasonings.length === 0) {
                alert('请先选择食材和调料！');
                return;
            }
            const group = commonIngredientGroups[editingGroupForFlow];
            const oldName = group.name;
            const groupName = prompt('请输入常用组合名称：', oldName);
            if (!groupName) return;

            commonIngredientGroups[editingGroupForFlow] = {
                name: groupName,
                ingredients: [...selectedIngredients],
                seasonings: [...selectedSeasonings],
                createTime: group.createTime,
                updateTime: new Date().toLocaleString()
            };
            localStorage.setItem('commonIngredientGroups', JSON.stringify(commonIngredientGroups));
            
            seasoningModal.classList.remove('active');
            isEditingGroupFlow = false;
            editingGroupForFlow = -1;
            updateModalButtons();
            alert('常用食材组合已更新！');
            renderGroupList();
        } else {
            seasoningModal.classList.remove('active');
            updateSeasoningCount();
        }
    });

    // 一键清空调料
    clearAllSeasoningsBtn.addEventListener('click', () => {
        if (selectedSeasonings.length === 0) return;
        if (confirm('确定要清空所有已选调料吗？')) {
            seasoningItems.forEach(item => item.classList.remove('selected'));
            selectedSeasonings = [];
            renderSelectedSeasonings();
            updateSeasoningCount();
        }
    });

    // 点击模态窗口背景关闭
    ingredientModal.addEventListener('click', (e) => {
        if (e.target === ingredientModal) {
            ingredientModal.classList.remove('active');
        }
    });

    seasoningModal.addEventListener('click', (e) => {
        if (e.target === seasoningModal) {
            seasoningModal.classList.remove('active');
        }
    });

    // 食材分类标签切换
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            document.querySelectorAll(`.category-tab[data-type="${type}"]`).forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const category = tab.dataset.category;
            if (type === 'ingredient') {
                document.querySelectorAll('.subcategory-container[data-type="ingredient"]').forEach(container => {
                    container.classList.remove('active');
                });
                if (category !== 'all') {
                    const subcategoryContainer = document.getElementById(`${category}-subcategory`);
                    if (subcategoryContainer) {
                        subcategoryContainer.classList.add('active');
                    }
                }
                filterIngredientsByCategory(category);
            } else if (type === 'seasoning') {
                filterSeasoningsByCategory(category);
            }
        });
    });

    // 子分类标签切换
    const subcategoryTabs = document.querySelectorAll('.subcategory-tab');
    subcategoryTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            const category = tab.dataset.category;
            const subcategory = tab.dataset.subcategory;
            document.querySelectorAll(`.subcategory-tab[data-category="${category}"][data-type="${type}"]`).forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            if (type === 'ingredient') {
                filterIngredientsBySubcategory(category, subcategory);
            }
        });
    });

    // 食材搜索
    ingredientSearch.addEventListener('input', (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        filterIngredientsBySearch(keyword);
    });

    // 调料搜索
    seasoningSearch.addEventListener('input', (e) => {
        const keyword = e.target.value.trim().toLowerCase();
        filterSeasoningsBySearch(keyword);
    });

    // 食材项点击选择
    ingredientItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
            const ingredient = item.textContent.trim();
            if (item.classList.contains('selected')) {
                if (!selectedIngredients.some(i => i.name === ingredient)) {
                    selectedIngredients.push({ name: ingredient, quantity: '' });
                }
            } else {
                selectedIngredients = selectedIngredients.filter(i => i.name !== ingredient);
            }
            renderSelectedIngredients();
            updateIngredientCount();
        });
    });

    // 调料项点击选择
    seasoningItems.forEach(item => {
        item.addEventListener('click', () => {
            item.classList.toggle('selected');
            const seasoning = item.textContent.trim();
            if (item.classList.contains('selected')) {
                if (!selectedSeasonings.includes(seasoning)) {
                    selectedSeasonings.push(seasoning);
                }
            } else {
                selectedSeasonings = selectedSeasonings.filter(i => i !== seasoning);
            }
            renderSelectedSeasonings();
            updateSeasoningCount();
        });
    });

    // 自定义添加食材
    addIngredientBtn.addEventListener('click', () => {
        const input = customIngredient.value.trim();
        if (!input) {
            alert('请输入食材名称！');
            return;
        }

        let name = input;
        let quantity = '';

        const match = input.match(/^(.+?)(\d+[^\d\s]+)$/);
        if (match) {
            name = match[1].trim();
            quantity = match[2].trim();
        }

        if (selectedIngredients.some(i => i.name === name)) {
            alert('该食材已添加！');
            customIngredient.value = '';
            return;
        }
        selectedIngredients.push({ name: name, quantity: quantity });
        customIngredient.value = '';
        renderSelectedIngredients();
        updateIngredientCount();
    });

    // 自定义添加调料
    addSeasoningBtn.addEventListener('click', () => {
        const seasoning = customSeasoning.value.trim();
        if (!seasoning) {
            alert('请输入调料名称！');
            return;
        }
        if (selectedSeasonings.includes(seasoning)) {
            alert('该调料已添加！');
            customSeasoning.value = '';
            return;
        }
        selectedSeasonings.push(seasoning);
        customSeasoning.value = '';
        renderSelectedSeasonings();
        updateSeasoningCount();
    });

    // 保存常用食材组合
    saveGroupBtn.addEventListener('click', () => {
        if (selectedIngredients.length === 0 && selectedSeasonings.length === 0) {
            alert('请先选择/添加食材或调料！');
            return;
        }

        if (editingGroupIndex >= 0) {
            const oldName = commonIngredientGroups[editingGroupIndex].name;
            const groupName = prompt('请输入常用组合名称：', oldName);
            if (!groupName) return;

            commonIngredientGroups[editingGroupIndex] = {
                name: groupName,
                ingredients: [...selectedIngredients],
                seasonings: [...selectedSeasonings],
                createTime: commonIngredientGroups[editingGroupIndex].createTime,
                updateTime: new Date().toLocaleString()
            };
            localStorage.setItem('commonIngredientGroups', JSON.stringify(commonIngredientGroups));
            alert('常用食材组合更新成功！');

            editingGroupIndex = -1;
            updateSaveButtonText();
        } else {
            const groupName = prompt('请输入常用组合名称：', '我的家常菜组合');
            if (!groupName) return;
            const group = {
                name: groupName,
                ingredients: [...selectedIngredients],
                seasonings: [...selectedSeasonings],
                createTime: new Date().toLocaleString()
            };
            commonIngredientGroups.push(group);
            localStorage.setItem('commonIngredientGroups', JSON.stringify(commonIngredientGroups));
            alert('常用食材组合保存成功！');
        }
    });

    // 管理常用食材组合（加载/删除）
    manageGroupBtn.addEventListener('click', () => {
        if (commonIngredientGroups.length === 0) {
            alert('暂无保存的常用食材组合！');
            return;
        }
        groupModal.classList.add('active');
        renderGroupList();
    });

    // 生成食谱按钮
    generateBtn.addEventListener('click', async () => {
        if (selectedIngredients.length === 0) {
            alert('请先添加至少一种食材！');
            return;
        }

        if (selectedSeasonings.length === 0) {
            alert('请先添加至少一种调料！');
            return;
        }

        await handleGenerateRecipe();
    });

    // 清空购物清单
    clearShoppingBtn.addEventListener('click', () => {
        shoppingContent.innerHTML = '';
        shoppingList.classList.remove('active');
        localStorage.removeItem('shoppingList');
    });

    // 导出购物清单
    const exportShoppingBtn = document.getElementById('exportShoppingBtn');
    exportShoppingBtn.addEventListener('click', () => {
        exportShoppingList();
    });

    // 打开生成历史模态窗口
    historyCard.addEventListener('click', () => {
        historyModal.classList.add('active');
        renderHistory();
    });

    // 关闭生成历史模态窗口
    closeHistoryModal.addEventListener('click', () => {
        historyModal.classList.remove('active');
    });

    cancelHistoryModal.addEventListener('click', () => {
        historyModal.classList.remove('active');
    });

    // 点击模态窗口背景关闭
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.classList.remove('active');
        }
    });

    // 一键清空历史记录
    clearHistoryBtn.addEventListener('click', () => {
        if (historyRecipes.length === 0) {
            alert('暂无历史记录！');
            return;
        }
        if (confirm(`确定要清空所有历史记录吗？\n\n共 ${historyRecipes.length} 条记录将被永久删除，此操作不可恢复！`)) {
            historyRecipes = [];
            localStorage.setItem('historyRecipes', JSON.stringify(historyRecipes));
            renderHistory();
            updateHistoryCount();
            alert('历史记录已清空！');
        }
    });

    // 打开我的收藏模态窗口
    collectCard.addEventListener('click', () => {
        collectModal.classList.add('active');
        renderCollect();
    });

    // 关闭我的收藏模态窗口
    closeCollectModal.addEventListener('click', () => {
        collectModal.classList.remove('active');
    });

    cancelCollectModal.addEventListener('click', () => {
        collectModal.classList.remove('active');
    });

    // 点击模态窗口背景关闭
    collectModal.addEventListener('click', (e) => {
        if (e.target === collectModal) {
            collectModal.classList.remove('active');
        }
    });

    // 一键清空收藏
    clearCollectBtn.addEventListener('click', () => {
        if (collectRecipes.length === 0) {
            alert('暂无收藏记录！');
            return;
        }
        if (confirm(`确定要清空所有收藏吗？\n\n共 ${collectRecipes.length} 条收藏将被永久删除，此操作不可恢复！`)) {
            collectRecipes = [];
            localStorage.setItem('collectRecipes', JSON.stringify(collectRecipes));
            renderCollect();
            updateCollectCount();
            alert('收藏已清空！');
        }
    });

    // 打开常用组合管理模态窗口（通过加载按钮）
    // 关闭常用组合管理模态窗口
    closeGroupModal.addEventListener('click', () => {
        groupModal.classList.remove('active');
    });

    cancelGroupModal.addEventListener('click', () => {
        groupModal.classList.remove('active');
    });

    // 一键删除常用组合
    const bulkDeleteGroupBtn = document.getElementById('bulkDeleteGroupBtn');
    bulkDeleteGroupBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.group-checkbox:checked');
        if (checkboxes.length === 0) {
            alert('请先选择要删除的常用组合！');
            return;
        }

        if (confirm(`确定要删除选中的 ${checkboxes.length} 个常用组合吗？此操作不可恢复！`)) {
            const indicesToDelete = Array.from(checkboxes)
                .map(cb => parseInt(cb.dataset.index))
                .sort((a, b) => b - a);

            indicesToDelete.forEach(index => {
                commonIngredientGroups.splice(index, 1);
            });

            localStorage.setItem('commonIngredientGroups', JSON.stringify(commonIngredientGroups));
            renderGroupList();
            alert(`已成功删除 ${checkboxes.length} 个常用组合！`);
        }
    });

    // 点击模态窗口背景关闭
    groupModal.addEventListener('click', (e) => {
        if (e.target === groupModal) {
            groupModal.classList.remove('active');
        }
    });

    // 星级评分
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            starScore = index + 1;
            stars.forEach((s, i) => {
                if (i < starScore) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });

    // 取消评价
    cancelEvaluate.addEventListener('click', () => {
        closeEvaluateModal();
    });

    // 确认评价
    confirmEvaluate.addEventListener('click', () => {
        const comment = commentInput.value.trim();
        tryRecipes[currentRecipeId] = {
            score: starScore,
            comment: comment
        };
        localStorage.setItem('tryRecipes', JSON.stringify(tryRecipes));
        closeEvaluateModal();

        renderHistory();
        renderCollect();
        if (currentDisplayedRecipes.length > 0) {
            renderRecipeList(currentDisplayedRecipes);
        }

        const detailModal = document.getElementById('recipeDetailModal');
        if (detailModal.classList.contains('active')) {
            let targetRecipe = null;
            
            const historyItem = historyRecipes.find(h => h.id === currentRecipeId);
            if (historyItem) targetRecipe = historyItem.recipe;

            if (!targetRecipe) {
                targetRecipe = collectRecipes.find(r => r.id === currentRecipeId);
            }

            if (!targetRecipe) {
                targetRecipe = currentDisplayedRecipes.find(r => r.id === currentRecipeId);
            }

            if (targetRecipe) {
                showRecipeDetail(targetRecipe);
            }
        }
    });

    // 点击空白处关闭弹窗
    window.addEventListener('click', (e) => {
        if (e.target === evaluateModal) {
            closeEvaluateModal();
        }
    });

    // 关闭菜谱详情弹窗
    closeRecipeDetailModal.addEventListener('click', () => {
        recipeDetailModal.classList.remove('active');
    });

    cancelRecipeDetailModal.addEventListener('click', () => {
        recipeDetailModal.classList.remove('active');
    });

    // 点击模态窗口背景关闭
    recipeDetailModal.addEventListener('click', (e) => {
        if (e.target === recipeDetailModal) {
            recipeDetailModal.classList.remove('active');
        }
    });

    closeShoppingModal.addEventListener('click', () => {
        shoppingModal.classList.remove('active');
    });
    
    cancelShoppingModal.addEventListener('click', () => {
        shoppingModal.classList.remove('active');
    });
    
    shoppingModal.addEventListener('click', (e) => {
        if (e.target === shoppingModal) {
            shoppingModal.classList.remove('active');
        }
    });

    clearShoppingBtn.addEventListener('click', () => {
        if(confirm('确定要清空购物清单吗？')) {
            shoppingContent.innerHTML = '<div class="empty-tip" style="margin-top:20px;">购物清单已清空</div>';
            localStorage.removeItem('shoppingList');
        }
    });

    exportShoppingBtn.addEventListener('click', () => {
        exportShoppingList();
    });
}

// ========== 食材筛选相关 ==========
/**
 * 按分类筛选食材
 * @param {string} category - 食材分类
 */
function filterIngredientsByCategory(category) {
    ingredientItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'inline-block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * 按子分类筛选食材
 * @param {string} category - 主分类
 * @param {string} subcategory - 子分类
 */
function filterIngredientsBySubcategory(category, subcategory) {
    ingredientItems.forEach(item => {
        if (subcategory === 'all') {
            if (item.dataset.category === category) {
                item.style.display = 'inline-block';
            } else {
                item.style.display = 'none';
            }
        } else {
            if (item.dataset.category === category && item.dataset.subcategory === subcategory) {
                item.style.display = 'inline-block';
            } else {
                item.style.display = 'none';
            }
        }
    });
}

/**
 * 按搜索关键词筛选食材
 * @param {string} keyword - 搜索关键词
 */
function filterIngredientsBySearch(keyword) {
    if (!keyword) {
        const activeCategory = document.querySelector('.category-tab[data-type="ingredient"].active')?.dataset.category || 'all';
        const activeSubcategory = document.querySelector('.subcategory-tab.active[data-type="ingredient"]')?.dataset.subcategory;
        if (activeSubcategory && activeCategory !== 'all') {
            filterIngredientsBySubcategory(activeCategory, activeSubcategory);
        } else {
            filterIngredientsByCategory(activeCategory);
        }
        return;
    }
    ingredientItems.forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        if (text.includes(keyword)) {
            item.style.display = 'inline-block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * 按分类筛选调料
 * @param {string} category - 调料分类
 */
function filterSeasoningsByCategory(category) {
    seasoningItems.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'inline-block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * 按搜索关键词筛选调料
 * @param {string} keyword - 搜索关键词
 */
function filterSeasoningsBySearch(keyword) {
    if (!keyword) {
        const activeCategory = document.querySelector('.category-tab[data-type="seasoning"].active')?.dataset.category || 'all';
        filterSeasoningsByCategory(activeCategory);
        return;
    }
    seasoningItems.forEach(item => {
        const text = item.textContent.trim().toLowerCase();
        if (text.includes(keyword)) {
            item.style.display = 'inline-block';
        } else {
            item.style.display = 'none';
        }
    });
}

/**
 * 渲染已选食材到界面
 */
function renderSelectedIngredients() {
    selectedIngredientsEl.innerHTML = '';
    if (selectedIngredients.length === 0) {
        selectedIngredientsEl.innerHTML = '<span style="color:#999;font-size:14px">没有你需要的食材吗？那就在上方的自定义添加栏那里添加吧！</span>';
        if (selectedSeasonings.length === 0 && editingGroupIndex >= 0) {
            editingGroupIndex = -1;
            updateSaveButtonText();
        }
        checkGenerateButton();
        updateSaveButtonState();
        return;
    }
    selectedIngredients.forEach((ingredient, index) => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `
            <span>${ingredient.name}</span>
            <input type="text" class="quantity-input" placeholder="如：200g" value="${ingredient.quantity || ''}" data-index="${index}">
            <span class="close-icon" data-ingredient="${ingredient.name}">×</span>
        `;
        selectedIngredientsEl.appendChild(item);

        const quantityInput = item.querySelector('.quantity-input');
        quantityInput.addEventListener('input', (e) => {
            const idx = parseInt(e.target.dataset.index);
            selectedIngredients[idx].quantity = e.target.value.trim();
        });

        item.querySelector('.close-icon').addEventListener('click', (e) => {
            const delIngredient = e.target.dataset.ingredient;
            selectedIngredients = selectedIngredients.filter(i => i.name !== delIngredient);
            ingredientItems.forEach(i => {
                if (i.textContent.trim() === delIngredient) {
                    i.classList.remove('selected');
                }
            });
            renderSelectedIngredients();
            updateIngredientCount();
        });
    });
    checkGenerateButton();
    updateIngredientCount();
    updateSaveButtonState();
}

/**
 * 渲染已选调料到界面
 */
function renderSelectedSeasonings() {
    selectedSeasoningsEl.innerHTML = '';
    if (selectedSeasonings.length === 0) {
        selectedSeasoningsEl.innerHTML = '<span style="color:#999;font-size:14px">没有你需要的调料吗？那就在上方的自定义添加栏那里添加吧！</span>';
        if (selectedIngredients.length === 0 && editingGroupIndex >= 0) {
            editingGroupIndex = -1;
            updateSaveButtonText();
        }
        updateSaveButtonState();
        return;
    }
    selectedSeasonings.forEach(seasoning => {
        const item = document.createElement('div');
        item.className = 'selected-item';
        item.innerHTML = `
            <span>${seasoning}</span>
            <span class="close-icon" data-seasoning="${seasoning}">×</span>
        `;
        selectedSeasoningsEl.appendChild(item);
        item.querySelector('.close-icon').addEventListener('click', (e) => {
            const delSeasoning = e.target.dataset.seasoning;
            selectedSeasonings = selectedSeasonings.filter(i => i !== delSeasoning);
            seasoningItems.forEach(i => {
                if (i.textContent.trim() === delSeasoning) {
                    i.classList.remove('selected');
                }
            });
            renderSelectedSeasonings();
            updateSeasoningCount();
        });
    });
    updateSeasoningCount();
    updateSaveButtonState();
}

/**
 * 检查生成按钮状态
 */
function checkGenerateButton() {
    generateBtn.disabled = false;
}

/**
 * 更新食材卡片计数显示
 */
function updateIngredientCount() {
    ingredientCount.textContent = `已选 ${selectedIngredients.length} 种`;
}

/**
 * 更新调料卡片计数显示
 */
function updateSeasoningCount() {
    seasoningCount.textContent = `已选 ${selectedSeasonings.length} 种`;
}

/**
 * 更新模态窗口按钮文本（根据流程模式）
 */
function updateModalButtons() {
    if (isGeneratingFlow) {
        confirmIngredientModal.textContent = '下一步';
        confirmSeasoningModal.textContent = '生成菜谱';
        cancelSeasoningModal.textContent = '上一步';
    } else if (isEditingGroupFlow) {
        confirmIngredientModal.textContent = '下一步';
        confirmSeasoningModal.textContent = '保存';
        cancelSeasoningModal.textContent = '上一步';
    } else {
        confirmIngredientModal.textContent = '确认';
        confirmSeasoningModal.textContent = '确认';
        cancelSeasoningModal.textContent = '取消';
    }
}

/**
 * 更新历史卡片计数显示
 */
function updateHistoryCount() {
    historyCountDisplay.textContent = `共 ${historyRecipes.length} 条`;
}

/**
 * 更新收藏卡片计数显示
 */
function updateCollectCount() {
    collectCountDisplay.textContent = `共 ${collectRecipes.length} 条`;
}

/**
 * 更新保存常用组合按钮状态
 */
function updateSaveButtonState() {
    if (selectedIngredients.length > 0 && selectedSeasonings.length > 0) {
        saveGroupBtn.disabled = false;
    } else {
        saveGroupBtn.disabled = true;
    }
}

/**
 * 更新保存按钮文本（根据编辑模式）
 */
function updateSaveButtonText() {
    if (editingGroupIndex >= 0) {
        saveGroupBtn.innerHTML = '<i class="fas fa-edit"></i> 更新常用组合';
    } else {
        saveGroupBtn.innerHTML = '<i class="fas fa-save"></i> 保存常用组合';
    }
}

/**
 * 设置全选/反选逻辑
 * @param {string} itemCheckboxSelector - 单项复选框选择器
 * @param {string} selectAllCheckboxId - 全选复选框ID
 */
function setupSelectAllLogic(itemCheckboxSelector, selectAllCheckboxId) {
    const selectAllCheckbox = document.getElementById(selectAllCheckboxId);
    if (!selectAllCheckbox) return;

    const itemCheckboxes = document.querySelectorAll(itemCheckboxSelector);

    selectAllCheckbox.addEventListener('change', (e) => {
        itemCheckboxes.forEach(cb => {
            cb.checked = e.target.checked;
        });
        if (selectAllCheckboxId === 'selectAllRecipes') {
            updateSelectedCount();
        } else if (selectAllCheckboxId === 'selectAllHistory') {
            updateHistorySelectedCount();
        } else if (selectAllCheckboxId === 'selectAllCollect') {
            updateCollectSelectedCount();
        }
    });

    itemCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(itemCheckboxes).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;

            if (selectAllCheckboxId === 'selectAllRecipes') {
                updateSelectedCount();
            } else if (selectAllCheckboxId === 'selectAllHistory') {
                updateHistorySelectedCount();
            } else if (selectAllCheckboxId === 'selectAllCollect') {
                updateCollectSelectedCount();
            }
        });
    });
}

// ========== 食谱生成相关 ==========
/**
 * 处理生成食谱的主要逻辑
 */
async function handleGenerateRecipe() {
    const cuisine = cuisineFilter.value;
    const taste = tasteFilter.value;
    const cookTime = timeFilter.value;
    const difficulty = levelFilter.value;
    const ingredients = selectedIngredients.map(i => {
        return i.quantity ? `${i.name}${i.quantity}` : i.name;
    }).join('、');
    const seasonings = selectedSeasonings.join('、');

    loading.classList.add('active');
    recipeList.classList.remove('active');
    emptyTip.style.display = 'none';

    try {
        const recipes = await generateRecipe(ingredients, seasonings, cuisine, taste, cookTime, difficulty);
        loading.classList.remove('active');
        const createTime = new Date().toLocaleString();
        const baseTimestamp = Date.now();
        recipes.forEach((recipe, index) => {
            const recipeId = `${baseTimestamp}_${index}`;
            recipe.id = recipeId;
            const historyItem = {
                id: recipeId,
                createTime: createTime,
                ingredients: ingredients,
                seasonings: seasonings,
                filter: { cuisine, taste, cookTime, difficulty },
                recipe: recipe
            };
            historyRecipes.push(historyItem);
        });
        localStorage.setItem('historyRecipes', JSON.stringify(historyRecipes));
        renderRecipeList(recipes);
        renderHistory();
        updateHistoryCount();
    } catch (error) {
        loading.classList.remove('active');
        emptyTip.style.display = 'block';
        emptyTip.innerHTML = `生成失败：${error.message}<br>请检查API密钥、网络或输入的食材！`;
        console.error('生成食谱错误：', error);
    }
}

/**
 * 调用AI API生成食谱
 * @param {string} ingredients - 食材列表
 * @param {string} seasonings - 调料列表
 * @param {string} cuisine - 菜系
 * @param {string} taste - 口味
 * @param {string} cookTime - 烹饪时间
 * @param {string} difficulty - 难度
 * @returns {Promise<Array>} 生成的食谱数组
 */
async function generateRecipe(ingredients, seasonings, cuisine, taste, cookTime, difficulty) {
    let prompt = `【核心规则 - 必须严格遵守，违反则无效】\n`;
    prompt += `1. 用户提供的主要食材：${ingredients}。这些是用户已有的食材，必须优先使用。\n`;
    prompt += `2. 用户提供的调料：${seasonings || '基础调料（盐、油、酱油、醋、糖、葱姜蒜）'}。\n`;
    prompt += `3. 【重要】默认可用的基础物品（无需列入缺少食材）：清水、水、热水、开水、冷水、温水、凉水。这些是每个厨房都有的，绝对不要列为缺少的食材！\n`;
    prompt += `4. 必须生成3-5道可行菜谱，每道菜谱包含：\n`;
    prompt += `   - 菜名：【重要】必须极具创意和诗意，禁止使用平淡的传统菜名！\n`;
    prompt += `     * 创意命名方式：使用成语典故（如"锦鲤跳龙门"代替"红烧鲤鱼"）、诗词意境（如"碧玉妆成"代替"清炒豆角"）、\n`;
    prompt += `       文化寓意（如"金玉满堂"代替"玉米炒虾仁"）、视觉描述（如"翡翠白玉汤"代替"豆腐青菜汤"）\n`;
    prompt += `     * 禁止使用：番茄炒蛋、红烧肉、清蒸鱼等普通名称，必须用富有想象力的名字\n`;
    prompt += `     * 参考风格：宫廷菜命名、文人雅趣、民间传说、自然意象\n`;
    prompt += `   - 所需食材：区分"已有食材"和"缺少食材"（如需要额外食材才能完成菜品，可适当添加1-2种常见食材）\n`;
    prompt += `   - 烹饪步骤：详细分步说明（5-8步），每步清晰明了\n`;
    prompt += `   - 预估烹饪时间：准确估算\n`;
    prompt += `   - 难度等级：新手友好/家常菜/大厨级\n`;
    prompt += `   - 菜系：中餐/西餐/日韩/东南亚等\n`;
    prompt += `4. 食材搭配必须合理，符合大众口味，营养均衡，适合家庭烹饪。\n`;
    prompt += `5. 若用户筛选了菜系/口味/时间/难度，必须严格按筛选条件生成。\n`;
    prompt += `6. 输出格式严格按以下JSON格式，无其他多余文字，JSON可直接解析：\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "name": "富有诗意的创意菜名（如：锦鲤跳龙门、碧玉妆成、金玉满堂）",\n`;
    prompt += `    "cuisine": "菜系",\n`;
    prompt += `    "time": "预估时间（如20分钟）",\n`;
    prompt += `    "difficulty": "难度（新手友好/家常菜/大厨级）",\n`;
    prompt += `    "ingredients": {\n`;
    prompt += `      "has": ["用户已有的食材1（带数量）", "用户已有的食材2（带数量）"],\n`;
    prompt += `      "lack": ["缺少的食材1（带数量，可选）", "缺少的食材2（带数量，可选）"]\n`;
    prompt += `    },\n`;
    prompt += `    "steps": ["步骤1：详细说明", "步骤2：详细说明", "步骤3：详细说明"]\n`;
    prompt += `  }\n`;
    prompt += `]\n\n`;
    prompt += `用户筛选条件：\n`;
    prompt += `菜系：${cuisine === '不限' ? '无限制，默认中餐' : cuisine}\n`;
    prompt += `口味：${taste === '不限' ? '无限制，默认清淡/咸香' : taste}\n`;
    prompt += `烹饪时间：${cookTime === '不限' ? '无限制，默认30分钟以内' : cookTime}\n`;
    prompt += `难度：${difficulty === '不限' ? '无限制，默认新手友好/家常菜' : difficulty}\n`;

    const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${AUTH_TYPE} ${API_KEY}`
    },
    body: JSON.stringify({
        model: MODEL,
        messages: [
            { role: 'system', content: '你是专业的美食大厨，擅长用有限食材做创意家常菜，严格按用户要求生成食谱，返回格式仅为JSON，无其他文字。' },
            { role: 'user', content: prompt }
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
        stream: false
        })
    });

    if (!response.ok) {
        throw new Error(`API请求失败，状态码：${response.status}，请检查API密钥是否有效！`);
    }

    const data = await response.json();
    let recipeText = data.choices[0].message.content.trim();

    let recipes = null;

    const codeBlockMatch = recipeText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
        try {
            recipes = JSON.parse(codeBlockMatch[1].trim());
        } catch (e) {
            console.warn('策略1失败（markdown代码块）:', e.message);
        }
    }

    if (!recipes) {
        const arrayMatch = recipeText.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            try {
                recipes = JSON.parse(arrayMatch[0]);
            } catch (e) {
                console.warn('策略2失败（数组匹配）:', e.message);
            }
        }
    }

    if (!recipes) {
        try {
            recipes = JSON.parse(recipeText);
        } catch (e) {
            console.warn('策略3失败（直接解析）:', e.message);
        }
    }

    if (!recipes) {
        try {
            let fixedText = recipeText;
            const openBrackets = (fixedText.match(/\[/g) || []).length;
            const closeBrackets = (fixedText.match(/\]/g) || []).length;
            const openBraces = (fixedText.match(/\{/g) || []).length;
            const closeBraces = (fixedText.match(/\}/g) || []).length;

            for (let i = 0; i < openBraces - closeBraces; i++) {
                fixedText += '}';
            }
            for (let i = 0; i < openBrackets - closeBrackets; i++) {
                fixedText += ']';
            }

            recipes = JSON.parse(fixedText);
        } catch (e) {
            console.warn('策略4失败（修复JSON）:', e.message);
        }
    }

    if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
        throw new Error(`AI返回格式错误，无法解析有效的菜谱数组。原始内容：${recipeText.substring(0, 500)}...`);
    }

    if (recipes.length < 1) {
        throw new Error('AI返回的菜谱数量不足！');
    }

    recipes = recipes.filter(recipe => {
        return recipe.name && recipe.ingredients && recipe.steps;
    });

    if (recipes.length === 0) {
        throw new Error('AI返回的菜谱缺少必要字段（name/ingredients/steps）！');
    }

    return recipes;
}

/**
 * 渲染菜谱列表
 * @param {Array} recipes - 菜谱数组
 * @param {boolean} isNewlyGenerated - 是否为新生成
 */
function renderRecipeList(recipes, isNewlyGenerated = true) {
    if (!recipes || recipes.length === 0) {
        emptyTip.style.display = 'block';
        recipeList.classList.remove('active');
        return;
    }
    currentDisplayedRecipes = recipes;
    recipeList.classList.add('active');
    emptyTip.style.display = 'none';
    recipeList.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);';
    toolbar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="selectAllRecipes" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-size: 14px; color: #666;">全选</span>
            </label>
            <span id="selectedCount" style="font-size: 14px; color: #999;">已选 0 个菜谱</span>
        </div>
        <button id="generateShoppingListBtn" class="action-btn" style="background: #ff9500; color: white; padding: 8px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.3s;" disabled>
            <i class="fas fa-shopping-cart" style="margin-right: 5px;"></i>生成购物清单
        </button>
    `;
    recipeList.appendChild(toolbar);

    const listContainer = document.createElement('div');
    listContainer.className = 'recipe-simple-list';
    listContainer.style.cssText = 'display: flex; flex-direction: column; gap: 15px;';

    recipes.forEach((recipe, index) => {
        const recipeId = recipe.id || `${Date.now()}_${index}`;
        const isCollected = collectRecipes.some(r => r.id === recipeId);
        const isTried = !!tryRecipes[recipeId];
        const tryInfo = isTried ? tryRecipes[recipeId] : { score: 0, comment: '' };

        let levelTag = 'tag-easy';
        if (recipe.difficulty === '家常菜') levelTag = 'tag-medium';
        if (recipe.difficulty === '大厨级') levelTag = 'tag-hard';

        const listItem = document.createElement('div');
        listItem.className = 'recipe-simple-item';
        listItem.style.cssText = 'padding: 20px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s;';
        listItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
                    <input type="checkbox" class="recipe-checkbox" data-recipe-id="${recipeId}" style="width: 18px; height: 18px; cursor: pointer;" onclick="event.stopPropagation()">
                    <div style="flex: 1;">
                        <div style="font-size: 18px; font-weight: 700; color: #333; margin-bottom: 8px;">
                            ${recipe.name || `创意菜谱${index + 1}`}
                            ${isTried ? `<span style="color:#ff9500;margin-left:8px;font-size:14px">${'★'.repeat(tryInfo.score)}${'☆'.repeat(5 - tryInfo.score)}</span>` : ''}
                        </div>
                        <div style="display: flex; gap: 15px; font-size: 14px; color: #666;">
                            <span><i class="fas fa-utensils" style="margin-right:5px"></i>${recipe.cuisine || '中餐'}</span>
                            <span><i class="fas fa-clock" style="margin-right:5px"></i>${recipe.time || '20分钟'}</span>
                            <span class="meta-tag ${levelTag}">${recipe.difficulty || '新手友好'}</span>
                        </div>
                    </div>
                </div>
                <div style="display: flex; gap: 10px;">
                    <button class="action-btn collect-btn ${isCollected ? 'active' : ''}" data-id="${recipeId}" data-recipe='${JSON.stringify(recipe).replace(/'/g, "&#39;")}' onclick="event.stopPropagation()">
                        <i class="fas ${isCollected ? 'fa-heart' : 'fa-heart-o'}"></i> ${isCollected ? '已收藏' : '收藏'}
                    </button>
                    <button class="action-btn try-btn" data-id="${recipeId}" onclick="event.stopPropagation()">
                        <i class="fas ${isTried ? 'fa-check-circle' : 'fa-play-circle'}"></i> ${isTried ? '已尝试' : '标记尝试'}
                    </button>
                    <button class="action-btn export-btn" data-recipe='${JSON.stringify(recipe).replace(/'/g, "&#39;")}' onclick="event.stopPropagation()">
                        <i class="fas fa-download"></i> 导出
                    </button>
                </div>
            </div>
        `;

        listItem.addEventListener('click', (e) => {
            if (!e.target.classList.contains('recipe-checkbox')) {
                showRecipeDetail(recipe);
            }
        });

        listItem.addEventListener('mouseenter', () => {
            listItem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            listItem.style.transform = 'translateY(-2px)';
        });
        listItem.addEventListener('mouseleave', () => {
            listItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
            listItem.style.transform = 'translateY(0)';
        });

        const checkbox = listItem.querySelector('.recipe-checkbox');
        checkbox.addEventListener('change', updateSelectedCount);

        const collectBtn = listItem.querySelector('.collect-btn');
        collectBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const btn = e.target.closest('.collect-btn');
            const id = btn.dataset.id;
            const recipeData = JSON.parse(btn.dataset.recipe.replace(/&#39;/g, "'"));
            recipeData.id = id;
            if (btn.classList.contains('active')) {
                collectRecipes = collectRecipes.filter(r => r.id !== id);
                btn.classList.remove('active');
                btn.innerHTML = '<i class="fas fa-heart-o"></i> 收藏';
            } else {
                collectRecipes.push(recipeData);
                btn.classList.add('active');
                btn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
            }
            localStorage.setItem('collectRecipes', JSON.stringify(collectRecipes));
            renderCollect();
            updateCollectCount();
        });

        const tryBtn = listItem.querySelector('.try-btn');
        tryBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentRecipeId = e.target.closest('.try-btn').dataset.id;
            openEvaluateModal(tryInfo);
        });

        const exportBtn = listItem.querySelector('.export-btn');
        exportBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const recipeData = JSON.parse(e.target.closest('.export-btn').dataset.recipe.replace(/&#39;/g, "'"));
            exportRecipe(recipeData);
        });

        listContainer.appendChild(listItem);
    });

    recipeList.appendChild(listContainer);

    const selectAllCheckbox = document.getElementById('selectAllRecipes');
    selectAllCheckbox.addEventListener('change', (e) => {
        const checkboxes = document.querySelectorAll('.recipe-checkbox');
        checkboxes.forEach(cb => {
            cb.checked = e.target.checked;
        });
        updateSelectedCount();
    });

    const recipeCheckboxes = document.querySelectorAll('.recipe-checkbox');
    recipeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(document.querySelectorAll('.recipe-checkbox')).every(cb => cb.checked);
            selectAllCheckbox.checked = allChecked;
            updateSelectedCount();
        });
    });

    const generateShoppingListBtn = document.getElementById('generateShoppingListBtn');
    generateShoppingListBtn.addEventListener('click', async () => {
        await generateShoppingListFromSelected();
    });

    updateSelectedCount();
}

/**
 * 更新选中菜谱计数
 */
function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.recipe-checkbox:checked');
    const count = checkboxes.length;
    const selectedCountEl = document.getElementById('selectedCount');
    const generateBtn = document.getElementById('generateShoppingListBtn');

    if (selectedCountEl) {
        selectedCountEl.textContent = `已选 ${count} 个菜谱`;
    }

    if (generateBtn) {
        if (count > 0) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        } else {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.5';
            generateBtn.style.cursor = 'not-allowed';
        }
    }
}

/**
 * 从选中的菜谱生成购物清单
 */
async function generateShoppingListFromSelected() {
    const checkboxes = document.querySelectorAll('.recipe-checkbox:checked');
    if (checkboxes.length === 0) {
        alert('请先选择要生成购物清单的菜谱！');
        return;
    }

    const selectedRecipes = [];
    checkboxes.forEach(cb => {
        const recipeId = cb.dataset.recipeId;
        const recipe = currentDisplayedRecipes.find(r => (r.id || `${Date.now()}_${currentDisplayedRecipes.indexOf(r)}`) === recipeId);
        if (recipe) {
            selectedRecipes.push(recipe);
        }
    });

    await generateShoppingList(selectedRecipes, '', false);
}

// ========== 营养分析相关 ==========
/**
 * 估算菜谱热量
 * @param {Object} recipe - 菜谱对象
 * @returns {number} 估算的热量值
 */
function estimateCalories(recipe) {
    let totalCalories = 0;
    const ingredients = [];

    if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'object' && !Array.isArray(recipe.ingredients)) {
            if (recipe.ingredients.has) ingredients.push(...recipe.ingredients.has);
            if (recipe.ingredients.lack) ingredients.push(...recipe.ingredients.lack);
        } else if (Array.isArray(recipe.ingredients)) {
            ingredients.push(...recipe.ingredients);
        }
    }

    const calorieMap = {
        '肉': 200, '猪肉': 250, '牛肉': 200, '羊肉': 200, '鸡肉': 150, '鸭肉': 180,
        '鱼': 100, '虾': 80, '蟹': 90, '蛋': 150,
        '米': 350, '面': 300, '饭': 120, '粉': 300,
        '油': 900, '糖': 400,
        '豆腐': 80, '豆': 150,
        '菜': 30, '瓜': 20, '萝卜': 25, '土豆': 80, '番茄': 20, '黄瓜': 15,
        '茄子': 25, '椒': 30, '笋': 25, '藕': 70, '菇': 25
    };

    ingredients.forEach(ingredient => {
        const quantityMatch = ingredient.match(/(\d+)(g|克|斤|两)/);
        let weight = 100;

        if (quantityMatch) {
            const amount = parseInt(quantityMatch[1]);
            const unit = quantityMatch[2];
            if (unit === 'g' || unit === '克') {
                weight = amount;
            } else if (unit === '斤') {
                weight = amount * 500;
            } else if (unit === '两') {
                weight = amount * 50;
            }
        }

        for (const [keyword, caloriesPer100g] of Object.entries(calorieMap)) {
            if (ingredient.includes(keyword)) {
                totalCalories += (caloriesPer100g * weight / 100);
                break;
            }
        }
    });

    if (totalCalories === 0) {
        totalCalories = 300;
    }

    return Math.round(totalCalories);
}

/**
 * 获取营养成分标签
 * @param {Object} recipe - 菜谱对象
 * @returns {Array} 营养标签数组
 */
function getNutritionTags(recipe) {
    const tags = [];
    const ingredients = [];

    if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'object' && !Array.isArray(recipe.ingredients)) {
            if (recipe.ingredients.has) ingredients.push(...recipe.ingredients.has);
            if (recipe.ingredients.lack) ingredients.push(...recipe.ingredients.lack);
        } else if (Array.isArray(recipe.ingredients)) {
            ingredients.push(...recipe.ingredients);
        }
    }

    const ingredientText = ingredients.join('');

    if (/肉|鱼|虾|蟹|蛋|豆/.test(ingredientText)) {
        tags.push('富含蛋白质');
    }

    if (/米|面|饭|粉|土豆|红薯/.test(ingredientText)) {
        tags.push('富含碳水');
    }

    if (/油|肥|五花/.test(ingredientText)) {
        tags.push('含脂肪');
    }

    if (/菜|瓜|果|番茄|黄瓜|茄子|椒|笋|藕/.test(ingredientText)) {
        tags.push('富含维生素');
    }

    if (/菜|笋|菇|豆|芹/.test(ingredientText)) {
        tags.push('富含膳食纤维');
    }

    if (tags.length === 0) {
        tags.push('营养均衡');
    }

    return tags;
}

/**
 * 获取饮食建议
 * @param {Object} recipe - 菜谱对象
 * @returns {Array} 饮食建议数组
 */
function getDietaryRecommendations(recipe) {
    const recommendations = [];
    const ingredients = [];

    if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'object' && !Array.isArray(recipe.ingredients)) {
            if (recipe.ingredients.has) ingredients.push(...recipe.ingredients.has);
            if (recipe.ingredients.lack) ingredients.push(...recipe.ingredients.lack);
        } else if (Array.isArray(recipe.ingredients)) {
            ingredients.push(...recipe.ingredients);
        }
    }

    const ingredientText = ingredients.join('');
    const calories = estimateCalories(recipe);

    if (/鸡|鱼|虾|蛋/.test(ingredientText) && !/油炸|红烧/.test(recipe.name || '')) {
        recommendations.push('高蛋白');
    }

    if (!/油炸|红烧|五花|肥/.test(ingredientText) && !/油炸|红烧/.test(recipe.name || '')) {
        recommendations.push('低脂');
    }

    if (calories < 300) {
        recommendations.push('低卡路里');
    }

    if (/鸡胸|鱼|虾|蛋/.test(ingredientText) && !/油炸|红烧/.test(recipe.name || '')) {
        recommendations.push('适合健身');
    }

    if (calories < 250 && /菜|瓜/.test(ingredientText)) {
        recommendations.push('适合减肥');
    }

    if (/清蒸|水煮|清炒/.test(recipe.name || '') || /清/.test(ingredientText)) {
        recommendations.push('清淡饮食');
    }

    if (recommendations.length === 0) {
        recommendations.push('营养均衡');
    }

    return recommendations;
}

/**
 * 获取过敏原警告
 * @param {Object} recipe - 菜谱对象
 * @returns {Array} 过敏原警告数组
 */
function getAllergenWarnings(recipe) {
    const warnings = [];
    const ingredients = [];

    if (recipe.ingredients) {
        if (typeof recipe.ingredients === 'object' && !Array.isArray(recipe.ingredients)) {
            if (recipe.ingredients.has) ingredients.push(...recipe.ingredients.has);
            if (recipe.ingredients.lack) ingredients.push(...recipe.ingredients.lack);
        } else if (Array.isArray(recipe.ingredients)) {
            ingredients.push(...recipe.ingredients);
        }
    }

    const ingredientText = ingredients.join('');

    if (/花生|核桃|杏仁|腰果|榛子|松子/.test(ingredientText)) {
        warnings.push('含坚果');
    }

    if (/虾|蟹|贝|蚝|螺|鱿|鱼/.test(ingredientText)) {
        warnings.push('含海鲜');
    }

    if (/奶|乳|芝士|奶酪|黄油|奶油/.test(ingredientText)) {
        warnings.push('含乳制品');
    }

    if (/蛋/.test(ingredientText)) {
        warnings.push('含蛋类');
    }

    if (/豆腐|豆浆|豆|黄豆|黑豆/.test(ingredientText)) {
        warnings.push('含大豆');
    }

    if (/面|麦|饺/.test(ingredientText)) {
        warnings.push('含麸质');
    }

    return warnings;
}

/**
 * 在模态窗口中显示菜谱详情
 * @param {Object} recipe - 菜谱对象
 */
function showRecipeDetail(recipe) {
    const recipeId = recipe.id;
    const isCollected = collectRecipes.some(r => r.id === recipeId);
    const isTried = !!tryRecipes[recipeId];
    const tryInfo = isTried ? tryRecipes[recipeId] : { score: 0, comment: '' };

    let levelTag = 'tag-easy';
    if (recipe.difficulty === '家常菜') levelTag = 'tag-medium';
    if (recipe.difficulty === '大厨级') levelTag = 'tag-hard';

    recipeDetailContent.innerHTML = `
        <div class="recipe-card" style="box-shadow: none; border: none;">
            <div class="recipe-header">
                <div class="recipe-name">${recipe.name}</div>
                <div class="recipe-meta">
                    <div class="meta-item"><i class="fas fa-utensils section-icon"></i> ${recipe.cuisine || '中餐'}</div>
                    <div class="meta-item"><i class="fas fa-clock section-icon"></i> ${recipe.time || '20分钟'}</div>
                    <div class="meta-item">
                        <span>难度：</span>
                        <span class="meta-tag ${levelTag}">${recipe.difficulty || '新手友好'}</span>
                    </div>
                    ${isTried ? `
                    <div class="meta-item">
                        <span>评分：</span>
                        <span style="color:#ff9500">${'★'.repeat(tryInfo.score)}${'☆'.repeat(5 - tryInfo.score)}</span>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="recipe-section">
                <div class="recipe-section-title"><i class="fas fa-shopping-basket section-icon"></i> 所需食材</div>
                <div class="ingredient-group">
                    ${(() => {
                        let html = '';
                        if (recipe.ingredients && typeof recipe.ingredients === 'object' && !Array.isArray(recipe.ingredients)) {
                            if (recipe.ingredients.has && recipe.ingredients.has.length > 0) {
                                html += recipe.ingredients.has.map(item =>
                                    `<label class="ingredient-checkbox">
                                        <input type="checkbox" class="ingredient-check">
                                        <span class="ingredient-text">${item}</span>
                                    </label>`
                                ).join('');
                            }
                            if (recipe.ingredients.lack && recipe.ingredients.lack.length > 0) {
                                html += recipe.ingredients.lack.map(item =>
                                    `<label class="ingredient-checkbox">
                                        <input type="checkbox" class="ingredient-check">
                                        <span class="ingredient-text">${item}</span>
                                    </label>`
                                ).join('');
                            }
                        }
                        else if (Array.isArray(recipe.ingredients)) {
                            html = recipe.ingredients.map(item =>
                                `<label class="ingredient-checkbox">
                                    <input type="checkbox" class="ingredient-check">
                                    <span class="ingredient-text">${item}</span>
                                </label>`
                            ).join('');
                        }
                        if (!html) {
                            html = '<div class="ingredient-desc has">暂无食材信息</div>';
                        }
                        return html;
                    })()}
                </div>
            </div>
            <div class="recipe-section">
                <div class="recipe-section-title"><i class="fas fa-list-ol section-icon"></i> 烹饪步骤</div>
                <div class="recipe-steps">
                    ${recipe.steps?.map((step, i) => `
                        <div class="step-item">
                            <div class="step-number">${i + 1}</div>
                            <div class="step-content">${step}</div>
                        </div>
                    `).join('') || '<div class="step-content">暂无步骤说明</div>'}
                </div>
            </div>
            <div class="recipe-section" style="background-color:#fafafa;padding:15px;border-radius:4px;border:1px solid #eee;">
                <div class="recipe-section-title" style="font-size:14px; display:flex; justify-content:space-between; align-items:center;">
                    <span><i class="fas fa-comment section-icon"></i> 我的评价</span>
                    <button id="editEvaluationInDetailBtn" style="font-size:12px; padding:4px 10px; border:1px solid #2196f3; background:#fff; color:#2196f3; border-radius:4px; cursor:pointer; transition:all 0.3s;">
                        <i class="fas fa-edit"></i> ${isTried ? '修改评价' : '添加评价'}
                    </button>
                </div>
                <div style="font-size:14px;color:#666;margin-left:20px;margin-top:10px;">
                    ${isTried ? `<div style="margin-bottom:5px;">评分：<span style="color:#ff9500;font-size:16px;">${'★'.repeat(tryInfo.score)}${'☆'.repeat(5 - tryInfo.score)}</span></div>
                        <div style="line-height:1.5;">心得：${tryInfo.comment || ' '}</div>`
                    : `<div style="color:#999">你还没有对这道菜进行评价，点击右上角按钮添加你的评分与备注。</div>`}
                </div>
            </div>
            <div class="recipe-section" style="background-color:#f0f8ff;padding:15px;border-radius:4px;margin-top:15px">
                <div class="recipe-section-title"><i class="fas fa-chart-pie section-icon"></i> 营养分析</div>
                <div style="display:flex;flex-direction:column;gap:12px">
                    <div style="display:flex;align-items:center;gap:10px">
                        <span style="font-size:14px;color:#666;min-width:80px">热量估算：</span>
                        <span style="font-size:14px;color:#333;font-weight:600">约 ${estimateCalories(recipe)} 卡路里</span>
                    </div>
                    <div style="display:flex;align-items:flex-start;gap:10px">
                        <span style="font-size:14px;color:#666;min-width:80px">营养成分：</span>
                        <div style="display:flex;flex-wrap:wrap;gap:8px">
                            ${getNutritionTags(recipe).map(tag =>
                                `<span style="padding:4px 10px;background:#fff;border:1px solid #ddd;border-radius:12px;font-size:12px;color:#666">${tag}</span>`
                            ).join('')}
                        </div>
                    </div>
                    <div style="display:flex;align-items:flex-start;gap:10px">
                        <span style="font-size:14px;color:#666;min-width:80px">饮食建议：</span>
                        <div style="display:flex;flex-wrap:wrap;gap:8px">
                            ${getDietaryRecommendations(recipe).map(rec =>
                                `<span style="padding:4px 10px;background:#e8f5e9;border:1px solid #4caf50;border-radius:12px;font-size:12px;color:#4caf50">${rec}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ${getAllergenWarnings(recipe).length > 0 ? `
                    <div style="display:flex;align-items:flex-start;gap:10px">
                        <span style="font-size:14px;color:#666;min-width:80px">过敏提示：</span>
                        <div style="display:flex;flex-wrap:wrap;gap:8px">
                            ${getAllergenWarnings(recipe).map(allergen =>
                                `<span style="padding:4px 10px;background:#ffebee;border:1px solid #f44336;border-radius:12px;font-size:12px;color:#f44336"><i class="fas fa-exclamation-triangle" style="margin-right:4px"></i>${allergen}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            ${recipe.ingredients && recipe.ingredients.lack && recipe.ingredients.lack.length > 0 ? `
            <div class="recipe-section" style="margin-top:15px">
                <button class="modal-footer-btn" id="smartSubstituteBtn" style="width:100%;background-color:#2196f3;color:white;border:none;padding:12px;font-size:14px;cursor:pointer;border-radius:4px">
                    <i class="fas fa-magic" style="margin-right:8px"></i>智能食材替代
                </button>
                <div id="substituteResult" style="margin-top:15px;display:none"></div>
            </div>
            ` : ''}
        </div>
    `;

    recipeDetailModal.classList.add('active');

    const smartSubstituteBtn = document.getElementById('smartSubstituteBtn');
    if (smartSubstituteBtn) {
        smartSubstituteBtn.addEventListener('click', () => {
            handleSmartSubstitute(recipe);
        });
    }
    const editEvaluationBtn = document.getElementById('editEvaluationInDetailBtn');
    if (editEvaluationBtn) {
        editEvaluationBtn.addEventListener('click', () => {
            currentRecipeId = recipe.id;
            openEvaluateModal(tryInfo);
        });
    }
}

// ========== 智能食材替代功能 ==========
/**
 * 处理智能食材替代
 * @param {Object} recipe - 菜谱对象
 */
async function handleSmartSubstitute(recipe) {
    const substituteBtn = document.getElementById('smartSubstituteBtn');
    const substituteResult = document.getElementById('substituteResult');

    if (!recipe.ingredients || !recipe.ingredients.lack || recipe.ingredients.lack.length === 0) {
        alert('当前菜谱没有缺少的食材，无需替代！');
        return;
    }

    substituteBtn.disabled = true;
    substituteBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:8px"></i>AI正在分析替代方案...';
    substituteResult.style.display = 'none';

    try {
        const lackIngredients = recipe.ingredients.lack.join('、');
        const hasIngredients = selectedIngredients.map(i => i.name).join('、');

        const prompt = `我正在做"${recipe.name}"这道菜，但是缺少以下食材：${lackIngredients}

我目前拥有的食材有：${hasIngredients}

请为每种缺少的食材推荐合适的替代品，要求：
1. 替代品要考虑风味相似性和常见可获得性
2. 如果我已有的食材中有合适的替代品，优先推荐
3. 说明替代后需要调整的烹饪步骤
4. 说明替代后对口味的影响

请按以下JSON格式返回（只返回JSON，不要其他文字）：
{
  "substitutes": [
    {
      "original": "原食材名称",
      "recommended": "推荐替代品",
      "reason": "推荐理由（风味相似性、可获得性等）",
      "adjustment": "烹饪步骤调整说明",
      "tasteImpact": "对口味的影响说明"
    }
  ]
}`;

        const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${AUTH_TYPE} ${API_KEY}`
    },
    body: JSON.stringify({
        model: MODEL,
        messages: [
            {
                role: 'system',
                content: '你是一位专业的烹饪顾问，擅长食材替代和菜谱调整。请根据用户的需求，提供专业的食材替代建议。'
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        temperature: TEMPERATURE
    })
});

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        let substituteData;
        try {
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                substituteData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('无法解析AI响应');
            }
        } catch (e) {
            console.error('JSON解析失败:', e);
            throw new Error('AI返回格式错误');
        }

        displaySubstituteResults(substituteData);

    } catch (error) {
        console.error('智能替代失败:', error);
        substituteResult.style.display = 'block';
        substituteResult.innerHTML = `
            <div style="padding:15px;background-color:#ffebee;border-radius:4px;color:#c62828">
                <i class="fas fa-exclamation-circle" style="margin-right:8px"></i>
                获取替代建议失败，请稍后重试
            </div>
        `;
    } finally {
        substituteBtn.disabled = false;
        substituteBtn.innerHTML = '<i class="fas fa-magic" style="margin-right:8px"></i>智能食材替代';
    }
}

/**
 * 显示替代建议结果
 * @param {Object} data - 替代数据
 */
function displaySubstituteResults(data) {
    const substituteResult = document.getElementById('substituteResult');

    if (!data.substitutes || data.substitutes.length === 0) {
        substituteResult.style.display = 'block';
        substituteResult.innerHTML = `
            <div style="padding:15px;background-color:#fff3e0;border-radius:4px;color:#f57c00">
                <i class="fas fa-info-circle" style="margin-right:8px"></i>
                暂无合适的替代建议
            </div>
        `;
        return;
    }

    let html = '<div style="background-color:#f5f5f5;border-radius:8px;padding:15px">';
    html += '<div style="font-size:16px;font-weight:600;color:#333;margin-bottom:15px"><i class="fas fa-lightbulb" style="color:#ff9800;margin-right:8px"></i>智能替代方案</div>';

    data.substitutes.forEach((sub, index) => {
        html += `
            <div style="background-color:white;border-radius:6px;padding:15px;margin-bottom:${index < data.substitutes.length - 1 ? '12px' : '0'}">
                <div style="display:flex;align-items:center;margin-bottom:10px">
                    <span style="padding:4px 12px;background-color:#ffebee;color:#c62828;border-radius:12px;font-size:13px;font-weight:500">${sub.original}</span>
                    <i class="fas fa-arrow-right" style="margin:0 10px;color:#999"></i>
                    <span style="padding:4px 12px;background-color:#e8f5e9;color:#2e7d32;border-radius:12px;font-size:13px;font-weight:500">${sub.recommended}</span>
                </div>
                <div style="margin-bottom:8px">
                    <div style="font-size:13px;color:#666;margin-bottom:4px"><i class="fas fa-check-circle" style="color:#4caf50;margin-right:6px"></i><strong>推荐理由：</strong></div>
                    <div style="font-size:13px;color:#555;margin-left:20px">${sub.reason}</div>
                </div>
                <div style="margin-bottom:8px">
                    <div style="font-size:13px;color:#666;margin-bottom:4px"><i class="fas fa-tools" style="color:#2196f3;margin-right:6px"></i><strong>步骤调整：</strong></div>
                    <div style="font-size:13px;color:#555;margin-left:20px">${sub.adjustment}</div>
                </div>
                <div>
                    <div style="font-size:13px;color:#666;margin-bottom:4px"><i class="fas fa-info-circle" style="color:#ff9800;margin-right:6px"></i><strong>口味影响：</strong></div>
                    <div style="font-size:13px;color:#555;margin-left:20px">${sub.tasteImpact}</div>
                </div>
            </div>
        `;
    });

    html += '</div>';

    substituteResult.style.display = 'block';
    substituteResult.innerHTML = html;
}

// ========== AI 购物清单标准化 ==========
/**
 * 使用AI标准化购物清单
 * @param {Array} rawIngredients - 原始食材列表
 * @returns {Promise<Array>} 标准化后的购物清单
 */
async function standardizeShoppingListWithAI(rawIngredients) {
    const ingredientsText = rawIngredients.join('\n');
    
    const prompt = `
你是一个专业的采购助手。我有一份原始的食材清单，请帮我整理成标准化的购物清单 JSON。

【原始清单】：
${ingredientsText}

【核心处理规则 - 必须严格执行】：
1. **提取名称**：移除所有烹饪动作（如切丝、去皮、磨碎）和无关描述，只保留食材本体名称（如"切丝洋葱" -> "洋葱"）。
2. **过滤无效物品**：
   - **绝对不要包含**：水、清水、热水、冰块等家中常备资源。
   - 如果发现清单里有"水"，请直接忽略，不要输出到 JSON 中。
3. **严格标准化数量与单位**：
   - **规则 A (计数单位 - 必须取整)**：
     - 使用单位：个, 只, 瓣, 头, 根。
     - **强制向上取整**：去超市买东西不能买半个。如果原数量是小数（如 0.5个、0.75个、半个），必须**向上取整为整数**（如 1个）。
     - 示例：0.5洋葱 -> 1个；0.75白萝卜 -> 1个；1.5根黄瓜 -> 2根。
   - **规则 B (质量单位)**：
     - 使用单位：g (克), kg (千克)。
     - 将 斤、两、lb、oz 等统一换算为 g 或 kg。
   - **规则 C (体积/容器换算)**：
     - 将 勺、汤匙、ml、碗 等根据常识密度换算为 g (克)。(如 1汤匙油 ≈ 15g)。
   - **规则 D (模糊词)**：
     - 遇到 "少许"、"适量"、"若干" -> quantity 字段留空字符串 ""。

4. **分类**：将食材分为 [蔬菜区, 肉类区, 海鲜区, 调料区, 其他]。

【输出格式】：
只输出一个 JSON 数组，不要包含 \`\`\`json 标记或任何其他文字。格式如下：
[
  {"name": "洋葱", "quantity": "1个", "category": "蔬菜区"}, 
  {"name": "白萝卜", "quantity": "1个", "category": "蔬菜区"},
  {"name": "食用油", "quantity": "15g", "category": "调料区"}
]
`;

    try {
        const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `${AUTH_TYPE} ${API_KEY}`
    },
    body: JSON.stringify({
        model: MODEL,
        messages: [
            { role: 'system', content: '你是一个严格的数据处理助手，只输出 JSON。' },
            { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 2000
    })
    });

        if (!response.ok) throw new Error('AI API Error');

        const data = await response.json();
        let content = data.choices[0].message.content.trim();
        
        content = content.replace(/^```json/, '').replace(/```$/, '').trim();
        
        return JSON.parse(content);
    } catch (error) {
        console.error("AI 标准化失败，回退到本地解析:", error);
        return null;
    }
}

/**
 * 生成购物清单（AI 增强版）
 * @param {Array} recipes - 菜谱数组
 * @param {string} userIngredients - 用户已有食材
 * @param {boolean} isNewlyGenerated - 是否为新生成
 */
async function generateShoppingList(recipes, userIngredients, isNewlyGenerated = true) {
    const lackIngredients = [];
    const hasIngredients = [];

    recipes.forEach(recipe => {
        if (recipe.ingredients && recipe.ingredients.lack && recipe.ingredients.lack.length > 0) {
            recipe.ingredients.lack.forEach(item => {
                if (!lackIngredients.includes(item)) lackIngredients.push(item);
            });
        }
        if (recipe.ingredients && recipe.ingredients.has && recipe.ingredients.has.length > 0) {
            recipe.ingredients.has.forEach(item => {
                if (!hasIngredients.includes(item)) hasIngredients.push(item);
            });
        }
    });

    let ingredientsToShow = isNewlyGenerated ? lackIngredients : [...lackIngredients, ...hasIngredients];

    ingredientsToShow = ingredientsToShow.filter(item => {
        const waterKeywords = ['清水', '热水', '凉水', '温水', '开水', '饮用水', '水'];
        return !waterKeywords.includes(item.trim());
    });

    if (ingredientsToShow.length === 0) {
        if (shoppingModal) shoppingModal.classList.remove('active');
        localStorage.removeItem('shoppingList');
        alert('没有需要购买的食材！'); 
        return;
    }

    if (historyModal && historyModal.classList.contains('active')) {
        historyModal.classList.remove('active');
    }
    if (collectModal && collectModal.classList.contains('active')) {
        collectModal.classList.remove('active');
    }

    if (shoppingModal) shoppingModal.classList.add('active');
    
    if (shoppingContent) {
        shoppingContent.innerHTML = `
            <div style="text-align:center; padding: 20px; color: #666;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: #ff9500; margin-bottom: 10px;"></i>
                <div style="font-size: 14px;">🛒正在火速为您打包完美购物清单🚀</div>
            </div>
        `;
    }

    const aiResult = await standardizeShoppingListWithAI(ingredientsToShow);

    if (shoppingContent) shoppingContent.innerHTML = '';

    if (aiResult) {
        const groups = {};
        aiResult.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });

        for (const [category, items] of Object.entries(groups)) {
            items.forEach(item => {
                const shoppingItem = document.createElement('div');
                shoppingItem.className = 'shopping-item';
                shoppingItem.innerHTML = `
                    <input type="checkbox" class="shopping-check" style="width:18px;height:18px;">
                    <span class="shopping-name" style="font-weight:bold;margin-left:10px;">${item.name}</span>
                    <div style="flex:1"></div>
                    <input type="text" class="quantity-input" placeholder="-" value="${item.quantity || ''}" style="width:60px;margin-right:5px;text-align:center;">
                    <input type="text" class="note-input" placeholder="备注" style="width:80px;margin-right:5px;">
                    <span class="shopping-area" style="font-size:12px;color:#888;background:#f0f0f0;padding:2px 6px;border-radius:4px;">${category}</span>
                `;
                shoppingContent.appendChild(shoppingItem);
            });
        }
        localStorage.setItem('shoppingList', JSON.stringify(ingredientsToShow));

    } else {
        console.warn("AI 响应超时或错误，使用本地正则解析");
        await renderLocalShoppingList(ingredientsToShow);
    }
}

/**
 * 本地渲染购物清单（兜底函数）
 * @param {Array} ingredientsList - 食材列表
 */
async function renderLocalShoppingList(ingredientsList) {
    const categories = {
        '蔬菜区': [], '肉类区': [], '海鲜区': [], '调料区': [], '其他': []
    };

    const vegKeywords = ['菜', '瓜', '豆', '菇', '笋', '藕', '萝卜', '土豆', '番茄', '黄瓜', '茄子', '椒'];
    const meatKeywords = ['肉', '鸡', '鸭', '猪', '牛', '羊', '蛋'];
    const seafoodKeywords = ['鱼', '虾', '蟹', '贝', '蚝', '螺', '鱿'];
    const seasoningKeywords = ['油', '盐', '酱', '醋', '糖', '料酒', '味精', '鸡精', '胡椒', '花椒', '八角', '桂皮', '生抽', '老抽', '蚝油', '淀粉', '葱', '姜', '蒜', '香油', '芝麻油', '辣椒', '孜然'];

    ingredientsList.forEach(item => {
        let categorized = false;
        if (vegKeywords.some(kw => item.includes(kw))) { categories['蔬菜区'].push(item); categorized = true; }
        else if (meatKeywords.some(kw => item.includes(kw))) { categories['肉类区'].push(item); categorized = true; }
        else if (seafoodKeywords.some(kw => item.includes(kw))) { categories['海鲜区'].push(item); categorized = true; }
        else if (seasoningKeywords.some(kw => item.includes(kw))) { categories['调料区'].push(item); categorized = true; }
        if (!categorized) { categories['其他'].push(item); }
    });

    if (shoppingContent) {
        shoppingContent.innerHTML = '';
    }

    function separateNameAndQuantity(str) {
        const match = str.match(/^(.+?)(\d+[^\d\s]+)$/);
        if (match) {
            return { name: match[1].trim(), quantity: match[2].trim() };
        }
        return { name: str, quantity: '' };
    }

    Object.keys(categories).forEach(category => {
        if (categories[category].length > 0) {
            categories[category].forEach(item => {
                const shoppingItem = document.createElement('div');
                shoppingItem.className = 'shopping-item';
                const { name, quantity } = separateNameAndQuantity(item);
                shoppingItem.innerHTML = `
                    <input type="checkbox" class="shopping-check" style="width:18px;height:18px;cursor:pointer;">
                    <span class="shopping-name" style="font-weight:bold;margin-left:10px;">${name}</span>
                    <div style="flex:1"></div>
                    <input type="text" class="quantity-input" placeholder="量" value="${quantity || ''}" style="width:60px;margin-right:5px;">
                    <span class="shopping-area" style="font-size:12px;color:#888;background:#f0f0f0;padding:2px 6px;border-radius:4px;">${category}</span>
                `;
                shoppingContent.appendChild(shoppingItem);
            });
        }
    });

    localStorage.setItem('shoppingList', JSON.stringify(ingredientsList));
}

// ========== 收藏/历史相关 ==========
/**
 * 渲染生成历史列表
 */
function renderHistory() {
    updateHistoryCount();
    if (historyRecipes.length === 0) {
        historyContent.innerHTML = '<div class="empty-tip">暂无生成历史，快来生成你的第一份食谱吧！</div>';
        return;
    }
    historyContent.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;';
    toolbar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="selectAllHistory" style="width: 16px; height: 16px; cursor: pointer;">
                <span style="font-size: 13px; color: #666;">全选</span>
            </label>
            <span id="selectedHistoryCount" style="font-size: 13px; color: #999;">已选 0 个</span>
        </div>
        <button id="generateHistoryShoppingBtn" class="action-btn" style="background: #ff9500; color: white; padding: 6px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;" disabled>
            <i class="fas fa-shopping-cart" style="margin-right: 5px;"></i>生成购物清单
        </button>
    `;
    historyContent.appendChild(toolbar);

    const historyList = document.createElement('div');
    historyList.className = 'history-list';
    
    const reverseHistory = [...historyRecipes].reverse();
    
    reverseHistory.forEach(item => {
        if (!item.recipe || !item.recipe.name) {
            return;
        }

        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const isTried = !!tryRecipes[item.id];
        const tryInfo = isTried ? tryRecipes[item.id] : null;
        const isCollected = collectRecipes.some(r => r.id === item.recipe.id);

        historyItem.innerHTML = `
            <input type="checkbox" class="history-checkbox" data-recipe='${JSON.stringify(item.recipe).replace(/'/g, "&#39;")}' style="width: 16px; height: 16px; cursor: pointer; margin-right: 10px;">
            <div class="item-info">
                <div class="item-name">
                    ${item.recipe.name}
                    ${isTried ? `<span style="color:#ff9500;margin-left:8px;font-size:14px">${'★'.repeat(tryInfo.score)}${'☆'.repeat(5 - tryInfo.score)}</span>` : ''}
                </div>
                <div class="item-time">生成时间：${item.createTime}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn collect-history-btn" data-recipe='${JSON.stringify(item.recipe).replace(/'/g, "&#39;")}' style="${isCollected ? 'color:#ff9500; font-weight:bold;' : ''}">
                    <i class="fas ${isCollected ? 'fa-heart' : 'fa-heart-o'}"></i> ${isCollected ? '已收藏' : '收藏'}
                </button>
                <button class="item-btn view-detail-btn" data-recipe='${JSON.stringify(item.recipe).replace(/'/g, "&#39;")}' style="margin-left:5px">查看详情</button>
                <button class="item-btn delete-history" data-id="${item.id}" style="margin-left:5px">删除</button>
            </div>
        `;
        historyList.appendChild(historyItem);

        const checkbox = historyItem.querySelector('.history-checkbox');
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(document.querySelectorAll('.history-checkbox')).every(cb => cb.checked);
            const selectAllCheckbox = document.getElementById('selectAllHistory');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = allChecked;
            }
            updateHistorySelectedCount();
        });

        const collectBtn = historyItem.querySelector('.collect-history-btn');
        collectBtn.addEventListener('click', (e) => {
            const recipeData = JSON.parse(e.currentTarget.dataset.recipe.replace(/&#39;/g, "'"));
            const recipeId = recipeData.id;

            const index = collectRecipes.findIndex(r => r.id === recipeId);
            
            if (index !== -1) {
                collectRecipes.splice(index, 1);
                collectBtn.innerHTML = '<i class="fas fa-heart-o"></i> 收藏';
                collectBtn.style.color = '';
                collectBtn.style.fontWeight = 'normal';
            } else {
                collectRecipes.push(recipeData);
                collectBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                collectBtn.style.color = '#ff9500';
                collectBtn.style.fontWeight = 'bold';
            }
            
            localStorage.setItem('collectRecipes', JSON.stringify(collectRecipes));
            updateCollectCount();
            
            const mainListBtn = document.querySelector(`.collect-btn[data-id="${recipeId}"]`);
            if (mainListBtn) {
                if (index !== -1) {
                    mainListBtn.classList.remove('active');
                    mainListBtn.innerHTML = '<i class="fas fa-heart-o"></i> 收藏';
                } else {
                    mainListBtn.classList.add('active');
                    mainListBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                }
            }
        });

        historyItem.querySelector('.view-detail-btn').addEventListener('click', (e) => {
            const recipeData = JSON.parse(e.target.dataset.recipe.replace(/&#39;/g, "'"));
            showRecipeDetail(recipeData);
        });

        historyItem.querySelector('.delete-history').addEventListener('click', () => {
            if (confirm('确定要删除这条生成历史吗？')) {
                historyRecipes = historyRecipes.filter(h => h.id !== item.id);
                localStorage.setItem('historyRecipes', JSON.stringify(historyRecipes));
                renderHistory();
                updateHistoryCount();
            }
        });
    });
    historyContent.appendChild(historyList);

    const selectAllCheckbox = document.getElementById('selectAllHistory');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.history-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateHistorySelectedCount();
        });
    }

    const generateBtn = document.getElementById('generateHistoryShoppingBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.history-checkbox:checked');
            if (checkboxes.length === 0) {
                alert('请先选择要生成购物清单的菜谱！');
                return;
            }

            const selectedRecipes = [];
            checkboxes.forEach(cb => {
                const recipeData = JSON.parse(cb.dataset.recipe.replace(/&#39;/g, "'"));
                selectedRecipes.push(recipeData);
            });

            await generateShoppingList(selectedRecipes, '', false);
            historyModal.classList.remove('active');
        });
    }

    updateHistorySelectedCount();
}

/**
 * 更新历史记录选中计数
 */
function updateHistorySelectedCount() {
    const checkboxes = document.querySelectorAll('.history-checkbox:checked');
    const count = checkboxes.length;
    const selectedCountEl = document.getElementById('selectedHistoryCount');
    const generateBtn = document.getElementById('generateHistoryShoppingBtn');

    if (selectedCountEl) {
        selectedCountEl.textContent = `已选 ${count} 个`;
    }

    if (generateBtn) {
        if (count > 0) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        } else {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.5';
            generateBtn.style.cursor = 'not-allowed';
        }
    }
}

/**
 * 渲染收藏列表
 */
function renderCollect() {
    updateCollectCount();
    if (collectRecipes.length === 0) {
        collectContent.innerHTML = '<div class="empty-tip">暂无收藏的菜谱，遇到喜欢的记得收藏哦！</div>';
        return;
    }
    collectContent.innerHTML = '';

    const toolbar = document.createElement('div');
    toolbar.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding: 10px; background: #f5f5f5; border-radius: 4px;';
    toolbar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" id="selectAllCollect" style="width: 16px; height: 16px; cursor: pointer;">
                <span style="font-size: 13px; color: #666;">全选</span>
            </label>
            <span id="selectedCollectCount" style="font-size: 13px; color: #999;">已选 0 个</span>
        </div>
        <button id="generateCollectShoppingBtn" class="action-btn" style="background: #ff9500; color: white; padding: 6px 15px; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;" disabled>
            <i class="fas fa-shopping-cart" style="margin-right: 5px;"></i>生成购物清单
        </button>
    `;
    collectContent.appendChild(toolbar);

    const collectList = document.createElement('div');
    collectList.className = 'collect-list';

    const reverseCollect = [...collectRecipes].reverse();

    reverseCollect.forEach(recipe => {
        const collectItem = document.createElement('div');
        collectItem.className = 'history-item';

        const isTried = !!tryRecipes[recipe.id];
        const tryInfo = isTried ? tryRecipes[recipe.id] : null;
        const isCollected = collectRecipes.some(r => r.id === recipe.id);

        collectItem.innerHTML = `
            <input type="checkbox" class="collect-checkbox" data-recipe='${JSON.stringify(recipe).replace(/'/g, "&#39;")}' style="width: 16px; height: 16px; cursor: pointer; margin-right: 10px;">
            <div class="item-info">
                <div class="item-name">
                    ${recipe.name}
                    ${isTried ? `<span style="color:#ff9500;margin-left:8px;font-size:14px">${'★'.repeat(tryInfo.score)}${'☆'.repeat(5 - tryInfo.score)}</span>` : ''}
                </div>
                <div class="item-time">${recipe.cuisine || '中餐'} | ${recipe.time || '20分钟'} | ${recipe.difficulty || '新手友好'}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn toggle-collect-btn" style="${isCollected ? 'color:#ff9500; font-weight:bold;' : ''}">
                    <i class="fas ${isCollected ? 'fa-heart' : 'fa-heart-o'}"></i> ${isCollected ? '已收藏' : '收藏'}
                </button>
                <button class="item-btn view-detail-btn" style="margin-left:5px">查看详情</button>
                <button class="item-btn delete-collect-btn" style="margin-left:5px">删除</button>
            </div>
        `;
        collectList.appendChild(collectItem);

        const checkbox = collectItem.querySelector('.collect-checkbox');
        checkbox.addEventListener('change', () => {
            const allChecked = Array.from(document.querySelectorAll('.collect-checkbox')).every(cb => cb.checked);
            const selectAllCheckbox = document.getElementById('selectAllCollect');
            if (selectAllCheckbox) {
                selectAllCheckbox.checked = allChecked;
            }
            updateCollectSelectedCount();
        });

        const collectBtn = collectItem.querySelector('.toggle-collect-btn');
        const deleteBtn = collectItem.querySelector('.delete-collect-btn');

        collectBtn.addEventListener('click', () => {
            const index = collectRecipes.findIndex(r => r.id === recipe.id);
            
            if (index !== -1) {
                collectRecipes.splice(index, 1);
                collectBtn.innerHTML = '<i class="fas fa-heart-o"></i> 收藏';
                collectBtn.style.color = '';
                collectBtn.style.fontWeight = 'normal';
                const mainBtn = document.querySelector(`.collect-btn[data-id="${recipe.id}"]`);
                if(mainBtn) {
                    mainBtn.classList.remove('active');
                    mainBtn.innerHTML = '<i class="fas fa-heart-o"></i> 收藏';
                }
            } else {
                collectRecipes.push(recipe);
                collectBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                collectBtn.style.color = '#ff9500';
                collectBtn.style.fontWeight = 'bold';
                const mainBtn = document.querySelector(`.collect-btn[data-id="${recipe.id}"]`);
                if(mainBtn) {
                    mainBtn.classList.add('active');
                    mainBtn.innerHTML = '<i class="fas fa-heart"></i> 已收藏';
                }
            }
            
            localStorage.setItem('collectRecipes', JSON.stringify(collectRecipes));
            updateCollectCount();
        });

        deleteBtn.addEventListener('click', () => {
            if (confirm(`确定要移除【${recipe.name}】吗？`)) {
                collectRecipes = collectRecipes.filter(r => r.id !== recipe.id);
                localStorage.setItem('collectRecipes', JSON.stringify(collectRecipes));
                renderCollect();
                updateCollectCount();
                
                const mainBtn = document.querySelector(`.collect-btn[data-id="${recipe.id}"]`);
                if(mainBtn) {
                    mainBtn.classList.remove('active');
                    mainBtn.innerHTML = '<i class="fas fa-heart-o"></i> 收藏';
                }
            }
        });

        collectItem.querySelector('.view-detail-btn').addEventListener('click', () => {
            showRecipeDetail(recipe);
        });
    });

    collectContent.appendChild(collectList);

    const selectAllCheckbox = document.getElementById('selectAllCollect');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.collect-checkbox');
            checkboxes.forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateCollectSelectedCount();
        });
    }

    const generateBtn = document.getElementById('generateCollectShoppingBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const checkboxes = document.querySelectorAll('.collect-checkbox:checked');
            if (checkboxes.length === 0) {
                alert('请先选择要生成购物清单的菜谱！');
                return;
            }

            const selectedRecipes = [];
            checkboxes.forEach(cb => {
                const recipeData = JSON.parse(cb.dataset.recipe.replace(/&#39;/g, "'"));
                selectedRecipes.push(recipeData);
            });

            await generateShoppingList(selectedRecipes, '', false);
            collectModal.classList.remove('active');
        });
    }

    updateCollectSelectedCount();
}

/**
 * 更新收藏选中计数
 */
function updateCollectSelectedCount() {
    const checkboxes = document.querySelectorAll('.collect-checkbox:checked');
    const count = checkboxes.length;
    const selectedCountEl = document.getElementById('selectedCollectCount');
    const generateBtn = document.getElementById('generateCollectShoppingBtn');

    if (selectedCountEl) {
        selectedCountEl.textContent = `已选 ${count} 个`;
    }

    if (generateBtn) {
        if (count > 0) {
            generateBtn.disabled = false;
            generateBtn.style.opacity = '1';
            generateBtn.style.cursor = 'pointer';
        } else {
            generateBtn.disabled = true;
            generateBtn.style.opacity = '0.5';
            generateBtn.style.cursor = 'not-allowed';
        }
    }
}

/**
 * 渲染常用组合列表
 */
function renderGroupList() {
    if (commonIngredientGroups.length === 0) {
        groupContent.innerHTML = '<div class="empty-tip">暂无保存的常用组合，快来保存你的第一个组合吧！</div>';
        return;
    }
    groupContent.innerHTML = '';
    const groupList = document.createElement('div');
    groupList.className = 'history-list';

    commonIngredientGroups.forEach((group, index) => {
        const groupItem = document.createElement('div');
        groupItem.className = 'history-item';

        const ingr = group.ingredients?.map(i => i.quantity ? `${i.name}${i.quantity}` : i.name).join('、') || '无';
        const seas = group.seasonings?.join('、') || '无';

        groupItem.innerHTML = `
            <input type="checkbox" class="group-checkbox" data-index="${index}">
            <div class="item-info">
                <div class="item-name">${group.name}</div>
                <div class="item-time">食材：${ingr}</div>
                <div class="item-time">调料：${seas}</div>
                <div class="item-time">创建时间：${group.createTime}</div>
            </div>
            <div class="item-actions">
                <button class="item-btn load-group" data-index="${index}">加载</button>
                <button class="item-btn edit-group" data-index="${index}">编辑</button>
                <button class="item-btn delete-group" data-index="${index}">删除</button>
            </div>
        `;
        groupList.appendChild(groupItem);

        groupItem.querySelector('.load-group').addEventListener('click', () => {
            editingGroupIndex = -1;
            selectedIngredients = [...(group.ingredients || [])];
            selectedSeasonings = [...(group.seasonings || [])];
            ingredientItems.forEach(item => item.classList.remove('selected'));
            seasoningItems.forEach(item => item.classList.remove('selected'));
            renderSelectedIngredients();
            renderSelectedSeasonings();
            updateIngredientCount();
            updateSeasoningCount();
            updateSaveButtonText();
            groupModal.classList.remove('active');
        });

        groupItem.querySelector('.edit-group').addEventListener('click', () => {
            isEditingGroupFlow = true;
            editingGroupForFlow = index;
            
            selectedIngredients = [...(group.ingredients || [])];
            selectedSeasonings = [...(group.seasonings || [])];
            
            ingredientItems.forEach(item => item.classList.remove('selected'));
            seasoningItems.forEach(item => item.classList.remove('selected'));
            
            renderSelectedIngredients();
            renderSelectedSeasonings();
            updateIngredientCount();
            updateSeasoningCount();
            
            updateModalButtons();
            
            groupModal.classList.remove('active');
            ingredientModal.classList.add('active');
        });

        groupItem.querySelector('.delete-group').addEventListener('click', () => {
            if (confirm(`确定要删除【${group.name}】吗？`)) {
                commonIngredientGroups.splice(index, 1);
                localStorage.setItem('commonIngredientGroups', JSON.stringify(commonIngredientGroups));
                renderGroupList();
                alert('常用食材组合已删除！');
            }
        });
    });

    groupContent.appendChild(groupList);
}

// ========== 评价弹窗相关 ==========
/**
 * 打开评价弹窗
 * @param {Object} tryInfo - 尝试信息
 */
function openEvaluateModal(tryInfo) {
    starScore = tryInfo.score || 0;
    commentInput.value = tryInfo.comment || '';
    const stars = starRating.querySelectorAll('.star');
    stars.forEach((s, i) => {
        if (i < starScore) {
            s.classList.add('active');
        } else {
            s.classList.remove('active');
        }
    });
    try {
        if (recipeDetailModal && recipeDetailModal.classList.contains('active')) {
            const rdZ = parseInt(window.getComputedStyle(recipeDetailModal).zIndex) || 1000;
            evaluateModal.style.zIndex = rdZ + 10;
        } else {
            evaluateModal.style.zIndex = 2001;
        }
    } catch (e) {
        evaluateModal.style.zIndex = 2001;
    }
    evaluateModal.classList.add('active');
}

/**
 * 关闭评价弹窗
 */
function closeEvaluateModal() {
    evaluateModal.classList.remove('active');
    starScore = 0;
    commentInput.value = '';
    const stars = starRating.querySelectorAll('.star');
    stars.forEach(s => s.classList.remove('active'));
    try { evaluateModal.style.zIndex = ''; } catch (e) {}
}

// ========== 导出功能 ==========
/**
 * 导出菜谱为文本文件
 * @param {Object} recipe - 菜谱对象
 */
function exportRecipe(recipe) {
    let text = `===== ${recipe.name} =====\n`;
    text += `菜系：${recipe.cuisine || '中餐'}\n`;
    text += `烹饪时间：${recipe.time || '20分钟'}\n`;
    text += `难度等级：${recipe.difficulty || '新手友好'}\n\n`;
    text += `【所需食材】\n`;

    if (recipe.ingredients && typeof recipe.ingredients === 'object' && !Array.isArray(recipe.ingredients)) {
        if (recipe.ingredients.has && recipe.ingredients.has.length > 0) {
            text += `已有食材：\n`;
            recipe.ingredients.has.forEach(item => {
                text += `  ✅ ${item}\n`;
            });
        }
        if (recipe.ingredients.lack && recipe.ingredients.lack.length > 0) {
            text += `缺少食材：\n`;
            recipe.ingredients.lack.forEach(item => {
                text += `  ❌ ${item}\n`;
            });
        }
    }
    else if (Array.isArray(recipe.ingredients)) {
        recipe.ingredients.forEach(item => {
            text += `✅ ${item}\n`;
        });
    }

    text += '\n';
    text += `【烹饪步骤】\n`;
    recipe.steps?.forEach((step, i) => {
        text += `${i + 1}. ${step}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name}_食谱.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * 导出购物清单为文本文件
 */
function exportShoppingList() {
    const items = shoppingContent.querySelectorAll('.shopping-item');

    if (items.length === 0) {
        return; 
    }

    let text = `===== 购物清单 =====\n`;
    text += `生成时间：${new Date().toLocaleString()}\n\n`;

    const groupedItems = {};
    items.forEach(item => {
        const name = item.querySelector('.shopping-name').textContent.trim();
        const area = item.querySelector('.shopping-area').textContent.trim();
        const quantity = item.querySelector('.quantity-input')?.value.trim() || '';
        const note = item.querySelector('.note-input')?.value.trim() || '';
        const checked = item.querySelector('.shopping-check').checked;

        if (!groupedItems[area]) {
            groupedItems[area] = [];
        }
        groupedItems[area].push({ name, quantity, note, checked });
    });

    Object.keys(groupedItems).forEach(area => {
        text += `【${area}】\n`;
        groupedItems[area].forEach(item => {
            const checkMark = item.checked ? '✅' : '☐';
            let line = `${checkMark} ${item.name}`;
            if (item.quantity) {
                line += ` (${item.quantity})`;
            }
            if (item.note) {
                line += ` - ${item.note}`;
            }
            text += `${line}\n`;
        });
        text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `购物清单_${new Date().toLocaleDateString()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// ========== 初始化执行 ==========
window.onload = init;