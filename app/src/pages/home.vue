<template>
    <div class="home background">
        <span class="main">Home-{{ version }}</span>
    </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue"
import { ipcRenderer } from "electron"
const version = ref<string>("");
onMounted(() => {
    ipcRenderer.on("getAppInfo", (_, data: any) => {
        version.value = data.toString();
    })
    ipcRenderer.send("getAppInfo")
})
</script>
<style lang="scss" scoped>
.home {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    height: 100%;
    height: 100%;

    .main {
        font-size: 56px;
        color: #fff;
        position: relative;
        z-index: 2;

    }
}
</style>