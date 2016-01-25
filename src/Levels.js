///<reference path="Joust.js"><reference path="./lib/phaser.js">

Joust = Joust || {};

//Demo level
Joust.levels.demo = function (game) { Joust.levels.currentLevel = this; };
Joust.levels.demo.prototype =
{
    preload: function ()
    {
        this.game.load.tilemap('map', 'assets/tiled_map/tiled_map.json', null, Phaser.Tilemap.TILED_JSON);
        Joust.utils.loader.loadGrassPlatform(this);
        Joust.utils.loader.loadGrayPlatform(this);
        Joust.utils.loader.loadIcedPlatform(this);
        Joust.utils.loader.loadCollidingPlatform(this);
        Joust.utils.loader.loadBackground(this, 'assets/tiled_map/backtile.png');
        Joust.utils.loader.loadCheckpointFlag(this);
        Joust.utils.loader.loadEnemieCrab(this);
        Joust.utils.loader.loadEnemieSpiky(this);
        Joust.utils.loader.loadKnight(this);
        this.game.time.advancedTiming = true;
    },

    create: function ()
    {
        this.game.canvas.addEventListener("mousedown", (function () { Joust.goFullScreen(this.game) }).bind(this));
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);

        //Tiled Map
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('gray_pltf', 'gray_pltf');
        this.map.addTilesetImage('iced_pltf', 'iced_pltf');
        this.map.addTilesetImage('grass_pltf', 'grass_pltf');
        this.map.addTilesetImage('platformTile', 'platformTile');
        this.layers = {};

        //Set background
        Joust.utils.levelConfigurationFunctions.configureBackground(this);

        //Visible platforms and invisible collision tiles
        Joust.utils.levelConfigurationFunctions.configureVisibleTiles(this, 'platforms', true);
        Joust.utils.levelConfigurationFunctions.configureCollidingTiles(this, 'colliding_tiles');

        this.layers.platforms.resizeWorld();

        //Configuring arcade physics world
        Joust.utils.levelConfigurationFunctions.configureArcadePhysics(this, 1200);

        //'level.staticSprites' has cacheAsBitmap=true, so no animation will work here
        Joust.utils.levelConfigurationFunctions.configureStaticSprites(this);

        //Alert all the objects when the game updates
        this.game.time.events.onUpdate = new Phaser.Signal();

        //Spawning sprites
        this.spawnSprites();
    },

    spawnSprites: function ()
    {
        Joust.utils.levelConfigurationFunctions.tileHeightCorrection = -32;
        Joust.utils.levelConfigurationFunctions.tileWidthCorrection = +32;

        this._defaultSpawnSprites();
    },

    render : function()
    {
        this._defaultRender();
        //this.game.debug.body(this.sprites.knight);
    }

}

Joust.utils.forEveryItem(Joust.levels,
    function (elem)
    {
        Joust.objectsConstructors.Level.call(elem.prototype);
        elem.prototype.constructor = Joust.objectsConstructors.Level;
    });