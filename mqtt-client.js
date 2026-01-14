// MQTT Web Client for ESP32 Smart Clock
class MQTTClient {
    constructor(config) {
        this.config = config;
        this.client = null;
        this.connected = false;
        this.subscriptions = new Set();
    }
    
    // Initialize MQTT connection
    async connect() {
        try {
            const clientId = `web_client_${Math.random().toString(16).substr(2, 8)}`;
            
            // Connect using MQTT over WebSocket
            this.client = mqtt.connect(`wss://${this.config.MQTT_BROKER}:${this.config.MQTT_PORT}/mqtt`, {
                clientId: clientId,
                clean: true,
                connectTimeout: 4000,
                reconnectPeriod: 2000
            });
            
            // Setup event handlers
            this.setupEventHandlers();
            
            return new Promise((resolve, reject) => {
                this.client.on('connect', () => {
                    this.connected = true;
                    console.log('✅ MQTT Connected');
                    resolve(true);
                });
                
                this.client.on('error', (error) => {
                    console.error('❌ MQTT Error:', error);
                    reject(error);
                });
            });
            
        } catch (error) {
            console.error('Failed to initialize MQTT:', error);
            return false;
        }
    }
    
    // Setup MQTT event handlers
    setupEventHandlers() {
        this.client.on('message', (topic, message) => {
            this.handleMessage(topic, message.toString());
        });
        
        this.client.on('error', (error) => {
            console.error('MQTT Error:', error);
            this.connected = false;
        });
        
        this.client.on('close', () => {
            console.log('MQTT Connection closed');
            this.connected = false;
        });
    }
    
    // Subscribe to topic
    subscribe(topic) {
        if (this.client && this.connected) {
            this.client.subscribe(topic, (err) => {
                if (!err) {
                    this.subscriptions.add(topic);
                    console.log(`✅ Subscribed to: ${topic}`);
                }
            });
        }
    }
    
    // Unsubscribe from topic
    unsubscribe(topic) {
        if (this.client && this.connected) {
            this.client.unsubscribe(topic);
            this.subscriptions.delete(topic);
        }
    }
    
    // Publish message
    publish(topic, message) {
        if (this.client && this.connected) {
            this.client.publish(topic, JSON.stringify(message));
            console.log(`📤 Published to ${topic}:`, message);
            return true;
        }
        return false;
    }
    
    // Handle incoming messages
    handleMessage(topic, message) {
        try {
            const data = JSON.parse(message);
            console.log(`📨 Received from ${topic}:`, data);
            
            // Dispatch message to appropriate handler
            this.dispatchMessage(topic, data);
            
        } catch (error) {
            console.error('Error parsing MQTT message:', error);
        }
    }
    
    // Dispatch message to UI
    dispatchMessage(topic, data) {
        const event = new CustomEvent('mqtt-message', {
            detail: { topic, data }
        });
        window.dispatchEvent(event);
    }
    
    // Send command to ESP32 via MQTT
    sendCommand(command, data = {}) {
        const message = {
            command: command,
            data: data,
            timestamp: Date.now(),
            source: 'web_client'
        };
        
        return this.publish(this.config.MQTT_TOPICS.COMMAND, message);
    }
    
    // Request status update
    requestStatus() {
        return this.sendCommand('get_status', {});
    }
    
    // Disconnect
    disconnect() {
        if (this.client) {
            this.client.end();
            this.connected = false;
        }
    }
}

// Initialize MQTT client
let mqttClient = null;

function initMQTT() {
    if (typeof mqtt === 'undefined') {
        console.error('MQTT.js library not loaded');
        return null;
    }
    
    mqttClient = new MQTTClient(CONFIG);
    return mqttClient;
}

// Export for use in browser
if (typeof window !== 'undefined') {
    window.MQTTClient = MQTTClient;
    window.initMQTT = initMQTT;
    window.mqttClient = mqttClient;
}
