'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

const SERVER_ERROR = 'Internal Server error';

exports.register = (server, options, next) => {
    const db = server.app.db;

    server.route({
        method: 'GET',
        path: '/recipes',
        handler: (request, reply) => {
            db.recipes.find((err, recipes) => {
                if (err) return reply(Boom.wrap(err, SERVER_ERROR));
                recipes.forEach(_ => delete _._id);
                reply(recipes);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/recipes/{id}',
        handler: (request, reply) => {
            const id = request.params.id;
            db.recipes.findOne({ id: id, latest: true }, (err, recipe) => {
                if (err) return reply(Boom.wrap(err, SERVER_ERROR));
                if (!recipe) return reply(Boom.notFound());
                delete recipe._id;
                reply(recipe);
            });
        }
    });

    server.route({
        method: 'GET',
        path: '/recipes/{id}/{date}',
        handler: (request, reply) => {
            const { id, date } = request.params;
            db.recipes.findOne({ id: id, date: +date }, (err, recipe) => {
                if (err) return reply(Boom.wrap(err, SERVER_ERROR));
                if (!recipe) return reply(Boom.notFound());
                delete recipe._id;
                reply(recipe);
            });
        }
    });

    server.route({
        method: 'POST',
        path: '/recipes',
        handler: (request, reply) => {
            let recipe = request.payload;
            recipe.id = uuid.v1();
            recipe.date = new Date().getTime();
            recipe.latest = true;

            db.recipes.save(recipe, (err, recipe) => {
                if (err) reply(Boom.wrap(err, SERVER_ERROR));
                delete recipe._id;
                reply(recipe);
            });
        },
        config: {
            validate: {
                payload: {
                    name: Joi.string().min(3).max(50).required(),
                    description: Joi.string().min(3).max(2 ** 12).required()
                }
            }
        }
    });

    server.route({
        method: 'PATCH',
        path: '/recipes/{id}',
        handler: (request, reply) => {
            const id = request.params.id;
            let recipe = request.payload;
            recipe.latest = true;
            recipe.date = new Date().getTime();
            recipe.id = id;

            //get previous version
            db.recipes.findOne({ id: id }, (err, previous) => {
                if (err) return reply(Boom.wrap(err, SERVER_ERROR));
                if (!previous) return reply(Boom.notFound());

                //resave previous
                previous.latest = false;
                db.recipes.update({ id: id }, { $set: previous }, err => {
                    if (err) return reply(Boom.wrap(err, SERVER_ERROR));

                    //save new version
                    db.recipes.save(recipe, (err, recipe) => {
                        if (err) return reply(Boom.wrap(err, SERVER_ERROR));
                        reply().code(204);
                    });
                });
            });
        },
        config: {
            validate: {
                payload: Joi.object({
                    name: Joi.string().min(3).max(50).required(),
                    description: Joi.string().min(3).max(2 ** 12).required()
                })
                    .required()
                    .min(1)
            }
        }
    });

    server.route({
        method: 'DELETE',
        path: '/recipes/{id}',
        handler: (request, reply) => {
            const id = request.params.id;
            db.recipes.remove({ id: id }, (err, result) => {
                if (err) return reply(Boom.wrap(err, SERVER_ERROR));
                if (!result.n) return reply(Boom.notFound());
                reply().code(204);
            });
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'routes-recipes'
};
