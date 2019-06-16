import Vue from 'vue'
import App from './App.vue'
import {ipcRenderer} from 'electron'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(arg); // prints "pong"
})
ipcRenderer.send('asynchronous-message', 'ping')

ipcRenderer.on('terminal', (event, arg) => {
  console.log(arg); // prints "pong"
})

