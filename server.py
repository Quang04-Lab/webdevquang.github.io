#!/usr/bin/env python3
"""
Server mô phỏng ESP32 để test Web Interface
Chạy: python server.py
Truy cập: http://localhost:8080
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import time
from urllib.parse import urlparse, parse_qs

class ESP32Simulator(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)
        
        if path == '/':
            self.send_index()
        elif path == '/setAlarmDirect':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'OK')
        elif path == '/button':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Button pressed')
        elif path == '/snooze':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Alarm snoozed')
        elif path == '/reset':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'System reset')
        elif path == '/resetSleepTimer':
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b'Sleep timer reset')
        else:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'Not Found')
    
    def send_index(self):
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        
        # HTML template tương tự ESP32
        html = '''
        <!DOCTYPE HTML>
        <html>
        <head>
            <title>Smart Clock Control</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body { font-family: Arial; text-align: center; padding: 20px; }
                .container { max-width: 400px; margin: 0 auto; }
                .section { margin: 15px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                input, select, button { padding: 10px; margin: 5px; }
                .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
                .on { background: #d4edda; color: #155724; }
                .off { background: #f8d7da; color: #721c24; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>🕒 Đồng Hồ Thông Minh (Simulator)</h1>
                
                <div class="section">
                    <h2>⏰ Báo Thức</h2>
                    <div style="margin: 15px 0;">
                        <input type="number" id="alarmHour" min="0" max="23" value="12">
                        <span>:</span>
                        <input type="number" id="alarmMinute" min="0" max="59" value="0">
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <select id="alarmSound">
                            <option value="0" selected>Beep</option>
                            <option value="1">Melody 1</option>
                            <option value="2">Melody 2</option>
                        </select>
                    </div>
                    
                    <div style="margin: 15px 0;">
                        <button onclick="setAlarmDirect(1)">BẬT BÁO THỨC</button>
                        <button onclick="setAlarmDirect(0)">TẮT BÁO THỨC</button>
                    </div>
                    
                    <div class="status on">
                        Trạng thái: ĐANG BẬT
                    </div>
                </div>
                
                <div class="section">
                    <h2>📊 Thông Tin Hệ Thống</h2>
                    <div>
                        <p><strong>Địa chỉ IP:</strong> 192.168.1.100</p>
                        <p><strong>WiFi:</strong> Đã kết nối</p>
                        <p><strong>Nhiệt độ:</strong> 25.5°C</p>
                        <p><strong>Độ ẩm:</strong> 65%</p>
                        <p><strong>Thời gian:</strong> 14:30:25</p>
                        <p><strong>Trạng thái Sleep:</strong> Đang hoạt động</p>
                    </div>
                </div>
            </div>
            
            <script>
                function setAlarmDirect(enable) {
                    const hour = document.getElementById('alarmHour').value;
                    const minute = document.getElementById('alarmMinute').value;
                    const sound = document.getElementById('alarmSound').value;
                    
                    fetch(`/setAlarmDirect?hour=${hour}&minute=${minute}&sound=${sound}&enable=${enable}`)
                        .then(() => alert(enable ? 'Báo thức đã BẬT!' : 'Báo thức đã TẮT!'));
                }
            </script>
        </body>
        </html>
        '''
        
        self.wfile.write(html.encode('utf-8'))
    
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == '/unlock':
            self.send_response(303)
            self.send_header('Location', '/')
            self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        # Tắt log mặc định
        pass

def run_server():
    server_address = ('', 8080)
    httpd = HTTPServer(server_address, ESP32Simulator)
    print('Server đang chạy tại http://localhost:8080')
    print('Nhấn Ctrl+C để dừng')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
