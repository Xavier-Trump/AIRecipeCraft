// ========== API 配置文件 ==========
// 请根据自己的配置修改以下值：
const API_CONFIG = {
    // API 密钥，请替换为你自己的密钥
    API_KEY: 'your_api_key_here',
    
    // API 端点，请替换为你自己的端点
    ENDPOINT: 'https:',
    
    // 模型名称，请替换为你自己的模型名称
    MODEL: 'model-name',
    
    // 认证类型,默认Bearer
    AUTH_TYPE: 'Bearer',
    
    // 温度参数
    TEMPERATURE: 0.7,
    
    // 最大 tokens
    MAX_TOKENS: 6000,
    
    // 是否已配置的标志
    IS_CONFIGURED: false
};

// 检查配置是否已设置
function checkConfig() {
    const hasConfig = API_CONFIG.API_KEY && API_CONFIG.API_KEY !== 'your_api_key_here';
    
    if (!hasConfig) {
        console.warn('⚠️ API 配置未设置！请修改 api.config.js 文件中的 API_KEY。');
        
        if (typeof document !== 'undefined') {
            const existingAlert = document.getElementById('config-alert');
            if (!existingAlert) {
                const alertDiv = document.createElement('div');
                alertDiv.id = 'config-alert';
                alertDiv.style.cssText = `
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 15px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 9999;
                    max-width: 90%;
                    text-align: center;
                    font-family: Arial, sans-serif;
                `;
                alertDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 16px; font-weight: bold;">📋 需要配置 API</span>
                        <button onclick="this.parentElement.parentElement.remove()" 
                                style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 2px 8px; border-radius: 4px;">
                            ✕
                        </button>
                    </div>
                    <div style="margin-top: 8px; font-size: 14px;">
                        请修改 <code>api.config.js</code> 文件中的 API_KEY
                        <br>
                        <a href="https://github.com/Xavier-Trump/AIRecipeCraft#readme" 
                           target="_blank"
                           style="color: #ffd166; text-decoration: underline; margin-top: 5px; display: inline-block;">
                            查看配置指南
                        </a>
                    </div>
                `;
                document.body.appendChild(alertDiv);
            }
        }
    }
    
    return hasConfig;
}

// 立即检查配置
API_CONFIG.IS_CONFIGURED = checkConfig();

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, checkConfig };
}