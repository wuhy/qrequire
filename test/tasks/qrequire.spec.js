var expect = require('expect.js');
var prequire = require('../../index');
var path = require('path');

describe('qrequire', function () {
    it('should hook and unhook require correctly', function () {
        var rawRequire = require('module').prototype.require;
        prequire.hook();
        expect(rawRequire === require('module').prototype.require).not.to.be.ok();
        prequire.unhook();

        expect(rawRequire === require('module').prototype.require).to.be.ok();
    });

    it('should cache when hook', function () {
        prequire.hook();
        var fs = require('fs');
        expect(prequire.getModule('fs')).to.be(fs);
        prequire.unhook();
    });

    it('should clear cache after unhook', function () {
        prequire.hook();
        require('path');
        require('fs');
        prequire.unhook();
        expect(prequire.getModule('path')).to.be(undefined);
        expect(prequire.getModule('fs')).to.be(undefined);
    });

    it('should clear cache when clear cache', function () {
        prequire.hook();
        require('path');
        require('fs');
        prequire.clear();
        expect(prequire.getModule('path')).to.be(undefined);
        expect(prequire.getModule('fs')).to.be(undefined);
        prequire.unhook();
    });

    it('should ignore normal module require cache', function () {
        prequire.hook();
        var id = path.join(__dirname, '..', 'fixtures', 'a');
        var a = require(id);
        expect(a).not.to.eql(null);
        expect(prequire.getModule(id)).to.be(undefined);

        id = '../fixtures/b';
        var b = require(id);
        expect(b).not.to.eql(null);
        expect(prequire.getModule(id)).to.be(undefined);
        prequire.unhook();
    });

    it('should return cache when exist duplicate modules require', function () {
        prequire.hook();
        var c = require('../fixtures/c');
        expect(c).to.eql([ 'd:1.0', 'e:1.0' ]);

        var d = require('../fixtures/d');
        expect(d).to.eql([ 'd:1.0', 'e:1.0' ]);
        prequire.unhook();

        var e = require('../fixtures/d');
        expect(d).to.eql([ 'd:1.0', 'e:1.0' ]);
    });
});
