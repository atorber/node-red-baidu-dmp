// 引入crypto模块
var crypto = require('crypto');

// 定义节点函数
module.exports = function(RED) {
    function DeviceAuth(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        // 从配置中获取相关参数
        var { instanceId, productkey, deviceName, deviceSecret, host } = config;
        
        // 定义接口路径
        var path = `/v1/devices/${instanceId}/${productkey}/${deviceName}/resources`;
        
// 注册输入事件监听器
node.on('input', function(msg) {
    // 获取输入消息中的resourceType参数，默认为 "MQTT"
    var resourceType = msg.payload.resourceType || "MQTT";
    
    if (!instanceId || !productkey || !deviceName || !deviceSecret || !host) {
        node.error('缺少必要的配置参数，无法发送请求');
        return;
    }

    // 定义请求参数并将其转换为JSON字符串，去掉空格
    var bodyString = JSON.stringify({ resourceType }, null, 0);
    
    // 计算分钟级时间戳
    var timestamp = Math.floor(Date.now() / (1000 * 60));
    
    // 计算请求签名
    var signature = createSignature(deviceSecret, path, bodyString, timestamp);
    
    if (!signature) {
        node.error('无法生成请求签名');
        return;
    }
    
    // 构建请求头
    var headers = {
        'Content-Type': 'application/json',
        'expiryTime': timestamp,
        'signature': signature
    };
    
    // 发送请求
    sendRequest(node, host + path, headers, { resourceType }, msg);
});
    }

    // 注册节点类型
    RED.nodes.registerType("dmp-auth", DeviceAuth);
}

// 创建请求签名
function createSignature(deviceSecret, path, bodyString, timestamp) {
    try {
        var authStringPrefix = `${path}\n${timestamp}\n${bodyString}`;
        deviceSecret = Buffer.from(deviceSecret);
        
        // 使用设备密钥执行HmacSHA256加密，并将结果以base64格式输出
        return encodeURIComponent(crypto.createHmac('SHA256', deviceSecret).update(authStringPrefix).digest('base64'));
    } catch (error) {
        node.error('创建签名失败: ' + error.message, msg);
        return '';
    }
}

// 发送请求并处理响应或错误
function sendRequest(node, url, headers, body, msg) {
    RED.util.request(node, {
        method: "POST",
        url: url,
        headers: headers,
        body: body,
        json: true
    }, msg).then(function(res) {
        msg.payload = res.body;
        node.send(msg);
    }).catch(function(err) {
        node.error(err, msg);
    });
}
