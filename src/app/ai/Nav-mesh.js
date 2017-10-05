
const PhaserNavmesh = require('phaser-navmesh');
/**
 * 
 */

/**
 * Create a navigation mesh
 * @param {tilemap} tilemap 
 *
 */
function NavMesh(tilemap) {
    this.navMeshPlugin = game.plugins.add(PhaserNavmesh);
    this.navMesh = this.navMeshPlugin.buildMeshFromTiled(tilemap,
         'navmesh', 32);
    this.navMesh.enableDebug();
    this.navMesh.debugDrawMesh({
        drawCentroid: false, drawBounds: false,
         drawNeighbors: false, drawPortals: false,
    });
}
/**
 * 
 * @param {Phaser.Point} start
 * @param {Phaser.Point} finish
 * @return {path} path
 */
NavMesh.prototype.findPath = function(start, finish) {
    // return this.navMesh.findPath(start, finish);
    this.navMesh.debugClear(); // Clears the overlay    
    return this.navMesh.findPath(start, finish, {
        drawPolyPath: false, drawFinalPath: true,
    });
};

module.exports = NavMesh;
