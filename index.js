/**
 * @file The entry module
 * @author sparklewhy@gmail.com
 */

module.exports = exports = {};

var path = require('path');
var Module = require('module');
var originalRequire = Module.prototype.require;

var cacheRequire = {};
var dependencyDir = 'node_modules';
var hooked = false;

function customRequire(modulePath) {
    var moduleId = modulePath;
    var skipCache = false;

    // resolve relative module id
    if (/^\./.test(modulePath)) {
        var filename = this.filename.replace(/\\/, '/');

        var index = filename.lastIndexOf(dependencyDir);
        if (index !== -1) {
            var parts = filename.substr(
                index + dependencyDir.length + 1
            ).split('/');
            parts.pop();
            moduleId = path.join(parts.join('/'), modulePath);
        }
        else {
            // skip the module is not installed in `dependencyDir`
            skipCache = true;
        }
    }
    else if (/^(\/|\w:)/.test(modulePath)) {
        // skip the absolute path module cache
        skipCache = true;
    }

    // XX: ignoring th situation that has the different version dependencies.
    if (!skipCache && cacheRequire[moduleId]) {
        return cacheRequire[moduleId];
    }

    var result = originalRequire.apply(this, arguments);
    skipCache || (cacheRequire[moduleId] = result);
    return result;
}

/**
 * hook the module require, override the require
 */
exports.hook = function () {
    if (hooked) {
        return;
    }
    hooked = true;

    // You can use https://docs.npmjs.com/cli/dedupe or NPM3+ to improve the module
    // load time. Here provide one way to improve the time using the cache. When
    // you use npm2 manage module, e.g., you using babel6, this way can greatly
    // reduce time, especially the loaded module having many duplicate module
    // dependencies.
    // Another way using cache basing the path cache:
    // https://github.com/bahmutov/cache-require-paths
    Module.prototype.require = customRequire;
};

/**
 * unhook the module require, recovery the original require
 */
exports.unhook = function () {
    if (hooked) {
        Module.prototype.require = originalRequire;
        hooked = false;

        exports.clear();
    }
};

/**
 * clear module cache when hooking
 */
exports.clear = function () {
    cacheRequire = {};
};

/**
 * get the module from the cache
 *
 * @param {string} id the normalize module id
 * @return {*}
 */
exports.getModule = function (id) {
    return cacheRequire[id];
};
