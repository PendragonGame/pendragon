/**
 * @module Ripple
 */
const path = require('path');

const Sampling = require('discrete-sampling');

const Map = require('../util/Map');
const uuid = require('../util/uuid');
const Entity = require('../entity/Entity');

/* ############### Algorithm parameters ############### */
/**
 * The radius withing which to find people
 */
const gossipRadius = 256; // pixels
/**
 * Number of targets to gossip to
 */
const numTargets = 1;
/**
 * Number of nearest neighbors
 */
const kNN = 3;

/**
 * 
 * 
 */
function Ripple() {
    // console.log(path.join(__dirname, 'worker.js'));
    // this.worker = new Worker(path.join(__dirname, 'worker.js'));
    // this.worker.onmessage = this.triggerConversation;
    // this.timer = null;
    // const self = this;
    // (function updateWorker() {
    //     self.worker.postMessage({
    //         tree: Map.toJSON(),
    //     });
    //     self.timer = setTimeout(updateWorker, 1500);
    // })();
};

Ripple.prototype.triggerGossip = function(source) {
    let nearest = Map.nearest(source, kNN + 1, gossipRadius);
    let gossipMongers = nearest
                    // .filter((p) => p[1] === 0)
                    .map((e) => {
                        return e[0];
                    });
    let n = Math.min(numTargets, gossipMongers.length);
    gossipMongers = Sampling.sample_from_array(gossipMongers, n, false);
    let info = source.information[game.rnd.integerInRange(0,
        source.information.length - 1)];
    // if (info) {
    //     console.log('pako');
    // }
    for (let i = 0; i < gossipMongers.length && info; i++) {
        Map.getByID(gossipMongers[i].id).learnInfo(info);
    }
};

/**
 * 
 * 
 * @param {any} e 
 * @deprecated
 */
Ripple.prototype.triggerConversation = function(e) {

    let source = Map.getByID(e.data.source);
    let targets = e.data.targets;
    let info = source.information[game.rnd.integerInRange(0,
                                            source.information.length - 1)];
    for (let i = 0; i < targets.length && info; i++) {
        Map.getByID(targets[i][0].id).learnInfo(info);
        /**
         * @todo(anand): Trigger convo box;
         */
    }
};

/**
 * Get the average reputation of the k nearest entities.
 * 
 * @param {Entity} point
 * @param {number} k
 */
Ripple.prototype.getNearbyRep = function(point, k) {
};

/**
 * 
 * @param {any} witness - The `Entity` that witnessed the action
 * @param {any} target - The `Entity` that was the receiver of the action
 * @param {any} perp - The perpetrator of the action
 * @param {any} action - the actual action
 * @return {Object}
 * 
 * Possible values of `action` are:
 * - `killed`
 */
Ripple.prototype.createRumor = function(
    witness,
    target,
    perp,
    action) {
    if (!(perp instanceof Entity)
        || !(target instanceof Entity)
        || !(perp instanceof Entity)) {
        throw new TypeError('This function requires an Entity');
    }

    let p;
    if (perp.type === 'player') {
        p = 'player';
    } else {
        p = perp.id;
    }

    let rumor = {
        id: uuid(),
        targetType: target.type,
        perp: p,
        action: action,
    };
    witness.learnInfo(rumor);
    return rumor;
};

Ripple.prototype.kill = function() {
    clearInterval(this.timer);
}

module.exports = Ripple;
