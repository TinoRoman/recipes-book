'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const Recipe = require('../models/recipe').Recipe;

const SERVER_ERROR = 'Internal Server error';

const cleanReply = o => {
    delete o._doc._id;
    delete o._doc.__v;
    return o._doc;
};

exports.getAll = {
    handler: async (request, reply) => {
        try {
            let recipes = await Recipe.find();
            recipes.forEach(_ => cleanReply(_));
            reply(recipes);
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};

exports.getById = {
    handler: async (request, reply) => {
        const id = request.params.id;
        try {
            let recipe = await Recipe.findOne({ id: id, latest: true });
            if (!recipe) return reply(Boom.notFound());
            reply(cleanReply(recipe));
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};

exports.getSpecific = {
    handler: async (request, reply) => {
        const { id, date } = request.params;
        try {
            let recipe = await Recipe.findOne({ id: id, date: +date });
            if (!recipe) return reply(Boom.notFound());
            reply(cleanReply(recipe));
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};

exports.create = {
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
    handler: async (request, reply) => {
        let recipe = new Recipe(request.payload);
        recipe.id = uuid.v1();
        recipe.date = new Date().getTime();
        recipe.latest = true;

        try {
            let _recipe = await recipe.save();
            reply(cleanReply(_recipe));
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};

exports.update = {
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
    handler: async (request, reply) => {
        const id = request.params.id;
        let recipe = new Recipe(request.payload);
        recipe.latest = true;
        recipe.date = new Date().getTime();
        recipe.id = id;

        try {
            //get previous version
            let previous = await Recipe.findOne({ id: id });
            if (!previous) return reply(Boom.notFound());

            //resave previous
            previous.latest = false;
            await Recipe.update({ id: id }, { $set: previous });

            //save new version
            await recipe.save();
            reply().code(204);
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};

exports.remove = {
    handler: async (request, reply) => {
        const id = request.params.id;
        try {
            let commandResult = await Recipe.remove({ id: id });
            if (!commandResult.result.n) return reply(Boom.notFound());
            reply().code(204);
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};
