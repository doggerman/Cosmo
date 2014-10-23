describe('npm package', function() {
  beforeEach(function() {
    var shell = require('shelljs'),
        pack = shell.exec('npm pack', { silent: true });

    this.tarball = pack.output.split('\n')[0];
    this.tmpDir = '/tmp/jasmine-core';

    var path = this.path = require('path');
    var fs = this.fs = require('fs');

    this.fs.mkdirSync(this.tmpDir);

    var untar = shell.exec('tar -xzf ' + this.tarball + ' -C ' + this.tmpDir, { silent: true });
    expect(untar.code).toBe(0);

    this.packagedCore = require(this.path.join(this.tmpDir, 'package/lib/jasmine-core.js'));

    jasmine.addMatchers({
      toExistInPath: function(util, customEquality) {
        return {
          compare: function(actual, expected) {
            var fullPath = path.resolve(expected, actual);
            return {
              pass: fs.existsSync(fullPath)
            };
          }
        };
      }
    });
  });

  afterEach(function() {
    var path = this.path, fs = this.fs;
    var cleanup = function (parent, fileOrFolder) {
      var fullPath = path.join(parent, fileOrFolder);
      if (fs.statSync(fullPath).isFile()) {
        fs.unlinkSync(fullPath);
      } else {
        fs.readdirSync(fullPath).forEach(cleanup.bind(null, fullPath));
        fs.rmdirSync(fullPath);
      }
    };

    fs.unlink(this.tarball);
    fs.readdirSync(this.tmpDir).forEach(cleanup.bind(null, this.tmpDir));
    fs.rmdirSync(this.tmpDir);
  });

  it('has a root path', function() {
    expect(this.packagedCore.files.path).toEqual(this.fs.realpathSync(this.path.resolve(this.tmpDir, 'package/lib/jasmine-core')));
  });

  it('has a bootDir', function() {
    expect(this.packagedCore.files.bootDir).toEqual(this.fs.realpathSync(this.path.resolve(this.tmpDir, 'package/lib/jasmine-core')));
  });

  it('has jsFiles', function() {
    expect(this.packagedCore.files.jsFiles).toEqual([
      'jasmine.js',
      'jasmine-html.js',
      'json2.js'
    ]);

    var packagedCore = this.packagedCore;
    this.packagedCore.files.jsFiles.forEach(function(fileName) {
      expect(fileName).toExistInPath(packagedCore.files.path);
    });
  });

  it('has cssFiles', function() {
    expect(this.packagedCore.files.cssFiles).toEqual(['jasmine.css']);

    var packagedCore = this.packagedCore;
    this.packagedCore.files.cssFiles.forEach(function(fileName) {
      expect(fileName).toExistInPath(packagedCore.files.path);
    });
  });

  it('has bootFiles', function() {
    expect(this.packagedCore.files.bootFiles).toEqual(['boot.js']);
    expect(this.packagedCore.files.nodeBootFiles).toEqual(['node_boot.js']);

    var packagedCore = this.packagedCore;
    this.packagedCore.files.bootFiles.forEach(function(fileName) {
      expect(fileName).toExistInPath(packagedCore.files.bootDir);
    });

    var packagedCore = this.packagedCore;
    this.packagedCore.files.nodeBootFiles.forEach(function(fileName) {
      expect(fileName).toExistInPath(packagedCore.files.bootDir);
    });
  });

  it('has an imagesDir', function() {
    expect(this.packagedCore.files.imagesDir).toEqual(this.fs.realpathSync(this.path.resolve(this.tmpDir, 'package/images')));
    var images = this.fs.readdirSync(this.path.resolve(this.tmpDir, 'package/images'));

    expect(images).toContain('jasmine-horizontal.png');
    expect(images).toContain('jasmine-horizontal.svg');
    expect(images).toContain('jasmine_favicon.png');
  });
});
