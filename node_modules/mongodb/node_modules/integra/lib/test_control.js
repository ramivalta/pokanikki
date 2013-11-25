var assert = require('./assert/assert');

var TestControl = function(configuration, file_name, name) {
  this.configuration = configuration
  this.config_name = configuration.name;
  this.file_name = file_name;
  this.name = name;  
  // Add the basic stats  
  this.number_of_assertions = 0;
  this.number_of_failed_assertions = 0;
  this.number_of_successful_assertions = 0;
  this.start_time = null;
  this.end_time = null;
  // Caught errors
  this.assertions = [];
}

TestControl.prototype.ok = function(value, description) {
  this.number_of_assertions++;

  try {
    assert.ok(value, description);    
    this.number_of_successful_assertions++;
  } catch(err) {
    this.assertions.push(err);
    this.number_of_failed_assertions++;
    throw err;
  }
}

TestControl.prototype.equal = function(expected, value, description) {
  this.number_of_assertions++;

  try {
    assert.equal(value, expected, description);
    this.number_of_successful_assertions++;
  } catch(err) {
    this.assertions.push(err);
    this.number_of_failed_assertions++;
    throw err;
  }
}

TestControl.prototype.notEqual = function(expected, value, description) {
  this.number_of_assertions++;

  try {
    assert.notEqual(value, expected, description);
    this.number_of_successful_assertions++;
  } catch(err) {
    this.assertions.push(err);
    this.number_of_failed_assertions++;
    throw err;
  }
}

TestControl.prototype.deepEqual = function(expected, value, description) {
  this.number_of_assertions++;

  try {
    assert.deepEqual(value, expected, description);
    this.number_of_successful_assertions++;
  } catch(err) {
    this.assertions.push(err);
    this.number_of_failed_assertions++;
    throw err;
  }
}

TestControl.prototype.throws = function(block, error, message) {
  this.number_of_assertions++;

  try {
    assert.throws(block, error, message);
    this.number_of_successful_assertions++;
  } catch(err) {
    this.assertions.push(err);
    this.number_of_failed_assertions++;
    throw err;
  }
}

TestControl.prototype.strictEqual = function(expected, value, description) {
  this.number_of_assertions++;

  try {
    assert.strictEqual(value, expected, description);
    this.number_of_successful_assertions++;
  } catch(err) {
    this.assertions.push(err);
    this.number_of_failed_assertions++;
    throw err;
  }
}

exports.TestControl = TestControl;