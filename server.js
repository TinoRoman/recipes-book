'use strict';

const Hapi = require('hapi');
const mongojs = require('mongojs');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
    port: 3000
});

//Connect to db
server.app.db = mongojs('recipes-mongo', ['recipes']);

//Load plugins and start server
server.register([require('./routes/recipes')], err => {
    if (err) console.log(`Error loading plugins: ${err}`);

    // Start the server
    server.start(() => {
        console.log('Server running at:', server.info.uri);
    });
});
