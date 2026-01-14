// script.js
let espIp = '';
let espPort = 80;

// Hàm lưu thiết bị vào localStorage
function saveDevice(ip, port) {
    const devices = JSON.parse(localStorage.getItem('espDevices') || '[]');
    
    // Kiểm tra nếu đã tồn tại
    const existingIndex = devices.findIndex(d => d.ip === ip);
    if (existingIndex >= 0) {
        devices[existingIndex] = { ip, port };
    } else {
        devices.push({ ip, port });
    }
    
    localStorage.setItem('espDevices', JSON.stringify(devices));
}

// Hàm tải danh sách thiết bị đã lưu
function loadSavedDevices() {
    const devices = JSON.parse(localStorage.getItem('espDevices') || '[]');
    const container = document.getElementById('savedDevices');
    
    if (devices.length === 0) {
        container.innerHTML = '<p class="no-devices">Chưa có thiết bị nào được lưu</p>';
        return;
    }
    
    let html = '<div class="device-list">';
    devices.forEach(device => {
        html += `
            <div class="device-item">
                <span>${device.ip}:${device.port}</span>
                <button onclick="connectToDevice('${device.ip}', ${device.port})">Kết nối</button>
                <button onclick="removeDevice('${device.ip}')">Xóa</button>
            </div>
        `;
    });
    html += '</div>';
    
    container.innerHTML = html;
}

// Kết nối đến ESP32
function connectToESP() {
    espIp = document.getElementById('espIp').value.trim();
    espPort = parseInt(document.getElementById('port').value);
    
    if (!espIp) {
        alert('Vui lòng nhập địa chỉ IP của ESP32!');
        return;
    }
    
    // Kiểm tra kết nối
    testConnection(espIp, espPort)
        .then(success => {
            if (success) {
                // Lưu thiết bị
                saveDevice(espIp, espPort);
                
                // Chuyển đến trang điều khiển
                window.location.href = `controller.html?ip=${espIp}&port=${espPort}`;
            } else {
                alert('Không thể kết nối đến ESP32. Vui lòng kiểm tra lại IP và kết nối mạng.');
            }
        })
        .catch(error => {
            alert('Lỗi kết nối: ' + error);
        });
}

// Kiểm tra kết nối
async function testConnection(ip, port) {
    try {
        const response = await fetch(`http://${ip}:${port}/`, { 
            method: 'GET',
            mode: 'no-cors' // Chỉ kiểm tra kết nối
        });
        return true;
    } catch (error) {
        return false;
    }
}

// Gọi API ESP32
async function callESP32API(endpoint, params = {}) {
    const url = new URL(`http://${espIp}:${espPort}/${endpoint}`);
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    
    try {
        const response = await fetch(url);
        return await response.text();
    } catch (error) {
        addLog('❌ Lỗi kết nối: ' + error, 'error');
        return null;
    }
}

// Các hàm điều khiển
async function setAlarm(action) {
    const hour = document.getElementById('alarmHour').value;
    const minute = document.getElementById('alarmMinute').value;
    const sound = document.getElementById('alarmSound').value;
    
    const result = await callESP32API('setAlarmDirect', {
        hour, minute, sound,
        enable: action === 'enable' ? 1 : 0
    });
    
    if (result) {
        addLog(`✅ Báo thức đã ${action === 'enable' ? 'bật' : 'tắt'}`, 'success');
    }
}

async function pressButton(button) {
    const result = await callESP32API('button', { btn: button });
    if (result) {
        addLog(`✅ Đã nhấn nút ${button}`, 'success');
    }
}

async function snoozeAlarm() {
    const result = await callESP32API('snooze');
    if (result) {
        addLog('✅ Đã tạm dừng báo thức', 'success');
    }
}

async function resetESP() {
    if (confirm('Bạn có chắc muốn reset ESP32?')) {
        await callESP32API('reset');
        addLog('🔄 ESP32 đang reset...', 'warning');
    }
}

async function getWeather() {
    // Cần thêm endpoint trong ESP32 code
    // Ví dụ: server.on("/getWeather", handleGetWeather);
}

async function syncTime() {
    // Cần thêm endpoint trong ESP32 code
    // Ví dụ: server.on("/syncTime", handleSyncTime);
}

// Hiển thị logs
function addLog(message, type = 'info') {
    const logContainer = document.getElementById('logContainer');
    if (!logContainer) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const logElement = document.createElement('div');
    logElement.className = `log-item log-${type}`;
    logElement.innerHTML = `<span class="log-time">[${timestamp}]</span> ${message}`;
    
    logContainer.appendChild(logElement);
    logContainer.scrollTop = logContainer.scrollHeight;
}

// Tự động cập nhật thông tin
async function updateSystemInfo() {
    // Cập nhật nhiệt độ, độ ẩm, trạng thái
    // Cần thêm endpoint trong ESP32 code
    // Ví dụ: server.on("/getStatus", handleGetStatus);
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', function() {
    // Trang chủ
    if (document.getElementById('savedDevices')) {
        loadSavedDevices();
        
        // Tự động điền IP nếu có trong URL
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('ip')) {
            document.getElementById('espIp').value = urlParams.get('ip');
        }
    }
    
    // Trang điều khiển
    if (document.getElementById('espIpDisplay')) {
        const urlParams = new URLSearchParams(window.location.search);
        espIp = urlParams.get('ip') || '';
        espPort = parseInt(urlParams.get('port') || '80');
        
        if (espIp) {
            document.getElementById('espIpDisplay').textContent = `ESP32: ${espIp}`;
            document.getElementById('connectionStatus').textContent = '✅ Đã kết nối';
            
            // Bắt đầu cập nhật thông tin
            setInterval(updateSystemInfo, 5000);
            updateSystemInfo();
        } else {
            alert('Không có thông tin IP! Quay lại trang chủ.');
            window.location.href = 'index.html';
        }
    }
});
