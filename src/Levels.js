///<reference path="Joust.js"><reference path="./lib/phaser.js">

Joust = Joust || {};

//Demo level
Joust.levels.demo = function (game) { Joust.levels.currentLevel = this; };
Joust.levels.demo.prototype =
{
    mapPath: 'assets/tiled_map/tiled_map.json',
    mapKey: 'demoMap',

    preload: function ()
    {
        Joust.utils.loader.autoLoadTilesets(this, this.mapKey);
        Joust.utils.loader.loadBackground(this, 'assets/tiled_map/backtile.png');
        this.game.time.advancedTiming = true;
    },

    create: function ()
    {
        this._defaultCreate(); //Level's 'class' function

        //Visible platforms and invisible collision tiles
        Joust.utils.levelConfigurationFunctions.configureVisibleTiles(this, 'platforms', true);
        Joust.utils.levelConfigurationFunctions.configureCollidingTiles(this, 'colliding_tiles');

        this.layers.platforms.resizeWorld();

        //Configuring arcade physics world
        Joust.utils.levelConfigurationFunctions.configureArcadePhysics(this, 1200);

        //'level.staticSprites' has cacheAsBitmap=true, so no animation will work here
        Joust.utils.levelConfigurationFunctions.configureStaticSprites(this);

        //Spawning sprites
        this.spawnSprites();
    },

    spawnSprites: function ()
    {
        Joust.utils.levelConfigurationFunctions.tileHeightCorrection = -32;
        Joust.utils.levelConfigurationFunctions.tileWidthCorrection = +32;

        this._defaultSpawnSprites(); //Level's 'class' function
    }

}

Joust.utils.forEveryItem(Joust.levels,
    function (elem)
    {
        Joust.objectsConstructors.Level.call(elem.prototype);
        elem.prototype.constructor = Joust.objectsConstructors.Level;
    });