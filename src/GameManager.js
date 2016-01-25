///<reference path="Joust.js"><reference path="./lib/phaser.js">
///<reference path="Levels.js">

window.onload = function ()
{

    var game = new Phaser.Game(800, 450, Phaser.CANVAS, 'mainGame', null, false, false);
    
    game.state.add('demo', Joust.levels.demo, true);
};