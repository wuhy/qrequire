var expect = require('expect.js');
var qrequire = require('../../index');
var path = require('path');

describe('qrequire', function () {
    it('should hook and unhook require correctly', function () {
        var rawRequire = require('module').prototype.require;
        qrequire.hook();
        expect(rawRequire === require('module').prototype.require).not.to.be.ok();
        qrequire.unhook();

        expect(rawRequire === require('module').prototype.require).to.be.ok();
    });

    it('should cache when hook', function () {
        qrequire.hook();
        var fs = require('fs');
        expect(Object.keys(qrequire._cacheRequire)).to.eql(['fs']);
        expect(qrequire.getModule('fs')[0]).to.be(fs);
        qrequire.unhook();
    });

    it('should clear cache after unhook', function () {
        qrequire.hook();
        require('path');
        require('fs');
        qrequire.unhook();
        expect(qrequire._cacheRequire).to.be.empty();
    });

    it('should clear cache when clear cache', function () {
        qrequire.hook();
        require('path');
        require('fs');
        qrequire.clear();
        expect(qrequire._cacheRequire).to.be.empty();
        qrequire.unhook();
    });

    it('should ignore normal module require cache', function () {
        qrequire.hook();
        var id = path.join(__dirname, '..', 'fixtures', 'a');
        var a = require(id);
        expect(a).not.to.eql(null);
        expect(qrequire._cacheRequire).to.be.empty();

        id = '../fixtures/b';
        var b = require(id);
        expect(b).not.to.eql(null);
        expect(qrequire._cacheRequire).to.be.empty();
        qrequire.unhook();
    });

    it('should return different module when exist different version modules require', function () {
        qrequire.hook();
        var c = require('../fixtures/c');
        expect(c).to.eql([ 'd:1.0', 'e:2.0' ]);

        var d = require('../fixtures/d');
        expect(d).to.eql([ 'd:1.0', 'e:2.0' ]);
        expect(qrequire.getModule('f').length).to.be(2);
        qrequire.unhook();
    });

    it('should return cache module when exist same version modules require', function () {
        qrequire.hook();
        var result = require('../fixtures/same-require');
        expect(result).to.eql([ 'e-h', 'e-h' ]);

        expect(qrequire.getModule('h', '1.0.0')).to.be(
            require(path.join(__dirname, '../fixtures/node_modules/h'))
        );
        qrequire.unhook();
    });
});
