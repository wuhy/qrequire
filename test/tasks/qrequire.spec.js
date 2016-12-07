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
        expect(qrequire.getModule('fs')).to.be(fs);
        qrequire.unhook();
    });

    it('should clear cache after unhook', function () {
        qrequire.hook();
        require('path');
        require('fs');
        qrequire.unhook();
        expect(qrequire.getModule('path')).to.be(undefined);
        expect(qrequire.getModule('fs')).to.be(undefined);
    });

    it('should clear cache when clear cache', function () {
        qrequire.hook();
        require('path');
        require('fs');
        qrequire.clear();
        expect(qrequire.getModule('path')).to.be(undefined);
        expect(qrequire.getModule('fs')).to.be(undefined);
        qrequire.unhook();
    });

    it('should ignore normal module require cache', function () {
        qrequire.hook();
        var id = path.join(__dirname, '..', 'fixtures', 'a');
        var a = require(id);
        expect(a).not.to.eql(null);
        expect(qrequire.getModule(id)).to.be(undefined);

        id = '../fixtures/b';
        var b = require(id);
        expect(b).not.to.eql(null);
        expect(qrequire.getModule(id)).to.be(undefined);
        qrequire.unhook();
    });

    it('should return cache when exist duplicate modules require', function () {
        qrequire.hook();
        var c = require('../fixtures/c');
        expect(c).to.eql([ 'd:1.0', 'e:1.0' ]);

        var d = require('../fixtures/d');
        expect(d).to.eql([ 'd:1.0', 'e:1.0' ]);
        qrequire.unhook();

        var e = require('../fixtures/d');
        expect(d).to.eql([ 'd:1.0', 'e:1.0' ]);
    });
});
