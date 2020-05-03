module.exports = {
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        "productName": "http-server-ui",
        "appId": "local.test.app1",
        "copyright": "Copyright © 2018 ${author}",
        "mac": {
        "category": "http-server",
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
            "category": "http-server"
        }
      }
    }
  }
}