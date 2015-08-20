# Node W3C Validator
Crawls a given site and checks for W3C validity.

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

    -h, --help     output usage information
    -V, --version  output the version number
    -q, --query    consider query string
```

**Important**: Executing the w3c-validator with sites using HTML `base`-tag along with links *without* leading slashes will probably not work.
