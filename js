// ============================
// 基础系统逻辑
// ============================
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('clock').innerText = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

// 电池逻辑
function updateBattery() {
    // 模拟 20% - 100%
    const level = Math.floor(Math.random() * (100 - 20) + 20);
    document.getElementById('batteryText').innerText = level;
    const fill = document.getElementById('batteryFill');
    fill.style.width = level + '%';
    if (level <= 20) {
        fill.classList.add('low');
    } else {
        fill.classList.remove('low');
    }
}
updateBattery(); // init

// App 切换逻辑
function openApp(appId) {
    document.getElementById(appId).classList.add('active');
    if (appId === 'app-weather') {
        initWeather();
    }
}

function goHome() {
    const apps = document.querySelectorAll('.app-view');
    apps.forEach(app => app.classList.remove('active'));
}

// ============================
// 设置逻辑
// ============================
function toggleStatusBar(el) {
    const bar = document.getElementById('statusBar');
    if (el.checked) {
        bar.style.display = 'flex';
    } else {
        bar.style.display = 'none';
    }
}

function toggleFullscreen(el) {
    const phone = document.getElementById('phone');
    if (el.checked) {
        phone.classList.add('fullscreen');
    } else {
        phone.classList.remove('fullscreen');
    }
}

function updateTemp(val) {
    document.getElementById('tempDisplay').innerText = val;
}

// 模拟/真实 拉取模型
async function fetchModels() {
    const url = document.getElementById('apiUrl').value;
    const key = document.getElementById('apiKey').value;
    const select = document.getElementById('modelSelect');
    
    select.innerHTML = '<option>加载中...</option>';

    // 这里只是模拟逻辑，因为没有真实的后端Proxy
    // 如果用户填了真实的OpenAI格式接口，这段代码可以工作
    try {
        if(!url) throw new Error("No URL");
        
        // 模拟延迟
        setTimeout(() => {
            const mockModels = [
                {id: 'gpt-4', name: 'GPT-4 (高智商)'},
                {id: 'gpt-3.5-turbo', name: 'GPT-3.5 (快速)'},
                {id: 'claude-3', name: 'Claude 3 (拟人)'}
            ];
            
            select.innerHTML = '';
            mockModels.forEach(m => {
                let opt = document.createElement('option');
                opt.value = m.id;
                opt.innerText = m.name;
                select.appendChild(opt);
            });
            alert(`成功拉取 ${mockModels.length} 个模型 (模拟)`);
        }, 1000);

    } catch (e) {
        select.innerHTML = '<option disabled>拉取失败</option>';
    }
}

// ============================
// 天气逻辑 (Open-Meteo API)
// ============================
function initWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(fetchWeather, weatherError);
    } else {
        document.getElementById('weatherDesc').innerText = "不支持定位";
    }
}

function weatherError() {
    document.getElementById('cityName').innerText = "未授权位置";
    document.getElementById('weatherDesc').innerText = "无法获取真实天气";
}

async function fetchWeather(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    
    // 使用 Open-Meteo 免费 API
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // 更新当前
        document.getElementById('cityName').innerText = "本地位置"; // API不返回城市名，通常需要逆地理编码，这里简化
        document.getElementById('currentTemp').innerText = Math.round(data.current_weather.temperature) + "°";
        document.getElementById('weatherDesc').innerText = getWeatherDesc(data.current_weather.weathercode);
        
        // 今天最高最低
        document.getElementById('todayHigh').innerText = Math.round(data.daily.temperature_2m_max[0]);
        document.getElementById('todayLow').innerText = Math.round(data.daily.temperature_2m_min[0]);

        // 生成未来一周
        const list = document.getElementById('forecastList');
        list.innerHTML = ''; // 清空
        
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        
        for(let i = 0; i < 7; i++) {
            const dateStr = data.daily.time[i];
            const dateObj = new Date(dateStr);
            const dayName = i === 0 ? "今天" : days[dateObj.getDay()];
            const code = data.daily.weathercode[i];
            const max = Math.round(data.daily.temperature_2m_max[i]);
            const min = Math.round(data.daily.temperature_2m_min[i]);

            const row = `
                <div class="forecast-row">
                    <div class="day-name">${dayName}</div>
                    <div class="day-icon">${getWeatherIcon(code)}</div>
                    <div class="day-temps">
                        <span class="temp-min">${min}°</span>
                        <span class="temp-max">${max}°</span>
                    </div>
                </div>
            `;
            list.innerHTML += row;
        }

    } catch (e) {
        console.error(e);
        document.getElementById('weatherDesc').innerText = "数据错误";
    }
}

