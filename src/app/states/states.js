'use strict'

var Boot = require("./boot")
var Load = require('./load')
var Play = require('./play')

console.log("Importing States")

module.exports = {
    Boot: Boot,
    Load: Load,
    Play: Play
}