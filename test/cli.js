var should = require("chai").should();
var exec = require("child_process").exec;

describe("$ w3c-validator invalid", function() {
    it("should fail because of invalid url");
    it("should exit with error code '1'");
});

describe("$ w3c-validator 127.0.0.1", function() {
    it("should not throw any errors");
    it("should return success message");
});

describe("$ w3c-validator --log 127.0.0.1", function() {
    it("should create a text file");
});

describe("$ w3c-validator --query 127.0.0.1", function() {
    it("should include links with query parameters");
});

describe("$ w3c-validator --verbose 127.0.0.1", function() {
    it("should output additional error information");
});
