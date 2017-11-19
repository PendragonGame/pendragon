let currentTrack = null;
let muteP = false;


/**
 * Sets the current track to id
 * 
 * @param {String} id 
 * @param {boolean=} loop
 */
function changeTrack(id, loop=true) {
    if (currentTrack) {
        currentTrack.stop();
    }
    currentTrack = game.add.audio(id, 1, loop);
    currentTrack.play();
    currentTrack.mute = muteP;
}
/**
 * 
 * 
 */
function toggleMute() {
    muteP = !muteP;
    currentTrack.mute = muteP;
    console.log('mute toggled: ' + muteP.toString());
}
/**
 * Check if track is muted.
 * 
 * @return {boolean}
 */
function isMuted() {
    return muteP;
}


module.exports = {
    changeTrack: changeTrack,
    toggleMute: toggleMute,
    isMuted: isMuted,
};
