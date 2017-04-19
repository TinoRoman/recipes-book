import Boom from 'boom';
import uuid from 'node-uuid';
import Joi from 'joi';
import Recipe from '../models/recipe';

const SERVER_ERROR = 'Internal Server error';

const cleanReply = o => {
    delete o._doc._id;
    delete o._doc.__v;
    return o._doc;
};

export const getAll = {
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

export const getById = {
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

export const getSpecific = {
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

export const create = {
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

export const update = {
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
            let previous = await Recipe.findOne({ id: id, latest: true });
            if (!previous) return reply(Boom.notFound());

            //resave previous
            previous.latest = false;
            await Recipe.update({ id: previous.id, latest: true }, { $set: previous });

            //save new version
            let _recipe = await recipe.save();
            reply(cleanReply(_recipe));
        } catch (err) {
            return reply(Boom.wrap(err, SERVER_ERROR));
        }
    }
};

export const remove = {
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
