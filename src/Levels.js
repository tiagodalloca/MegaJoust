///<reference path="Joust.js"><reference path="./lib/phaser.js">

Joust = Joust || {};

//Demo level
Joust.levels.demo = function (game) { Joust.levels.currentLevel = this; };
Joust.levels.demo.prototype =
{
    preload: function ()
    {
        this.game.load.tilemap('map', 'assets/tiled_map/tiled_map.json', null, Phaser.Tilemap.TILED_JSON);
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

        this.sprites.knight = Joust.spawners.knight(this, 'objects', Joust.utils.colors.RED);
        this.sprites.flag = Joust.spawners.flag(this, 'objects');
        this.sprites.enemies.spiky = Joust.spawners.spiky(this, 'objects', this.sprites.knight, 0.7);
        this.sprites.enemies.crab = Joust.spawners.crab(this, 'objects', this.sprites.knight, 1);

        //Checkpoint text
        Joust.spawners.texts.inGameText(this, 0, 0, "checkpoint",
                {
                    align: "center",
                    fill: "white",
                    stroke: "black",
                    strokeThickness: "3"
                }, true);

        //I wanna sharp pixels, man! (But it doesn't seem to make any difference at all)
        this.game.stage.smoothed = false;

        //Camera move makes the game lag
        this.game.camera.follow(this.sprites.knight);
    },

    render: function ()
    {
        //Joust.game.debug.pointer(Joust.game.input.pointer1);
        this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
    },

    update: function ()
    {
        //Collides "physics" tiles with all the sprites
        Joust.utils.levelBehaviorFunctions.collideSpritesWithCollisionTiles(this);

        //If the knight is touching an enemie, the level is reseted
        var deadKnight = Joust.utils.levelBehaviorFunctions.isTheKnightTouchingAnEnemie(this)
        if (deadKnight && deadKnight.invenciblePoints == 0)
        {
            Joust.utils.levelBehaviorFunctions.killKnight(this, deadKnight);
        }

        //If the knight is touching a flag, we play flag's loop animation
        var flag = Joust.utils.levelBehaviorFunctions.isTheKnightTouchingAFlag(this);
        if (flag && !flag.looped)
        {
            Joust.spawners.texts.inGameText(this, flag.x, flag.y - flag.height, "checkpoint");
            this.sprites.knight.spawnPoint.set(flag.x, flag.y);
            flag.playLoop();
        }

        //Dispatch the update event, so the sprites are updated
        //(Take a look at each objectConstructors' functions for a better comprehension)
        this.game.time.events.onUpdate.dispatch();

        if (Math.abs(this.staticSprites.oldLength - this.staticSprites.length) >= 200)
        {
            this.staticSprites.oldLength = this.staticSprites.length;
            this.staticSprites.updateCache();

            this.staticSprites.trash.forEach(
            function (sprite)
            {
                sprite.kill();
            });
        }
    },
}

Joust.utils.forEveryItem(Joust.levels,
    function (elem)
    {
        Joust.objectsConstructors.Level.call(elem.prototype);
        elem.prototype.constructor = Joust.objectsConstructors.Level;
    });