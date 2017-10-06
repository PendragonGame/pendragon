const kdTree = require('../lib/kdtreejs/kdTree');
const _ = require('lodash');

let distanceFormula = function(a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
};

let tree = null;

let Map = {};

Map.create = function(points, dimensions) {

    let dim = dimensions;
    if (dim === undefined) dim = ['x', 'y'];

    tree = new kdTree.kdTree(points, distanceFormula, dim);
    return tree;
};

Map.remove = function(point) {
    if (tree === null) return;
    tree.remove(point);
}

Map.insert = function(point) {
    if (tree === null) this.create([point]);
    else tree.insert(point);
};

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

Map.printMap = function() {
    return tree.toJSON();
};

module.exports = Map;

