#!/usr/bin/env node

var Crawler = require("simplecrawler"),
    fs = require("fs"),
    program = require("commander"),
    chalk = require("chalk"),
    request = require("request"),
    pkg = require("./package.json");

program.version(pkg.version)
        .usage("<url>")
        .parse(process.argv);

if (!program.args[0]) {
    program.help();
}

var chunk = [],
    valid = 0,
    invalid = 0,
    c = new Crawler(program.args[0]);

c.initialPath = "/";
c.initialPort = 80;
c.initialProtocol = "http";
c.userAgent = "Node/W3C-Validator";

c.on("crawlstart", function() {
    console.log(chalk.gray("Fetching links..."));
});

c.on("fetchcomplete", function(item) {
    chunk.push(item.url);
});

c.on("complete", function() {
    console.log(chalk.white("Done! Validating..."));

    checkURL(chunk);
});

var checkURL = function(chunk) {
    var url = chunk.pop();

    request.head("http://validator.w3.org/check?uri=" + encodeURIComponent(url)).on("response", function(response) {
        var status = response.caseless.dict["x-w3c-validator-status"];

        if (status == "Valid") {
            valid++;
            console.log(chalk.bold.green("✓"), chalk.gray(url));
        } else {
            invalid++;
            console.log(chalk.red("×", url));
        }

        if (chunk.length > 0) {
            return checkURL(chunk);
        } else {
            return console.log(chalk.white("Checked %s sites. %s valid, %s invalid."), c.queue.complete(), valid, invalid);
        }
    });
};

var image = c.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.(gif|jpg|jpeg|png|ico|bmp)/i);
});

var media = c.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.(ogg|webp|mp4|webm|mp3)/i);
});

var font = c.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.(ttf|woff)$/i);
});

var data = c.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.(json|rss|atom|gz|zip|rar|7z)/i);
});

var misc = c.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.(css|js|gzip|exe)/i);
});

var google = c.addFetchCondition(function(parsedURL) {
    return !parsedURL.path.match(/\.(swf|pdf|ps|dwf|kml|kmz|gpx|hwp|ppt|pptx|doc|docx|odp|ods|odt|rtf|wri|svg|tex|txt|text|wml|wap|xml)/i);
});

c.start();
