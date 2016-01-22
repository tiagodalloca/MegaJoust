///<reference path="Joust.js"><reference path="./lib/phaser.js">
///<reference path="Levels.js">

window.onload = function ()
{
    var game = new Phaser.Game(1600/1.5, 900/1.5, Phaser.CANVAS, 'mainGame', null, false, false);
    game.state.add('demo', Joust.levels.demo, true);
};