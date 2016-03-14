var _ = require('underscore')
var request = require('superagent')
var Throttle = require('superagent-throttle')
var Promise = require('bluebird')

var Api

var baseUrl = 'https://api.themoviedb.org/3'
var jsonPath = 'apib/endpoints.json'
var defaults = {
  consume: false,
  apiKey: 'specifyYourKey'
}

Api = function(options) {
  this.set(options)
  this.throttle = new Throttle({
    rate: 40,
    ratePer: 10000,
    concurrent: 20
  })
  if (this.consume) {
    this.injectMethods()
  }
  this.token = false
}
Api.prototype.set = function(options) {
  if (_.isString(options) && arguments[1]) {
    options = {}
    options[arguments[0]] = arguments[1]
  }
  _.extend(this, defaults, options)
}
Api.prototype.request = function(endpoint, type, data, callback) {
  var api = this
  return new Promise(function(resolve, reject) {
    if (api.token) {
      resolve()
      return
    }

    // send request for token
    request
    .get(baseUrl + '/authentication/token/new')
    .query({'api_key': api.apiKey})
    .set('Accept', 'application/json')
    .use(api.throttle.plugin)
    .end(function(err, response){
      if(response.ok) {
        api.token = response.body
        // unpause throttle
        api.throttle.set('active', true)
        resolve()
        return
      }
      reject(response.error)
    })
    // pause throttle until we get the token
    api.throttle.set('active', false)
  })
  .then(function() {
    return new Promise(function(resolve, reject) {

      var omitKeys = []
      var req
      endpoint = endpoint.replace(
        /\{(\w*)\}/g,
        function (match, group) {
          omitKeys.push(group)
          return data[group]
        }
      )
      data = _.omit(data, omitKeys)
      request
      // choose either get or post method
      [type.toLowerCase()](baseUrl + endpoint)
      // attach api key
      .query({'api_key': api.apiKey})
      // choose which method to use to store data / params
      [type.toLowerCase() == 'get' ? 'query' : 'send'](data)
      // handle throttle / throttling
      .use(api.throttle.plugin)
      // go, resolve promise on end
      .end(function(err, response) {
        if (callback) {
          callback(err, response.body)
        }
        if (err) {
          reject(err)
          return
        }
        resolve(response.body)
      })
    })
    .catch(function(err) {
      console.log(err)
    })


  })
}
Api.prototype.injectMethods = function() {
  var api = this
  var endpoints
  endpoints = require(jsonPath)
  _.each(endpoints, function(endpoint) {
    api[endpoint.method] = function(data, callback) {
      return api.request(endpoint.url, endpoint.type, data, callback)
    }
  })
}

module.exports = Api
