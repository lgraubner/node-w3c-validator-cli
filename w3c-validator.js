#!/usr/bin/env node

var path = require("path");
var Crawler = require("simplecrawler");
var program = require("commander");
var chalk = require("chalk");
var exec = require("child_process").exec;
var _ = require("lodash");
var Spinner = require("cli-spinner").Spinner;
var findJavaHome = require("find-java-home");
var URL = require("url-parse");
var pkg = require("./package.json");

program.version(pkg.version)
        .usage("[options] <url>")
        .option("-q, --query", "consider query string")
        .option("-n, --nofollow", "validate single URL")
        .parse(process.argv);

if (!program.args[0]) {
    program.help();
}

require("find-java-home")(function(err, java_home) {
    if (err) {
        console.error(chalk.red.bold("Error: Java is required to use w3c-validator!"));
        process.exit(1);
    } else {

        var chunk = [];
        var count = 0;
        var valid = 0;
        var invalid = 0;

        var url = new URL(program.args[0]);
        var c = new Crawler(url.host);

        c.initialPath = url.pathname || "/";
        c.initialPort = 80;
        c.initialProtocol = url.protocol.replace(":", "") | "http";
        c.userAgent = "Node/W3C-Validator";

        if (!program.query) {
            c.stripQuerystring = true;
        }

        if (program.nofollow) {
            c.maxDepth = 1;
        }

        var exclude = ["swf", "pdf", "ps", "dwf", "kml", "kmz", "gpx", "hwp", "ppt", "pptx", "doc", "docx", "odp", "ods", "odt", "rtf", "wri", "svg", "tex", "txt", "text", "wml", "wap", "xml", "gif", "jpg", "jpeg", "png", "ico", "bmp", "ogg", "webp", "mp4", "webm", "mp3", "ttf", "woff", "json", "rss", "atom", "gz", "zip", "rar", "7z", "css", "js", "gzip", "exe"];

        var exts = exclude.join("|");
        var regex = new RegExp("\.(" + exts + ")", "i");

        c.addFetchCondition(function(parsedURL) {
            return !parsedURL.path.match(regex);
        });

        var spinner = new Spinner("Fetching links... %s");

        c.on("crawlstart", function() {
            spinner.start();
        });

        c.on("fetchcomplete", function(item) {
            chunk.push(item.url);
        });

        c.on("complete", function() {
            spinner.stop(true);
            count = chunk.length;

            if (!_.isEmpty(chunk)) {
                checkURL(chunk);
            } else {
                console.error(chalk.red.bold("Error: Site '" + program.args[0] + "' could not be found."));
                process.exit(1);
            }
        });

        var checkURL = function(chunk) {
            var url = chunk.pop();

            var spinner = new Spinner("  " + url + " %s");
            spinner.start();

            var vnuPath = path.join(__dirname, "vnu").replace(/\s/g, "\\ ");
            var child = exec("java -jar " + vnuPath + "/vnu.jar --format json " + url, { env: { JAVA_HOME: java_home }}, function(error, stdout, stderr) {
                var result = JSON.parse(stderr);

                spinner.stop(true);

                if (_.isEmpty(result.messages)) {
                    valid++;
                    console.log(chalk.bold.green("✓"), chalk.gray(url));
                } else {
                    invalid++;
                    console.log(chalk.red.bold("×", url));
                }

                if (!_.isEmpty(chunk)) {
                    checkURL(chunk);
                } else {
                    console.log(chalk.white("Checked %s sites. %s valid, %s invalid."), count, valid, invalid);
                    process.exit();
                }
            });
        };

        c.start();

    }
});
