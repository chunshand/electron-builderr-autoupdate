import { net, WebContents } from "electron";
import { app } from "electron"
import fs from "fs"
import path from "path"
import Store from "electron-store"
type status =
    "CheckErr" |
    "CheckResIng" |
    "NewRes" |
    "NoRes" |
    "ResDownLoad" |
    "ResEnd";

export interface messageData {
    status: status,
    msg: string,
    data?: any
}
export interface resMessageInterface {
    [key: string]: messageData
}
/**
 * 下载资源更新检测
 */
export const resHandle = async (webContents: WebContents) => {
    const store = new Store();

    console.log("[resHandle]");
    // let data = {};
    // webContents.send("update", data)
    function sendUpdateMessage(data: any) {
        webContents.send("res", data)
    }
    let message: resMessageInterface = {
        error: { status: "CheckErr", msg: '检测资源异常' }, // skip
        checking: { status: "CheckResIng", msg: '正在检查资源更新...' },
        updateAva: { status: "NewRes", msg: '有新资源需要更新,正在下载,请稍后' },
        updateNotAva: { status: "NoRes", msg: '资源无需更新' }, // skip
        progress: { status: "ResDownLoad", msg: '更新文件正在下载中', data: {} },
        resEnd: { status: "ResEnd", msg: '更新下载完成' },
    }
    /**
     * 检查下载数据 并进行同步
     */
    function checkResData() {
        return new Promise((resolve, reject) => {
            const URL: string = "http://127.0.0.1:3000/download.json";
            let request = net.request(URL)
            request.on("response", (response) => {
                // 获取请求状态码
                // console.log(JSON.stringify(response.statusCode))
                // 获取请求头
                // console.log(JSON.stringify(response.headers));

                // 监听是否有数据
                response.on("data", (chunk) => {
                    const res = JSON.parse(chunk.toString());
                    resolve(res);
                })
                response.on('end', () => {
                    console.log('No more data in response.')
                })
            })
            request.on("error", (error) => {
                reject(error);
            })
            request.end();
        })
    }
    /**
     * 检测资源同步差异
     */
    function CheckRes(resData: any) {
        return new Promise((resolve) => {
            console.log(resData);
            // electron-store
            if (!store.has("res")) {
                store.set("res", resData)
                // 全部下载更新
                resolve(resData.data);
            } else {
                let _resData: any = store.get("res")
                let diff = resData.data.filter(function (val: any) {
                    return _resData.data.indexOf(val) === -1
                })
                // _resData 与 resData 进行比对
                resolve(diff);

            }

        })
    }
    try {
        let resData: any = await checkResData();
        let syncData: any = await CheckRes(resData);
        console.log("[downloadfiles]");
        console.log(syncData);
        if (syncData.length > 0) {
            sendUpdateMessage(message.updateAva);
        } else {
            // 无需更新
            sendUpdateMessage(message.updateNotAva);
            return;
        }
        /**
         * 需要下载的资源
         */
        for (const item of syncData) {
            if (fs.existsSync(item)) {
                fs.unlinkSync(item)
            }
            webContents.downloadURL(item);
        }
        let downloadLen = syncData.length;
        webContents.session.on('will-download', (_, item) => {
            let appDataPath = app.getPath("userData")
            let url = appDataPath + path.sep + "res" + path.sep + item.getFilename();
            item.setSavePath(url)
            message.progress.data.fileName = item.getFilename()
            sendUpdateMessage(message.progress);
            item.on('updated', (_, state) => {
                if (state === 'interrupted') {
                    console.log('Download is interrupted but can be resumed')
                } else if (state === 'progressing') {
                    if (item.isPaused()) {
                        console.log('Download is paused')
                    } else {
                        console.log(`Received bytes: ${item.getReceivedBytes()}`)
                    }
                }
            })
            item.once('done', (_, state) => {
                if (state === 'completed') {
                    console.log('Download successfully')
                    downloadLen--;
                    if (downloadLen == 0) {
                        sendUpdateMessage(message.resEnd);
                        store.set("res", resData)

                    }
                } else {
                    console.log(`Download failed: ${state}`)
                }

            })
        })
    } catch (error) {
        sendUpdateMessage(message.error);
    }
}