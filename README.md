# Node W3C Validator

[![Travis](https://img.shields.io/travis/lgraubner/node-w3c-validator-cli.svg)](https://travis-ci.org/lgraubner/node-w3c-validator-cli) [![David](https://img.shields.io/david/lgraubner/node-w3c-validator-cli.svg)](https://david-dm.org/lgraubner/node-w3c-validator-cli) [![npm](https://img.shields.io/npm/v/w3c-validator-cli.svg)](https://www.npmjs.com/package/w3c-validator-cli) [![David Dev](https://img.shields.io/david/dev/lgraubner/node-w3c-validator-cli.svg)](https://david-dm.org/lgraubner/node-w3c-validator-cli#info=devDependencies)

> Crawls a given site and checks for W3C validity.

## Installation

```BASH
$ npm install -g w3c-validator-cli
```

## Usage
```BASH
$ w3c-validator [options] <url>
```

The crawler will fetch all sites matching folder URLs and certain file extensions.

**Tip**: Omit the URL protocol, the crawler will detect the right one.

**Important**: Executing the w3c-validator with sites using HTML `base`-tag along with links *without* leading slashes will probably not work.

## Options
```BASH
$ w3c-validator --help

  Usage: w3c-validator [options] <url>

  Options:

    -h, --help      output usage information
    -V, --version   output the version number
    -l, --log       log errors in a text file
    -q, --query     consider query string
    -v, --verbose   show error details
```


### log

Create a log file containing all invalid URL's including error details.

### query

Consider URLs with query strings like `http://www.example.com/?foo=bar` as indiviual sites and add them to the sitemap.

### verbose

Output additional error information in the console.
