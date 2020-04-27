exports = module.exports = function(config) {
  var fileConfig = require("node-file-config")("node-connector-server");
  config = fileConfig.get(config);
  var expressApp = require("express");
  var app = {
    expressApp: require("express"),
    expressProxy: require('express-http-proxy'),
    wrapper: require("node-promise-wrapper"),
    start: function() {
      var express = new expressApp();
      express.use("/", [function(request, response, next) {
        var parts = request.url.split("/");
        if (parts.length > 3) {
          if (parts[1] === config.password) {
            next();
          } else {
            response.status(400).send("Bad request, invalid password.");
          }
        } else {
          response.status(400).send("Bad request, no request/password provided.");
        }
      },
      new app.expressProxy(function(request) {
        var parts = request.url.split("/");
        return parts[2];
      }, {
        proxyReqPathResolver: function (request) {
          var parts = request.url.split('/');
          parts.shift();
          parts.shift();
          parts.shift();
          console.log(parts.join("/"));
          return parts.join("/");
        },
        userResHeaderDecorator: function(headers, userReq, userRes, proxyReq, proxyRes) {
          return headers;
        },
        userResDecorator: async function(proxyRes, proxyResData, userReq, userRes) {
          return proxyResData;
        }
      })]);
      var listening = function() {
        console.log("Your app is listening on " + (typeof config.host === "undefined" || config.host === null ? "port " : "") + (typeof config.host !== "undefined" && config.host !== null ? config.host + ":" : "") + config.port);
      };
      if (typeof config.host !== "undefined" && config.host !== null) {
        express.listen(config.port, config.host, listening);
      } else {
        express.listen(config.port, listening);
      }
    }
  };
  app.start();
  return app;
};
new exports();