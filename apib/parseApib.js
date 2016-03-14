var https = require('https')
var _ = require('underscore')
var stream = require('stream')
var fs = require('fs')

var endpoints = []
var regexLine
var parser
var jsonPath = './endpoints.json'

regexLine = function(line) {
  var match
  var regex = /^(GET|POST) (\/.*)$/
  var endpoint = {};

  match = regex.exec(line)
  if (!match) {
    return
  }
  endpoint.type = match[1]
  endpoint.url = match[2]
  endpoint.method = match[2]
  // remove leading slash so first letter doesn't get capitalised (camelCase)
  endpoint.method = endpoint.method.replace(/^\//, '')
  // camelCase string and remove slashes
  endpoint.method = endpoint.method.replace(/\/(.)/g, function(match, group1) {
    return group1.toUpperCase()
  })
  // remove {values}
  endpoint.method = endpoint.method.replace(/\{\w*\}/g, '')
  endpoints.push(endpoint)
}

parser = new stream.Writable({
  write: function(chunk, encoding, next) {
    var lines
    chunk = chunk.toString('utf8')
    if (this.tail) {
      chunk = this.tail + chunk
    }
    lines = chunk.split('\n')
    this.tail = lines.pop()

    _.each(lines, function(line) {
      regexLine(line)
    })

    next()
  }

}).on('finish', function() {
  regexLine(this.tail)
  fs.writeSync(
    fs.openSync(jsonPath, 'w'),
    JSON.stringify(endpoints, null,
    '  ')
  )
});

(function() {
  https.get('https://jsapi.apiary.io/apis/themoviedb.apib', function(response) {
    response.pipe(parser)
  })
})()
