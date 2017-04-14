'use strict';

const Hapi = require('hapi');
let Mongoose = require('mongoose');
const config = require('./config');
const Routes = require('./routes/recipe');

Mongoose.Promise = global.Promise;
Mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);

const server = new Hapi.Server();
server.connection({
    host: config.server.host,
    port: config.server.port
});
server.route(Routes.endpoints);
server.start(() => {
    console.log('Server started ', server.info.uri);
});
