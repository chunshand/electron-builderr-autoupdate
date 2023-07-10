# 自动更新


通过`electron-updater` 实现了应用的自动升级 `app\electron\lib\update.ts`,`autoUpdater.quitAndInstall(true, true)`静默升级安装，并打开应用


app 编译打包完后完后 复制对应的版本的 `latest.yml xxx.版本号.exe` 到`server/release` 下。

`server` 是用`koa`搭的一个简单的文件服务器。

旧版本应用新打开后，会自动检测新版本,进行下载

# 资源下载
<!-- http://127.0.0.1:3000/download.json -->
download.json
```json
{
    "data":[]
}
```

通过`electron-store` 持久化配置，通过请求`http://127.0.0.1:3000/download.json`，获取`server/release/download.json` 下的的 `data`。

简单进行diff 进行文件的下载。


# 渲染进程

默认打开`upload.vue`，进行资源和版本的检测，全部通过后，进入`home.vue`。

新版本下载成功后，会自动安装，重启。

重启到应用打开，中间有一段时间的安装(解压exe，覆盖当前版本内容)时长，需等待。
