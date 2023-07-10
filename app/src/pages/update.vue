<template>
    <div class="update background">
        <div>
            <div class="line" v-if="isUpdate">
            </div>
            <span class="loading-text">{{ loadingMessage }}</span>
        </div>
    </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { ipcRenderer } from 'electron'
import { useRouter } from "vue-router"
const router = useRouter();
type status =
    "CheckErr" |
    "CheckUpdateIng" |
    "NewVersion" |
    "NoUpdate" |
    "UpdateDownLoad" |
    "UpdateEnd" |
    "CheckResIng" |
    "NewRes" |
    "NoRes" |
    "ResDownLoad" |
    "ResEnd";
interface messageData {
    status: status,
    msg: string,
    data?: any
}
/**
 * 版本更新数据
 */
const verUpdateData = ref<messageData>()
/**
 * 是否开启更新
 */
const isUpdate = ref(false)
/**
 * 加载信息
 */
const loadingMessage = ref("")
const checkVersion = () => {
    /**
     * 开始检测版本
     */
    ipcRenderer.send("res")
    ipcRenderer.on("update", (_: any, data: messageData) => {
        console.log(data);
        verUpdateData.value = data;
        if (data.status == 'UpdateDownLoad') {
            loadingMessage.value = data.data ? data.msg + ":" + data.data.percent + "%" : data.msg;
        } else {
            loadingMessage.value = data.msg;
        }
        // 检查异常  无需更新
        if (['CheckErr', 'NoUpdate'].includes(data.status)) {
            // 无需更新 则进行资源更新
            // ipcRenderer.send("res")
            setTimeout(() => {
                router.push("/home")
            }, 800);
            return;
        }
        if (data.status == 'NewVersion') {
            isUpdate.value = true;
            return;
        }
    })
    ipcRenderer.on("res", (_: any, data: messageData) => {
        if (data.status == 'ResDownLoad') {
            loadingMessage.value = data.data ? data.msg + ":" + data.data.fileName : data.msg;
        } else {
            loadingMessage.value = data.msg;
        }
        // 检查异常  NoRes
        if (['CheckErr', 'NoRes', 'ResEnd'].includes(data.status)) {
            ipcRenderer.send("update")
            return;
        }
        if (data.status == 'NewRes') {
            isUpdate.value = true;
            return;
        }
    })

}
onMounted(() => {
    checkVersion();
})
</script>
<style lang="scss" scoped>
.update {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    height: 100%;

    .line {
        width: 600px;
        height: 20px;
        background-color: #fff;
        // -webkit-box-reflect: below 1px -webkit-linear-gradient(transparent,rgba(0,0,0,0.3)); 
        position: relative;
        border-radius: 20px;
        z-index: 2;
    }

    .loading-text {
        color: #eeeeee;
        display: inline-block;
        z-index: 2;
        width: 100%;
        text-align: center;
        position: relative;
        padding-top: 16px;
    }

    .line::after {
        position: absolute;
        content: "";
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-image: repeating-linear-gradient(to right, #03A9F4, #00C4F4, #00DADC, #30EBB4, #A3F58A, #F9F871, #A3F58A, #30EBB4, #00DADC, #00C4F4, #03A9F4);
        background-size: 500%;
        animation: test 5s linear infinite;
        border-radius: 20px;
    }

    .line::before {
        position: absolute;
        content: "";
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-image: repeating-linear-gradient(to right, #03A9F4, #00C4F4, #00DADC, #30EBB4, #A3F58A, #F9F871, #A3F58A, #30EBB4, #00DADC, #00C4F4, #03A9F4);
        background-size: 500%;
        filter: blur(10px);
        animation: test 5s linear infinite;
        border-radius: 20px;


    }

    @keyframes test {
        0% {
            background-position: 0 0;
        }

        0% {
            background-position: 500% 0;
        }

    }
}
</style>