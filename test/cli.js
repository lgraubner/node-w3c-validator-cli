var should = require("chai").should();
var exec = require("child_process").exec;

describe("$ w3c-validator invalid", function() {
    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js illegal", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should fail because of invalid url", function() {
        _stderr.should.contain("could not be found");
    });

    it("should exit with error code '1'", function() {
        _error.code.should.equal(1);
    });
});

describe("$ w3c-validator -n www.google.de", function() {
    this.timeout(10000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js -n https://www.google.de", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should not throw any errors", function() {
        should.equal(_error, null);
    });

    it("should return data", function() {
        _stdout.should.not.be.empty;
    });
});

describe("$ w3c-validator -n https://www.google.de", function() {
    this.timeout(10000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js -n https://www.google.de", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should remove protocol and not throw any errors", function() {
        should.equal(_error, null);
    });
});

describe("$ w3c-validator -n https://www.google.de/intl/de/about/", function() {
    this.timeout(10000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js -n https://www.google.de/intl/de/about/", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should work with subsite as starting point", function() {
        should.equal(_error, null);
    });
});
