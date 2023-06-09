# node-red-baidu-dmp

百度物联网平台设备接入节点

## 支持特性

- 设备鉴权中心接入
- 属性上报
- 事件上报
- 服务消息订阅
- 模拟数据

## TODO

- 子设备上报
- 自动生成消息uuid
- 根据物模型生成模拟数据
- ...

## 安装并运行

需要先成功安装node-red，支持2.0以上，推荐安装node-red3.0

在node-red安装目录下执行

```
npm i @atorber/node-red-baidu-dmp
```

安装成功后重启node-red即可看到设备节点

![image](https://github.com/atorber/node-red-baidu-dmp/assets/19552906/00298689-f2ba-4ae0-a469-ce687ddc3db7)
