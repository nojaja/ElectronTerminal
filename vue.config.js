module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        "productName": "terminal",
        "appId": "local.terminal.app1",
        "copyright": "Copyright © 2020 ${author}",
        "mac": {
        "category": "terminal",
        "target": "dmg"
        },
        "dmg": {
            "contents": [
                {
                    "x": 130,
                    "y": 220
                },
                {
                    "x": 410,
                    "y": 220,
                    "type": "link",
                    "path": "/Applications"
                }
            ]
        },
        "win": {
            "target": {
                "target": "zip",
                "arch": ["x64"]
            }
        },
        "linux": {
            "category": "terminal"
        }
      }
    }
  }
}