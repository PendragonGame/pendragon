/**
 * @module Map
 */
const kdTree = require('../lib/kdtreejs/kdTree');
const _ = require('lodash');
const Entity = require('../entity/Entity');
const Sampling = require('discrete-sampling');

let distanceFormula2 = function(e1, e2) {
    return Math.pow(e1.x - e2.x, 2) +
        Math.pow(e1.y - e2.y, 2);
};

let tree = null;
let list = {};

/**
 * @namespace Map
 */
let Map = {};


/**
 * Create a new map
 * 
 * @param {Array} entities 
 * @param {any} dimensions
 */
Map.create = function(entities, dimensions) {
    if (entities.length === 0 || !(entities[0] instanceof Entity)) {
        console.error('Invalid argument for entity or empty list of entities');
        return;
    }
    let dim = dimensions;
    if (dim === undefined) dim = ['x', 'y'];
    let points = _.map(entities, function(entity, idx) {
        list[entity.id] = entity;
        return {
            x: entity.trueXY().x,
            y: entity.trueXY().y,
            id: entity.id,
        };
    });
    tree = new kdTree.kdTree(points, distanceFormula2, dim);
};

/**
 * 
 * 
 * @param {Object} entity  
 */
Map.insert = function(entity) {
    if (tree === null || list.length === 0) {
        this.create([entity]);
    } else if (list.hasOwnProperty(entity.id)) {
        // Do nothing
    } else {
        tree.insert({
            x: entity.trueXY().x,
            y: entity.trueXY().y,
            id: entity.id,
        });
        list[entity.id] = entity;
    }
};

/**
 * 
 * 
 * @param {Object} entity - Entity
 * @param {number} count - Number of neighbors
 * @param {any} maxDistance - Range to check within
 * @return {Array.Neighbors}
 */
Map.nearest = function(entity, count, maxDistance) {
    if (tree === null) {
        return [];
    }
    if (!(entity instanceof Entity)) {
        throw new TypeError('Invalid array');
    }
    point = {
        x: entity.trueXY().x,
        y: entity.trueXY().y,
        id: entity.id,
    };
    maxDistance = Math.pow(maxDistance, 2);
    if (count === undefined) {
        count = 1;
    }
    return tree.nearest(point, count + 1, maxDistance)
        .map((point) => {
            return [
                this.getByID(point[0].id),
                Math.sqrt(point[1]),
            ];
        })
        .filter((e) => (entity.id === point.id));
};

/**
 * Get n discrete samples from array
 * 
 * @param {number} [n=] - Number of samples to pick. Default = 1
 * @return {any[]}
 */
Map.discreteSamples = function(n = 1) {
    return Sampling.sample_from_array(Object.values(list), n, false);
};

Map.sampleRandom = function(max) {
    return Sampling.sample_from_array(Object.values(list),
                Math.floor(Math.random() * max), false);
};

/**
 * Reset the map
 *
 * 
 */
Map.reset = function() {
    tree = null;
    list = {};
}

/**
 * Get Entity with ID
 * 
 * @param {string} id - ID of `Entity`
 * @return {Entity}
 */
Map.getByID = function(id) {
    return list[id];
};

Map.printMap = function() {
    return tree.toJSON();
};

Map.toJSON = function() {
    return tree.toJSON();
};

module.exports = Map;
