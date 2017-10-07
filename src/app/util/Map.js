const kdTree = require('../lib/kdtreejs/kdTree');
const _ = require('lodash');
const Play = require('../states/play');

let distanceFormula2 = function(e1, e2) {
    return Math.pow(e1.x - e2.y, 2)
            + Math.pow(e1.x - e2.y, 2);
};

let tree = null;
let list = {};

let Map = {};

/**
 * Create a new map
 * 
 * @param {Array} entities 
 * @param {any} dimensions
 */
Map.create = function(entities, dimensions) {
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
 * @param {any} entity  
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
 * @param {Object} point - Point or Entity
 * @param {number} count - Number of neighbors
 * @param {any} maxDistance - Range to check within
 * @return {Array.Neighbors}
 */
Map.nearest = function(point, count, maxDistance) {
    maxDistance = Math.pow(maxDistance, 2);
    if (count === undefined) {
        count = 1;
    }
    return _.map(tree.nearest(point, count, maxDistance),
                function(point) {
                    return {
                        x: point[0].x,
                        y: point[0].y,
                        dist: Math.sqrt(point[1]),
                    };
                });
};

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

module.exports = Map;

/**
 * @typedef {Entity}
 */

/**
 * @typedef {Object} Neighbors
 * @property {Entity} entity - The `Entity`
 * @property {number} distance - The distance to the `Entity`
 */

