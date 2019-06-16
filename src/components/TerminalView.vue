<template>
  <div class="terminal-view card">
    <div class="view">
      <div ref="render" class="xterm-render"/>
    </div>
  </div>
</template>

<script>
import { Terminal } from 'xterm';
import * as fit from 'xterm/dist/addons/fit/fit';
import * as webLinks from 'xterm/dist/addons/webLinks/webLinks';
import {ipcRenderer} from 'electron'


Terminal.applyAddon(fit)
Terminal.applyAddon(webLinks)

const defaultTheme = {
  foreground: '#2c3e50',
  background: '#fff',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff'
}

const darkTheme = {
  ...defaultTheme,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030'
}

export default {

  props: {
    msg: String,
    cols: {
      type: Number,
      required: true
    },
    rows: {
      type: Number,
      required: true
    },
    content: {
      type: String,
      default: undefined
    },
    autoSize: {
      type: Boolean,
      default: false
    },
    options: {
      type: Object,
      default: () => ({})
    },

    title: {
      type: String,
      default: null
    },

    openLinks: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    theme () {
      if (this.darkMode) {
        return darkTheme
      } else {
        return defaultTheme
      }
    }
  },
  created : function () {
    console.log('---created----');
    if (typeof this.$_terminal === 'undefined') {
       this.initTerminal()
    }
  },
  watch: {
    cols (c) {
      this.$_terminal.resize(c, this.rows)
    },
    rows (r) {
      this.$_terminal.resize(this.cols, r)
    },
    content: 'setContent',

    darkMode (value, oldValue) {
      if (typeof oldValue === 'undefined') {
        this.initTerminal()
      } else if (this.$_terminal) {
        this.$_terminal.setOption('theme', this.theme)
      }
    }

  },
  beforeDestroy () {
console.log('-------');
console.log(this);
    this.$_terminal.destroy()
  },
  methods: {
    initTerminal () {
      console.log('-------');
      console.log('initTerminal');
      let term = this.$_terminal = new Terminal({
        cols: this.cols,
        rows: this.rows,
        theme: this.theme,
        ...this.options
      })
      webLinks.webLinksInit(term, this.handleLink)
      console.log(this.$refs.render)
      term.open(this.$refs.render)
      term.prompt = () => {
            term.write('\r\n$ ');
        };

        term.writeln('Welcome to xterm.js');
        term.writeln('This is a local terminal emulation, without a real terminal in the back-end.');
        term.writeln('Type some keys and commands to play around.');
        term.writeln('');
        term.prompt();
        term.on('key', function(key, ev) {
            const printable = !ev.altKey && !ev.altGraphKey && !ev.ctrlKey && !ev.metaKey;

            ipcRenderer.send('terminal', JSON.stringify({key:key, ev:ev}));
            if (ev.keyCode === 13) {
                ipcRenderer.send('asynchronous-message', 'ping');
                term.prompt();
            } else if (ev.keyCode === 8) {
                // Do not delete the prompt
                if (term._core.buffer.x > 2) {
                    term.write('\b \b');
                }
            } else if (printable) {
                term.write(key);
            }
        });

        term.on('paste', function(data) {
            term.write(data);
        });

        ipcRenderer.on('terminal', (event, arg) => {
          console.log(event,arg);
          term.write(arg);
          term.prompt();
        })


        term.on('blur', () => this.$emit('blur'))
        term.on('focus', () => this.$emit('focus'))

        if (this.autoSize) {
          this.$nextTick(this.fit)
        }
    },

    setContent (value, ln = true) {
      if (value.indexOf('\n') !== -1) {
        value.split('\n').forEach(
          t => this.setContent(t)
        )
        return
      }
      if (typeof value === 'string') {
        this.$_terminal[ln ? 'writeln' : 'write'](value)
      } else {
        this.$_terminal.writeln('')
      }
    },

    addLog (log) {
      this.setContent(log.text, log.type === 'stdout')
    },

    clear () {
      this.$_terminal.clear()
    },

    scrollToBottom () {
      this.$_terminal.scrollToBottom()
    },

    handleLink (event, uri) {
      if (this.openLinks) {
        window.open(uri, '_blank')
      }
      this.$emit('link', uri)
    },

    async fit () {
      let term = this.$_terminal
      term.element.style.display = 'none'

      await this.$nextTick()

      term.fit()
      term.element.style.display = ''
      term.refresh(0, term.rows - 1)
    },

    focus () {
      this.$_terminal.focus()
    },

    blur () {
      this.$_terminal.blur()
    }
  }
}
</script>


<style lang="stylus">
@import "~xterm/dist/xterm.css"
</style>
<!--
<style lang="stylus" scoped>
.terminal-view
  v-box()
  align-items stretch

  .view
    flex 100% 1 1
    height 0
    position relative
    padding-left $padding-item

  .xterm-render
    width 100%
    height 100%
    >>> .xterm
      .xterm-cursor-layer
        display none
</style>
-->