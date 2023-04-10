// 引入crypto模块
var crypto = require('crypto');

// 定义节点函数
module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        // 获取配置参数
        var instanceId = config.instanceId;
        var productkey = config.productkey;
        var deviceName = config.deviceName;
        var deviceSecret = config.deviceSecret;
        var host = config.host;
        // 定义接口路径
        var path = '/v1/devices/' + instanceId + '/' + productkey + '/' + deviceName + '/resources';
        // 注册输入事件监听器
        node.on('input', function(msg) {
            // 获取输入消息中的resourceType参数
            var resourceType = msg.payload.resourceType || "MQTT";
            // 定义请求参数
            var body = {"resourceType":resourceType};
            // 将请求参数转换为JSON字符串，去掉空格
            var bodyString = JSON.stringify(body, null, 0);
            // 计算分钟级时间戳
            var timestamp = Math.floor(Date.now() / (1000*60));
            // 拼接待加密字符串
            var authStringPrefix = path + '\n' + timestamp + '\n' + bodyString;
            // 获取deviceSecret的字节数组
            deviceSecret = Buffer.from(deviceSecret);
            // 使用deviceSecret字节数组对待加密字符串进行HmacSHA256加密
            var hmac = crypto.createHmac('SHA256', deviceSecret).update(authStringPrefix).digest('base64');
            // 将加密后的字节数组进行Base64编码，并进行urlencode处理
            var signature = encodeURIComponent(hmac);
            // 将signature和timestamp放到请求头中
            var headers = {
                'Content-Type':'application/json',
                'expiryTime': timestamp,
                'signature': signature
            };
            // 发送请求（这里使用node-red内置的request模块）
            RED.util.request(this, {
                method: "POST",
                url: host + path,
                headers: headers,
                body: body,
                json: true
            }, msg).then(function(res) {
                // 处理响应结果
                msg.payload = res.body;
                node.send(msg);
            }).catch(function(err) {
                // 处理错误异常
                node.error(err,msg);
            });
        })
    }
}