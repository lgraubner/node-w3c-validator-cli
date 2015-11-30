var should = require("chai").should();
var exec = require("child_process").exec;
var del = require("del");

require("./lib/testserver.js");

describe("$ w3c-validator invalid", function() {
    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node ./lib/W3CValidator.js illegal", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should fail because of invalid url", function() {
        _stderr.should.not.be.empty;
    });

    it("should exit with error code '1'", function() {
        _error.code.should.equal(1);
    });
});

describe("$ w3c-validator 127.0.0.1", function() {
    this.timeout(10000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node ./lib/W3CValidator.js 127.0.0.1", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should not throw any errors", function() {
        _stderr.should.be.empty;
        should.equal(_error, null);
    });

    it("should return success message", function() {
        _stdout.should.not.be.empty;
    });
});

describe("$ w3c-validator --log 127.0.0.1", function() {

    var _error;
    var _stdout;
    var _stderr;

    after(function() {
        del.sync(["./*.txt"])
    });

    before(function(done) {
        var cmd = exec("node ./lib/W3CValidator.js --log", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    // @TODO:
    it("should create a log file");

});
