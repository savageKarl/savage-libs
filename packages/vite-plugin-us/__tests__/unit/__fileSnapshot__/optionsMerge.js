{
  "autoAddGrant": true,
  "build": {
    "cssMinify": true,
    "external": {
      "autoCDN": true,
      "exclusions": [],
      "resources": [],
    },
    "minify": true,
    "open": {
      "enable": true,
      "nameOrPath": "chrome",
    },
  },
  "entry": "./src/main.ts",
  "generate": {
    "modifyBundle": [Function],
    "modifyMetadata": [Function],
  },
  "metaData": {
    "author": "",
    "description": "A monorepo that stores all packages published on NPM.",
    "include": [
      "http://baidu.com",
    ],
    "name": "savage",
    "require": [],
    "supportURL": "",
    "version": "0.0.0",
  },
  "prefix": true,
  "server": {
    "host": "localhost",
    "open": {
      "enable": true,
      "nameOrPath": "chrome",
    },
    "port": 12345,
  },
}