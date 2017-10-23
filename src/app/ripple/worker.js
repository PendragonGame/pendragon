const kdTree = require('../lib/kdtreejs/kdTree');
const shuffle = require('knuth-shuffle').knuthShuffle;
const Sampling = require('discrete-sampling');
const _ = require('lodash');

/* ############### Algorithm parameters ############### */
/**
 * The radius withing which to find people
 */
const gossipRadius = 500; // pixels
/**
 * Number of targets to gossip to
 */
const numTargets = 3;
/**
 * Number of nearest neighbors
 */
const kNN = 10;

/* #################################################### */

let Tree = null;
let List = [];

let init = false;

let gossipLoop = function() {
    /**
     * @todo(anand): is this the best idea?
     */
        for (let i = 0; i < List.length; i++) {
            let point = List[i];
            let nearest = Tree.nearest(point, kNN + 1, gossipRadius);
            let gossipMongers = _.chain(nearest)
                            .filter((p) => p[1] === 0)
                            .map((e) => e[0])
                            .value();
            let n = Math.min(numTargets, gossipMongers.length);
            gossipMongers = Sampling.sample_from_array(gossipMongers, n, false);
            postMessage({
                targets: gossipMongers,
                source: point.id,
            });
        }
        shuffle(List);
};

let distance2 = function(a, b) {
    return Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
};

let toList = function(t) {
    /**
     * Return a list in the same order as BFS.
     */
    let q = [];
    let ret = [];
    q.push(t.root);

    while (q.length > 0) {
        let v = q.shift();
        ret.push(v.obj);
        if (v.left) q.push(v.left);
        if (v.right) q.push(v.right);
    }
    return ret;
};


onmessage = function(obj) {
    /**
     * @todo(anand): Handle other actions.
     */
    // console.log(obj);
    Tree = null;
    Tree = new kdTree.kdTree(obj.data.tree, distance2, ['x', 'y']);
    List = toList(Tree);
    gossipLoop();
};
