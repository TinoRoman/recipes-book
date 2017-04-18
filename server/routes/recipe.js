import * as Controller from '../controllers/recipe';

export let endpoints = [
    { method: 'GET', path: '/api/recipes', config: Controller.getAll },
    { method: 'GET', path: '/api/recipes/{id}', config: Controller.getById },
    { method: 'GET', path: '/api/recipes/{id}/{date}', config: Controller.getSpecific },
    { method: 'POST', path: '/api/recipes', config: Controller.create },
    { method: 'PATCH', path: '/api/recipes/{id}', config: Controller.update },
    { method: 'DELETE', path: '/api/recipes/{id}', config: Controller.remove }
];
