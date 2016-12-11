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
var depenceDirLen = dependencyDir.length;
var hooked = false;

function getPkgDir(modulePath) {
    modulePath = normalize(modulePath);
    var index = modulePath.lastIndexOf(dependencyDir);
    if (index !== -1) {
        var parts = modulePath.substr(
            index + depenceDirLen + 1
        ).split('/');
        return modulePath.substr(0, index + depenceDirLen + 1) + parts.shift();
    }
}

function getModuleVersion(pkgDir) {
    if (!pkgDir) {
        return;
    }

    try {
        var metaFile = originalRequire(path.join(pkgDir, 'package.json'));
        return metaFile.version;
    }
    catch (ex) {
    }
}

function resolveModule(modulePath, module) {
    var resolvePath = Module._resolveFilename(modulePath, module);
    var pkgDir = getPkgDir(resolvePath);
    var version;
    if (modulePath !== resolvePath && pkgDir) { // skip native module
        version = getModuleVersion(pkgDir);
    }

    return {
        resolvePath: resolvePath,
        version: version,
        pkgDir: pkgDir
    };
}

function normalize(filePath) {
    return filePath.replace(/\\/, '/');
}

function getCacheKey(moduleId, version) {
    return moduleId + (version ? '@' + version : '');
}

function customRequire(modulePath) {
    var moduleId = modulePath;
    var ignoreCache = false;
    var toRequireVersion;
    var resolvePath;

    // resolve relative module id
    if (/^\./.test(modulePath)) {
        var filename = normalize(this.filename);

        var index = filename.lastIndexOf(dependencyDir);
        if (index !== -1) {
            var parts = filename.substr(
                index + depenceDirLen + 1
            ).split('/');
            parts.pop();

            var modPkgDir = filename.substr(0, index + depenceDirLen + 1) + parts[0];
            toRequireVersion = getModuleVersion(modPkgDir);

            resolvePath = normalize(path.join(
                filename.substr(0, filename.lastIndexOf('/')),
                modulePath
            ));
            moduleId = normalize(path.join(
                parts.join('/'),
                modulePath
            ));
        }
        else {
            // skip the module is not installed in `dependencyDir`
            ignoreCache = true;
        }
    }
    else if (/^(\/|\w:)/.test(modulePath)) {
        // skip the absolute path module cache
        ignoreCache = true;
    }
    else {
        var resolveInfo = resolveModule(modulePath, this);
        toRequireVersion = resolveInfo.version;
        resolvePath = resolveInfo.resolvePath;
    }

    // XX: ignoring the situation that has the same version and module id
    // with the different implementation.
    var cacheKey = getCacheKey(moduleId, toRequireVersion);
    if (!ignoreCache && cacheRequire[cacheKey]) {
        return cacheRequire[cacheKey];
    }

    var result = originalRequire.call(this, resolvePath || modulePath);
    if (!ignoreCache) {
        cacheRequire[cacheKey] = result;
    }
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
    exports._cacheRequire = cacheRequire = {};
};

exports._cacheRequire = cacheRequire;

/**
 * get the module from the cache
 *
 * @param {string=} id the normalize module id
 * @param {string=} version the version to get
 * @return {?Array|?Object}
 */
exports.getModule = function (id, version) {
    var result = [];
    Object.keys(cacheRequire).some(function (item) {
        var index = item.lastIndexOf('@');
        var modId = item;
        var currVersion;
        if (index !== -1 && index !== 0) {
            modId = item.substr(0, index);
            currVersion = item.substr(index + 1);
        }
        if (modId === id && (!version || currVersion === version)) {
            result.push(cacheRequire[item]);

            if (version) {
                return true;
            }
        }
    });

    if (result.length) {
        return version ? result[0] : result;
    }

    return null;
};

