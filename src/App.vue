<template>
  <div id="app">
        <TerminalView
          ref="terminal"
          :terminal="terminal"
          :cols="100"
          :rows="24"
          auto-size
          :options="{
            scrollback: 5000,
            disableStdin: true,
            useFlowControl: true
          }"
          open-links
        />
  </div>
</template>

<script>
import TerminalView from './components/TerminalView.vue'

export default {
  name: 'app',
  components: {
    TerminalView
  },
  data () {
    return {
      terminal: {
        pid: 1,
        name: 'terminal',
        cols: 1000,
        rows: 1000
      },
      
    }
  },
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
