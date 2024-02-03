import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

import { liberate } from 'react-liberate'
import { reactLiberatePersist } from 'react-liberate-persist'

liberate.use(reactLiberatePersist)
console.debug('i am entry file')
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)

