qrequire
======

[![Build Status](https://travis-ci.org/wuhy/asset-util.svg?branch=master)](https://travis-ci.org/wuhy/qrequire) [![Dependency Status](https://david-dm.org/wuhy/qrequire.svg)](https://david-dm.org/wuhy/qrequire) [![devDependency Status](https://david-dm.org/wuhy/qrequire/dev-status.svg)](https://david-dm.org/wuhy/qrequire#info=devDependencies) [![NPM Version](https://img.shields.io/npm/v/qrequire.svg?style=flat)](https://npmjs.org/package/qrequire)

> A node utility to improve node module require time using cache particularly for npm2 which may exists repeated module dependencies

## How to use

### Install

```shell
npm install qrequire --save
```
### Usage

```javasript
var qrequire = require('qrequire');
qrequire.hook();
// require the module you wanna speed up
qrequire.unhook();

```

### Limit

Ignore the situation that has the different version dependencies.
