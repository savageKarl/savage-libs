import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

import { createUsContainer } from '../../../src'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
createApp(App).mount(createUsContainer())
