'use strict';

var path = require('path');
var Crawler = require('simplecrawler');
var chalk = require('chalk');
var exec = require('child_process').exec;
var _ = {
  isEmpty: require('lodash/lang/isEmpty'),
  forEach: require('lodash/collection/forEach'),
};
var Spinner = require('cli-spinner').Spinner;
var URL = require('url-parse');
var fs = require('fs');

function W3CValidator(options, java_home) {
  var port = 80;
  var exclude = ['swf', 'pdf', 'ps', 'dwf', 'kml', 'kmz', 'gpx', 'hwp',
    'ppt', 'pptx', 'doc', 'docx', 'odp', 'ods', 'odt', 'rtf', 'wri', 'svg',
    'tex', 'txt', 'text', 'wml', 'wap', 'xml', 'gif', 'jpg', 'jpeg', 'png',
    'ico', 'bmp', 'ogg', 'webp', 'mp4', 'webm', 'mp3', 'ttf', 'woff', 'json',
    'rss', 'atom', 'gz', 'zip', 'rar', '7z', 'css', 'js', 'gzip', 'exe'];
  var exts = exclude.join('|');
  var regex = new RegExp('\.(' + exts + ')', 'i');

  this.options = options;
  this.chunk = [];
  this.count = 0;
  this.valid = 0;
  this.invalid = 0;
  this.JAVA_HOME = java_home;
  this.logData = '';
  this.httpProxy = false;

  this.uri = new URL(this.options.url);
  this.crawler = new Crawler(this.uri.host);

  this.logFileName = 'w3c-check-' + +new Date() + '-' + this.uri.host;

  this.crawler.initialPath = '/';

  if (process.env.NODE_ENV === 'development') {
    port = 8000;
  }
  this.crawler.initialPort = port;

  if (!this.uri.protocol) {
    this.uri.set('protocol', 'http:');
  }

  // Get proxy
  if (['127.0.0.1', 'localhost'].indexOf(this.crawler.host) === -1) {
    if (process.env.HTTP_PROXY !== undefined) {
      this.httpProxy = URL(process.env.HTTP_PROXY);
    } else if (process.env.http_proxy !== undefined) {
      this.httpProxy = URL(process.env.http_proxy);
    }
  }

  // Set Crawler proxy
  if (this.httpProxy !== false) {
    this.crawler.useProxy = true;
    this.crawler.proxyHostname = this.httpProxy.hostname;
    this.crawler.proxyPort = this.httpProxy.port;
  }

  this.crawler.initialProtocol = this.uri.protocol.replace(':', '');
  this.crawler.userAgent = 'Node/W3CValidator';

  if (!this.options.query) {
    this.crawler.stripQuerystring = true;
  }

  this.crawler.addFetchCondition(function (parsedURL) {
    return !parsedURL.path.match(regex);
  });
}

W3CValidator.prototype.checkURL = function () {
  var url = this.chunk.pop();
  var javaOpts = '';
  var spinner = new Spinner('  ' + url + ' %s');
  var vnuPath = path.join(__dirname, '../vnu/vnu.jar').replace(/\s/g, '\\ ');
  var finish;

  // Set JAVA Proxy
  if (this.httpProxy !== false) {
    javaOpts += '-Dhttp.proxyHost=' + this.httpProxy.hostname +
    ' -Dhttp.proxyPort=' + this.httpProxy.port;
  }

  spinner.start();

  exec('java ' + javaOpts + ' -jar ' + vnuPath + ' --format json ' + url,
    { env: { JAVA_HOME: this.JAVA_HOME } }, function (error, stdout, stderr) {
      var errors = JSON.parse(stderr);

      spinner.stop(true);

      if (_.isEmpty(errors.messages)) {
        this.valid++;
        console.log(chalk.bold.green('✓'), chalk.gray(url));
      } else {
        this.invalid++;
        console.log(chalk.red.bold('×', url));

        if (this.options.verbose) {
          _.forEach(errors.messages, function (m) {
            console.log('  Line ' + m.lastLine + ':  ' + m.message);
          });
        }

        if (this.options.log && errors.messages) {
          this.logData += '\n' + url + '\n';
          _.forEach(errors.messages, function (m) {
            this.logData += '  Line ' + m.lastLine + ':  ' + m.message;
          }.bind(this));
        }
      }

      if (!_.isEmpty(this.chunk)) {
        this.checkURL();
      } else {
        finish = function () {
          console.log(chalk.white('Checked %s sites. %s valid, %s invalid.'),
            this.count, this.valid, this.invalid);
          process.exit();
        };

        if (this.options.log) {
          fs.writeFile(path.join('./', this.logFileName + '.txt'),
          this.logData, function () {
            console.log('Wrote logged error data to \'%s.txt\'.', this.logFileName);
            finish.call(this);
          }.bind(this));
        } else {
          finish.call(this);
        }
      }
    }.bind(this));
};

W3CValidator.prototype.start = function () {
  var spinner = new Spinner('Fetching links... %s');

  this.crawler.on('crawlstart', function () {
    spinner.start();
  });

  this.crawler.on('fetchcomplete', function (item) {
    this.chunk.push(item.url);
    if (this.options.max && this.chunk.length >= this.options.max) {
      this.crawler.emit('complete');
      this.crawler.stop();
    }
  }.bind(this));

  this.crawler.on('complete', function () {
    spinner.stop(true);
    this.count = this.chunk.length;

    if (!_.isEmpty(this.chunk)) {
      this.checkURL();
    } else {
      console.error(chalk.red.bold('Error: Site "%s" could not be found.'), this.options.url);
      process.exit(1);
    }
  }.bind(this));

  this.crawler.start();
};

module.exports = W3CValidator;
