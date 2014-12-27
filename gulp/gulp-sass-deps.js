/*!
 * module dependencies
 */
var os = require('os');
var fs = require('fs');
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

function regexpEscape(str) {
  return str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

/**
 * Maintain a list of SASS @imports.
 *
 * Include this plugin **BEFORE** piping to `gulp-sass`.
 *
 * This plugin expects a single "entry" file which imports all other SASS files
 * in your project. If you do not have an entry file (i.e. all your SASS file
 * names begin with an underscore), this plugin will generate such a file which
 * will import all your other SASS files.
 *
 * If the plugin generates an entry file, it will only be written to disk if you
 * give both the `entryFile` path and `maintainEntryFile: true` options.
 *
 * Also keep in mind that `gulp-sass` automatically creates the `includePaths`
 * option to `node-sass` -- this plugin assumes that default behavior here.
 *
 * @param {string|object} options
 * @param {array} [options.comment] A unique comment placed at the top of the
 * maintained @import block. The default is "[gulp-sass-deps maintains this
 * @import block]"
 * @param {string} [options.entryFile] A file path. If you do not wish to create
 * an entry file manually, this path will be used when creating a Vinyl entry
 * file. In most cases this file will never be written to disk -- `gulp-sass`
 * will simply use it to import all of your actual SASS files.
 * @param {boolean} [options.maintainEntryFile] If you have already created an
 * entry file OR if you specify the `entryFile` option, this will cause that
 * file to be updated on disk (existing data are preserved -- only the @import
 * block maintained by this plugin will be altered).
 */
module.exports = function(options) {
  var entryFile;
  var importPaths = [];
  var includePaths = [];

  options = options || {};
  if (!options.comment) {
    options.comment = '[gulp-sass-deps maintains this @import block]';
  }
  if (!options.entryFile) {
    options.entryFile = path.join(os.tmpdir(), 'gulp-sass-deps-entry.scss');
    options._tmpEntryFile = true;
  }

  /**
   * Collect the paths for all importable SASS.
   */
  function collectSassDeps(file, enc, next) {
    if (file.isNull()) return next(null, file);

    var extname = path.extname(file.path);
    var basename = path.basename(file.path, extname);
    var dirname = path.dirname(file.path);

    if (basename[0] === '_') {
      basename = basename.slice(1);
      importPaths.push(path.join(dirname, basename));
      includePaths.push(dirname);
      return next(null, file);
    }

    // This plugin only supports a single "entry" file in which all SASS
    // importa are listed.
    //
    // We filter out this file so we can alter it in `writeSassDeps` before
    // sending it on its way.
    else if (!entryFile) {
      entryFile = file;
      includePaths.push(dirname);
      return next();
    }
    else if (entryFile) {
      return next(new PluginError(
        'gulp-sass-deps',
        'Multiple SASS entry files. Ensure all SASS files begin with an ' +
        'underscore, except one which will @import all the others.'
      ));
    }
  }

  /**
   * Compile the @import block.
   */
  function writeSassDeps(done) {
    if (!entryFile) {
      entryFile = new gutil.File({
        cwd: '',
        base: '',
        path: options.entryFile,
        contents: new Buffer('/**\n * This file was created by ' +
          'gulp-sass-deps\n * It is used only to maintain a list of SASS ' +
          'files to import.\n */\n')
      });

      // prevent writing the generated entry file to a tmp location.
      // note: this *could* still happen if a downstream plugin decides to write
      // files to disk.
      if (options._tmpEntryFile === true) {
        options.maintainEntryFile = false;
      }
    }

    if (!entryFile.isBuffer()) {
      return done(new PluginError(
        'gulp-sass-deps',
        'Only Buffers are currently supported.'
      ));
    }

    var push = this.push.bind(this);
    var contents = String(entryFile.contents);
    var comment = '// ' + options.comment;
    var importBlockRegex = new RegExp(regexpEscape(comment) + '[^;]+;\n');

    // match existing import statements (excluding our maintained list).
    var existingImports = [];
    var existingImportRegex = /@import[\s](?!url)([^;]+)/g;
    var existingImportStatements = contents
      .replace(importBlockRegex, '').match(existingImportRegex);

    if (Array.isArray(existingImportStatements)) {

      // extract the file path for each existing import.
      existingImportStatements.forEach(function(importStatement) {
        importStatement = importStatement.split(',').map(function(importPath) {
          return importPath.replace('@import', '').trim().replace(/^"|"$/g, '');
        });
        existingImports = existingImports.concat(importStatement);
      });

      importPaths = importPaths.filter(function(importPath) {
        return !~existingImports.indexOf(path.basename(importPath));
      });
    }

    if (importPaths.length > 0) {

      // make each import path relative, favoring whichever includePath results in
      // the shorter string.
      importPaths = importPaths.map(function(importPath) {
        return includePaths.reduce(function(a, b) {
          var aRel = path.relative(path.dirname(a), importPath);
          var bRel = path.relative(path.dirname(b), importPath);
          return aRel.length <= bRel.length ? aRel : bRel;
        });
      })
      .sort(function(a, b) {return a > b; });

      // build the import block.
      var importBlock = importPaths.reduce(function(ret, importPath) {
        return ret + '\t"' + importPath + '",\n';
      }, comment + '\n@import\n');
      importBlock = importBlock.slice(0, -2) + ';\n';

      // replace or append the import block.
      if (importBlockRegex.test(contents)) {
        contents = contents.replace(importBlockRegex, importBlock);
      }
      else {
        contents = contents + '\n' + importBlock;
      }

      entryFile.contents = new Buffer(contents);
    }

    if (options.maintainEntryFile) {
      fs.writeFile(entryFile.path, entryFile.contents, function(err) {
        if (err) return done(new PluginError('gulp-sass-deps', err));
        push(entryFile);
        done();
      });
    }
    else {
      push(entryFile);
      done();
    }
  }

  return through.obj(collectSassDeps, writeSassDeps);
};
