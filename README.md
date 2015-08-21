# Node W3C Validator

[![Travis](https://img.shields.io/travis/lgraubner/node-w3c-validator.svg)](https://travis-ci.org/lgraubner/node-w3c-validator) [![David](https://img.shields.io/david/lgraubner/node-w3c-validator.svg)](https://david-dm.org/lgraubner/node-w3c-validator) [![npm](https://img.shields.io/npm/v/w3c-validator.svg)](https://www.npmjs.com/package/w3c-validator)

> Crawls a given site and checks for W3C validity.

## Installation

```BASH
$ npm install -g w3c-validator
```

## Usage
```BASH
$ w3c-validator [options] <url>
```

The crawler will fetch all sites matching folder URLs and certain file extensions.

**Tip**: Omit the URL protocol, the crawler will detect the right one.

### Options
```BASH
$ w3c-validator --help

  Usage: w3c-validator [options] <url>

  Options:

    -h, --help      output usage information
    -V, --version   output the version number
    -q, --query     consider query string
    -n, --nofollow  validate single URL
    -v, --verbose   show error details
```

**Important**: Executing the w3c-validator with sites using HTML `base`-tag along with links *without* leading slashes will probably not work.
