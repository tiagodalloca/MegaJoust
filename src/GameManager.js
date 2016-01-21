///<reference path="Joust.js"><reference path="./lib/phaser.js">
///<reference path="Levels.js">

window.onload = function ()
{
    var game = new Phaser.Game(1080/1.5, 720/1.5, Phaser.AUTO, 'mainGame', null, false, false);
    game.state.add('demo', Joust.levels.demo, true);
};