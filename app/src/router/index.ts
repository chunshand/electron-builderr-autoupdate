import { createWebHashHistory, createRouter, RouteRecordRaw } from "vue-router"
import Home from "../pages/home.vue"
import Update from "../pages/update.vue"
const routes: RouteRecordRaw[] = [
    { path: '/', component: Update },
    { path: '/home', component: Home },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})
export default router;