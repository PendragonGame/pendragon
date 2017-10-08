const path = require('path');
const Map = require('../util/Map');
const uuid = require('../util/uuid');
const Entity = require('../entity/Entity');

/**
 * 
 * 
 */
function Ripple() {
    console.log(path.join(__dirname, 'worker.js'));
    this.worker = new Worker(path.join(__dirname, 'worker.js'));
    this.worker.onmessage = this.triggerConversation;
    const self = this;
    (function updateWorker() {
        self.worker.postMessage({
            tree: Map.toJSON(),
        });
        setTimeout(updateWorker, 1500);
    })();
};

Ripple.prototype.triggerConversation = function(e) {
    let source = Map.getByID(e.data.source);
    let targets = e.data.targets;
    let info = source.information[game.rnd.integerInRange(0,
                                            source.information.length - 1)];
    for (let i = 0; i < targets.length; i++) {
        Map.getByID(targets[i].id).learnInfo(info);
        /**
         * @todo(anand): Trigger convo box;
         */
    }
};

Ripple.prototype.getNearbyRep = function(point) {};

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
        action: 'action',
    };
    witness.learnInfo(rumor);
    return rumor;
};

module.exports = Ripple;
