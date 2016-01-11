///<reference path="Joust.js"><reference path="./lib/phaser.js">
///<reference path="Levels.js">

window.onload = function ()
{
    var game = new Phaser.Game(window.innerWidth * 0.8, window.innerWidth * 0.8/2, Phaser.AUTO, 'mainGame', null, false, false);

    game.state.add('demo', Joust.levels.demo, true);

};