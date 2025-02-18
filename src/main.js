import { createApp } from 'vue'
import elementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import {zhCn} from "element-plus/es/locale/index";
import App from './app.vue'

const app = createApp(App)
app.use(elementPlus, {
    locale: zhCn,
})

app.mount('#vue-workflow-diagram')
