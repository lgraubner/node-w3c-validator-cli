#!/usr/bin/env node

'use strict';

var program = require('commander');
var W3CValidator = require('./lib/W3CValidator.js');
var chalk = require('chalk');
var pkg = require('./package.json');

program.version(pkg.version)
  .usage('[options] <url>')
  .option('-l, --log', 'log errors in a text file')
  .option('-m, --max <n>', 'max URLs to crawl')
  .option('-q, --query', 'consider query string')
  .option('-v, --verbose', 'show error details')
  .parse(process.argv);

if (!program.args[0]) {
  program.help();
  process.exit();
}

require('find-java-home')(function (err, java_home) {
  var validator;
  if (!err) {
    validator = new W3CValidator(program.args[0], java_home);
    validator.start();
  } else {
    console.error(chalk.red.bold('Error: Java is required to use w3c-validator!'));
    process.exit(1);
  }
});
