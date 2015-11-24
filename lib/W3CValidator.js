#!/usr/bin/env node

"use strict";

var path = require("path");
var Crawler = require("simplecrawler");
var program = require("commander");
var chalk = require("chalk");
var exec = require("child_process").exec;
var _ = require("lodash");
var Spinner = require("cli-spinner").Spinner;
var findJavaHome = require("find-java-home");
var URL = require("url-parse");
var fs = require("fs");
var pkg = require("../package.json");

program.version(pkg.version)
        .usage("[options] <url>")
        .option("-l, --log", "log errors in a text file")
        .option("-q, --query", "consider query string")
        .option("-v, --verbose", "show error details")
        .parse(process.argv);

if (!program.args[0]) {
    program.help();
}

var W3CValidator = function(url, java_home) {
    this.chunk = [];
    this.count = 0;
    this.valid = 0;
    this.invalid = 0;
    this.JAVA_HOME = java_home;

    this.uri = new URL(url);
    this.crawler = new Crawler(this.uri.host);

    this.logFileName = `w3c-check-${+new Date()}-${this.uri.host}`;

    this.crawler.initialPath = "/";

    var port = 80;
    if (process.env.NODE_ENV === "development") {
        port = 8000;
    }
    this.crawler.initialPort = port;


    if (!this.uri.protocol) {
        this.uri.set("protocol", "http:");
    }

    this.crawler.initialProtocol = this.uri.protocol.replace(":", "");
    this.crawler.userAgent = "Node/W3CValidator";

    if (!program.query) {
        this.crawler.stripQuerystring = true;
    }

    var exclude = ["swf", "pdf", "ps", "dwf", "kml", "kmz", "gpx", "hwp", "ppt", "pptx", "doc", "docx", "odp", "ods", "odt", "rtf", "wri", "svg", "tex", "txt", "text", "wml", "wap", "xml", "gif", "jpg", "jpeg", "png", "ico", "bmp", "ogg", "webp", "mp4", "webm", "mp3", "ttf", "woff", "json", "rss", "atom", "gz", "zip", "rar", "7z", "css", "js", "gzip", "exe"];

    var exts = exclude.join("|");
    var regex = new RegExp("\.(" + exts + ")", "i");

    this.crawler.addFetchCondition(function(parsedURL) {
        return !parsedURL.path.match(regex);
    });

    this.create();
};

W3CValidator.prototype.checkURL = function() {
    var url = this.chunk.pop();

    var spinner = new Spinner(`  ${url} %s`);
    spinner.start();

    var vnuPath = path.join(__dirname, "../vnu/vnu.jar").replace(/\s/g, "\\ ");
    var child = exec(`java -jar ${vnuPath} --format json ${url}`, { env: { JAVA_HOME: this.JAVA_HOME }}, (error, stdout, stderr) => {
        var errors = JSON.parse(stderr);

        spinner.stop(true);

        if (_.isEmpty(errors.messages)) {
            this.valid++;
            console.log(chalk.bold.green("✓"), chalk.gray(url));
        } else {
            this.invalid++;
            console.log(chalk.red.bold("×", url));

            if (program.verbose) {
                _.forEach(errors.messages, function(m) {
                    console.log(`    Line ${m.lastLine}:  ${m.message}`);
                });
            }

            if (program.log) {
                var data = "";
                data += `${url}\n`;
                _.forEach(errors.messages, function(m) {
                    data += `    Line ${m.lastLine}:  ${m.message}\n`;
                });
                fs.writeFile(path.join("./", `${this.logFileName}.txt`), data);
            }
        }

        if (!_.isEmpty(this.chunk)) {
            this.checkURL();
        } else {
            console.log(chalk.white("Checked %s sites. %s valid, %s invalid."), this.count, this.valid, this.invalid);
            process.exit();
        }
    });
};

W3CValidator.prototype.create = function() {
    var spinner = new Spinner("Fetching links... %s");

    this.crawler.on("crawlstart", () => {
        spinner.start();
    });

    this.crawler.on("fetchcomplete", (item) => {
        this.chunk.push(item.url);
    });

    this.crawler.on("complete", () => {
        spinner.stop(true);
        this.count = this.chunk.length;

        if (!_.isEmpty(this.chunk)) {
            this.checkURL();
        } else {
            console.error(chalk.red.bold("Error: Site '%s' could not be found."), program.args[0]);
            process.exit(1);
        }
    });

    this.crawler.start();
};

require("find-java-home")(function(err, java_home) {
    if (err) {
        console.error(chalk.red.bold("Error: Java is required to use w3c-validator!"));
        process.exit(1);
    } else {
        var validator = new W3CValidator(program.args[0], java_home);
    }
});
