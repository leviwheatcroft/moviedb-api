# MovieDB API

throttled hackable themoviedb api for node

Features:

 * smart queued / throttled requests
 * small, hackable module
 * optionally consume all api endpoints as methods

## How to install

    npm install moviedb-api

## How to use

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


## Consume or Specify Methods

Setting `consume: true` in your options will iterate through
[apib/endpoints.json](apib/endpoints.json) and attach each endpoint as an
instance method. If your use case needs to economise cpu time or ram then you're
better off using the `request` method and specifying the endpoint yourself.

See [apib/endpoints.json](apib/endpoints.json) for a full list of endpoints and
method names. You can place any url from there into a call to `request`.

## License

MIT
