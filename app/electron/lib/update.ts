import { WebContents } from "electron";
import { AppUpdater, ProgressInfo } from "electron-updater";

type status =
    "CheckErr" |
    "CheckUpdateIng" |
    "NewVersion" |
    "NoUpdate" |
    "UpdateDownLoad" |
    "UpdateEnd";

export interface messageData {
    status: status,
    msg: string,
    data?: any
}
export interface updateMessageInterface {
    [key: string]: messageData
}
/**
 * 版本检测 
 * 静默升级 自动重启 不带用户确认 强制更新
 * dev 中 版本检测 不起作用 会跳过
 * @param autoUpdater 
 * @param webContents 
 */
export const updateHandle = (autoUpdater: AppUpdater, webContents: WebContents) => {
    function sendUpdateMessage(data: any) {
        webContents.send("update", data)
    }
    let message: updateMessageInterface = {
        error: { status: "CheckErr", msg: '检测更新查询异常' }, // skip
        checking: { status: "CheckUpdateIng", msg: '正在检查更新...' },
        updateAva: { status: "NewVersion", msg: '检测到新版本,正在下载,请稍后' }, 
        updateNotAva: { status: "NoUpdate", msg: '您现在使用的版本为最新版本,无需更新!' }, // skip
        progress: { status: "UpdateDownLoad", msg: '更新文件正在下载中', data: {} },
        updateEnd: { status: "UpdateEnd", msg: '更新下载完成，即将重启应用' },
    }
    // 检测更新查询异常
    autoUpdater.on('error', function (error) {
        console.error("检测更新异常", error);
        sendUpdateMessage(message.error)
    })
    // 当开始检查更新的时候触发
    autoUpdater.on('checking-for-update', function () {
        sendUpdateMessage(message.checking)
        console.log("检测更新触发");
    })
    // 当发现有可用更新的时候触发，更新包下载会自动开始
    autoUpdater.on('update-available', function (info) {
        sendUpdateMessage(message.updateAva)
        console.log("发现有可用的更新", info);
    })
    // 当发现版本为最新版本触发
    autoUpdater.on('update-not-available', function (info) {
        sendUpdateMessage(message.updateNotAva)
        console.log("发现有新版本触发", info);
    })
    // 更新下载进度事件
    autoUpdater.on('download-progress', function (progressObj: ProgressInfo) {
        message.progress.data = progressObj;
        sendUpdateMessage(message.progress)
        console.log("版本下载进度", progressObj);
    })
    // 包下载成功时触发
    // @ts-ignore
    autoUpdater.on('update-downloaded', () => {
        // console.log(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate)
        sendUpdateMessage(message.updateEnd)
        autoUpdater.quitAndInstall(true, true) // 包下载完成后，重启当前的应用并且安装更新
    })
}