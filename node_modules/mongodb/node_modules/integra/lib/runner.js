var Formatter = require('./formatter').Formatter
  , TestSuite = require('./test_suite').TestSuite
  , EventEmitter = require('events').EventEmitter
  , inherits = require('util').inherits;

var Runner = function() {
  EventEmitter.call(this);

  this.configuration = null;
  this.formatter = new Formatter();
  this.configurations = [];
  this.tests = {};
  this.execute_serially = false;
  this.number_of_contexts = 1;
  this.scheduler_hints = null;
  this.filter_function = null;
  this.after_configuration_start = null;

  // Set up all the functions
  this.exeuteSerially = function(execute_serially) {
    this.execute_serially = execute_serially;
    return this;
  }

  this.parallelContexts = function(number_of_contexts) {
    this.number_of_contexts = number_of_contexts;
    return this;
  }

  this.schedulerHints = function(scheduler_hints) {
    this.scheduler_hints = scheduler_hints;
    return this;
  }

  this.afterConfigurationStart = function(after_configuration_start) {
    this.after_configuration_start = after_configuration_start;
    return this;
  }

  this.filter = function(filter_function) {
    this.filter_function = filter_function;
    return this;
  }

  this.add = function(suite_name, test_files) {
    // Set up a test suite
    this.tests[suite_name] = new TestSuite(this, this.formatter, this.configuration, suite_name, test_files, {
        testStatisticsCallback: this.testStatisticsCallback
      , schedulerHints: this.scheduler_hints
    });
    // Return for chaining
    return this;
  }

  /*
   * Run the actual tests against a specifc configuration and with any
   * additional options
   */
  this.run = function(config_name, options) {  
    var self = this;
    var keys = Object.keys(this.tests);
    options = options ? options : {}

    // No configuration passed in
    if(config_name == null) 
      throw new Error("The name of a configuration to run against must be provided");

    // If single test run single context
    if(options.test) this.number_of_contexts = 1;

    // Options
    var test_suite_options = {
        // Number of contexts we wish to run in parallel
        number_of_contexts: this.number_of_contexts
        // Execute all the files in a serial matter 
      , execute_serially: this.execute_serially
    }

    // Merge in any options
    for(var name in options) test_suite_options[name] = options[name];

    // Execute the test suites
    process_testsuites_serially(self, config_name, this.tests, keys, test_suite_options, function(err) {
      // Get keys again
      keys = Object.keys(self.tests);
      
      // All configurations we need to stop
      var configurations = [];
      
      // Execute the stop part of the configuration
      for(var i = 0; i < keys.length; i++) {
        var test_suite = self.tests[keys[i]];
        configurations = configurations.concat(test_suite.configuration.all(config_name));
      }

      var number_of_configs = configurations.length;
      for(var i = 0; i < configurations.length; i++) {
        configurations[i].stop(function() {
          number_of_configs = number_of_configs - 1;

          if(number_of_configs == 0) {
            // Emit end event
            self.emit("end");
          }
        })
      }
    });
  }  
}

// Inherit from Event Emitter
inherits(Runner, EventEmitter);

// At what level to parallelize
Runner.TEST = 'test';
Runner.FILE = 'file';

// Set the available configurations for runners
Runner.configurations = function(configuration) {  
  var runner = new Runner();
  runner.configuration = configuration;
  return runner;
}

// Process the test suites in a serial manner
var process_testsuites_serially = function(self, config_name, tests, test_names, options, callback) {
  var test_suite_name = test_names.pop();
  var test_suite = tests[test_suite_name];

  // Emit the start of a test suite
  self.emit("testsuite_start", test_suite);
  
  // Execute the test suite in parallel
  test_suite.execute_parallel(config_name, options, function(err, results) {
    self.emit("testsuite_end", test_suite);

    if(test_names.length > 0) {
      process_testsuites_serially(self, config_name, tests, test_names, options, callback);
    } else {
      callback(null);
    }
  });
}

exports.Runner = Runner;