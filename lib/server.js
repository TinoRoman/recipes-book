import Hapi from 'hapi';
import Mongoose from 'mongoose';
import config from './config';
import { endpoints } from './routes/recipe';

Mongoose.Promise = global.Promise;
Mongoose.connect('mongodb://' + config.database.host + '/' + config.database.db);

const server = new Hapi.Server();
server.connection({
    host: config.server.host,
    port: config.server.port
});
server.route(endpoints);
server.start(() => {
    console.log('Server started ', server.info.uri);
});
