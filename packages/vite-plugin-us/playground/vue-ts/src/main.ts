import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import pkg from 'element-plus/package.json'

// console.log(pkg)

createApp(App)
  // .use(ElementPlus)
  .mount(
    (() => {
      const app = document.createElement('div')
      document.body.append(app)
      return app
    })()
  )