// WMO Code 转换
function getWeatherDesc(code) {
    const map = {
        0: '晴朗', 1: '多云', 2: '阴', 3: '阴',
        45: '雾', 48: '雾凇',
        51: '毛毛雨', 61: '小雨', 63: '中雨', 65: '大雨',
        71: '小雪', 73: '中雪', 75: '大雪',
        95: '雷雨'
    };
    return map[code] || '未知';
}

function getWeatherIcon(code) {
    if(code === 0) return '☀️';
    if(code >= 1 && code <= 3) return '⛅';
    if(code >= 45 && code <= 48) return '🌫️';
    if(code >= 51 && code <= 67) return '🌧️';
    if(code >= 71 && code <= 77) return '❄️';
    if(code >= 95) return '⛈️';
    return '☁️';
}

// ============================
// 字体逻辑
// ============================
let savedPresets = JSON.parse(localStorage.getItem('fontPresets')) || [];
let tempFontUrl = '';

function previewFont(url) {
    tempFontUrl = url;
    // 简单的注入样式预览
    const previewStyle = `
        @font-face { font-family: 'PreviewFont'; src: url('${url}'); }
        #font-preview-area { font-family: 'PreviewFont', sans-serif; }
    `;
    // 移除旧的preview style if any
    let old = document.getElementById('previewStyleBlock');
    if(old) old.remove();
    
    const style = document.createElement('style');
    style.id = 'previewStyleBlock';
    style.innerHTML = previewStyle;
    document.head.appendChild(style);
}

function openSaveFontModal() {
    if(!tempFontUrl) {
        alert("请先输入字体 URL");
        return;
    }
    document.getElementById('nameModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('nameModal').style.display = 'none';
}

function savePresetConfirm() {
    const name = document.getElementById('presetNameInput').value;
    if(!name) return;

    savedPresets.push({ name: name, url: tempFontUrl });
    localStorage.setItem('fontPresets', JSON.stringify(savedPresets));
    renderPresets();
    closeModal();
    document.getElementById('presetNameInput').value = '';
}

function renderPresets() {
    const sel = document.getElementById('fontPresetSelect');
    sel.innerHTML = '<option value="default">系统默认</option>';
    savedPresets.forEach((p, index) => {
        let opt = document.createElement('option');
        opt.value = index;
        opt.innerText = p.name;
        sel.appendChild(opt);
    });
}
renderPresets(); // Init

function loadPreset(val) {
    if(val === 'default') {
        tempFontUrl = '';
        previewFont(''); // Clear preview
    } else {
        const p = savedPresets[val];
        tempFontUrl = p.url;
        document.getElementById('fontUrlInput').value = p.url;
        previewFont(p.url);
    }
}

function applyGlobalFont() {
    // 真正改变 :root 或者 global style
    const styleId = 'globalFontStyle';
    let style = document.getElementById(styleId);
    if(!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }

    if(!tempFontUrl) {
        // Reset
        style.innerHTML = "";
    } else {
        style.innerHTML = `
            @font-face {
                font-family: 'UserCustomFont';
                src: url('${tempFontUrl}');
                font-display: swap;
            }
        `;
    }
    alert("字体已保存至全局！");
}
// ============================
// 全屏 API 逻辑 (主要针对安卓/PC)
// ============================
function requestAndroidFullscreen() {
    // 获取整个 HTML 文档对象
    const docEl = document.documentElement;

    // 兼容不同浏览器的全屏请求方法
    const requestFullScreen = docEl.requestFullscreen || 
                              docEl.mozRequestFullScreen || 
                              docEl.webkitRequestFullScreen || 
                              docEl.msRequestFullscreen;
                              
    if (requestFullScreen) {
        requestFullScreen.call(docEl).catch(err => {
            console.log("全屏请求被浏览器拦截: ", err);
        });
    } else {
        alert("您的设备或浏览器不支持一键全屏，iOS用户请点击底部浏览器分享按钮，选择“添加到主屏幕”。");
    }
}
