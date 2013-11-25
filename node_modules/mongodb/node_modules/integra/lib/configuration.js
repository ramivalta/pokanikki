var format = require('util').format;

var Configuration = function() {  
  this.configurations = {};
  this.configurators = {};
  this.children = {};

  this.get = function(name) {
    return this.configurations[name];
  }

  this.all = function(name) {
    var configurations = [this.get(name)];

    if(Array.isArray(this.children[name])) {
      configurations = configurations.concat(this.children[name]);
    }

    return configurations;
  }

  this.add = function(name, configurator) {
    var serverConfiguration = new ServerConfiguration(name);
    // Execute function
    configurator.apply(serverConfiguration)
    // Push the configuration
    this.configurations[name] = serverConfiguration;
    this.configurators[name] = configurator;
    // Return the config object
    return this;
  }

  this.create = function(name) {
    if(typeof this.configurators[name] != 'function') {
      throw new Error(format("no configuration found for the name %s", name));
    }

    // Get the configurator
    var configurator = this.configurators[name];
    // Create a new server configuration
    var serverConfiguration = new ServerConfiguration(name);
    // Apply the configuration to the object
    configurator.apply(serverConfiguration);
    // If no children set to empty array
    if(!Array.isArray(this.children[name])) {
      this.children[name] = [];
    }
    // Push the configuration to the list of children
    this.children[name].push(serverConfiguration);
    // Return the server configuration
    return serverConfiguration;
  }

  this.createAndStart = function(name, options, callback) {
    if(typeof options == 'function') {
      callback = options;
      options = {number_of_contexts: 1}
    }

    var total_number_of_configurations = options.number_of_contexts;
    var configurations = [];

    // We need to create some configurations and boot them up
    for(var i = 0; i < total_number_of_configurations; i++) {
      var start_config = function(_configuration) {
        _configuration.start(function(err) {    
          // Die fast
          if(err) throw err;

          // Execute function
          var executeFunction = function() {
            // Adjust the number of configurations
            total_number_of_configurations = total_number_of_configurations - 1;
            // Add to list of configurations
            configurations.push(_configuration);

            // If done we can start executing tests
            if(total_number_of_configurations == 0) {
              // Execute tests
              callback(null, configurations);
            }            
          }

          // If we have a filter
          if(typeof options.after_configuration_start == 'function') {
            options.after_configuration_start(_configuration, function() {
              executeFunction()
            });
          } else {
            executeFunction()
          }          
        });
      }

      // Start the configuration
      start_config(this.create(name));
    }
  }
}

Configuration.add = function(name, configurator) {  
  var configuration = new Configuration();
  var serverConfiguration = new ServerConfiguration(name);
  // Execute function
  configurator.apply(serverConfiguration)
  // Push the configuration
  configuration.configurations[name] = serverConfiguration;
  configuration.configurators[name] = configurator;
  // Return the config object
  return configuration;
}

var ServerConfiguration = function(name) {  
  this.name = name;
}

exports.Configuration = Configuration;