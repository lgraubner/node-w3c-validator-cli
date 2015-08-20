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
        _stderr.should.not.be.empty;
    });

    it("should exit with error code '1'", function() {
        _error.code.should.equal(1);
    });
});

describe("$ w3c-validator abc.xyz", function() {
    this.timeout(20000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js abc.xyz", function(error, stdout, stderr) {
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

describe("$ w3c-validator http://abc.xyz", function() {
    this.timeout(10000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js http://abc.xyz", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should remove protocol and not throw any errors", function() {
        _stderr.should.be.empty;
        should.equal(_error, null);
    });
});

describe("$ w3c-validator https://abc.xyz", function() {
    this.timeout(10000);

    var _error;
    var _stdout;
    var _stderr;

    before(function(done) {
        var cmd = exec("node w3c-validator.js https://abc.xyz", function(error, stdout, stderr) {
            _error = error;
            _stdout = stdout;
            _stderr = stderr;
            done();
        });
    });

    it("should remove protocol and not throw any errors", function() {
        _stderr.should.be.empty;
        should.equal(_error, null);
    });
});
