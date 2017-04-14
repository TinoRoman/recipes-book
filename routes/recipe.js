let Controller = require('../controllers/recipe');

exports.endpoints = [
    { method: 'GET', path: '/recipes', config: Controller.getAll },
    { method: 'GET', path: '/recipes/{id}', config: Controller.getById },
    { method: 'GET', path: '/recipes/{id}/{date}', config: Controller.getSpecific },
    { method: 'POST', path: '/recipes', config: Controller.create },
    { method: 'PATCH', path: '/recipes/{id}', config: Controller.update },
    { method: 'DELETE', path: '/recipes/{id}', config: Controller.remove }
];
