var Api = require('./index')

// set environment in bash: `export TMDB_API_KEY=yourKeyHere`
var apiKey = process.env.TMDB_API_KEY

// Promise
var api
api = new Api({
  consume: false,
  apiKey: apiKey
})
api.request('/movie/{id}', 'GET', {id: 293660})
.then(function(response) {
  console.log(response)
})

// Consume
var api
api = new Api({
  consume: true,
  apiKey: apiKey
})
api.movie({id: 205584})
.then(function(response) {
  console.log(response)
})

// Consume & Callback
var api
api = new Api({
  consume: true,
  apiKey: apiKey
})
api.movie({id: '76341'}, function(err, response) {
  console.log(response)
})
