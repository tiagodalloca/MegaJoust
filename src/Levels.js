///<reference path="Joust.js"><reference path="./lib/phaser.js">

Joust = Joust || {};

//Demo level
Joust.levels.demo = function (game) { Joust.levels.currentLevel = this; };
Joust.levels.demo.prototype =
{
    preload: function ()
    {
        this.game.load.tilemap('map', 'assets/tiled_map/tiled_map.json', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('gray_pltf', 'assets/tiled_map/gray_pltf.png');
        this.game.load.image('iced_pltf', 'assets/tiled_map/iced_pltf.png');
        this.game.load.image('platformTile', 'assets/tiled_map/platformTile.png');
        this.game.load.image('backtile', 'assets/tiled_map/backtile.png');
        this.game.load.spritesheet('flag', 'assets/sprites/flag.png', 45, 66);
        this.game.load.spritesheet('crab', 'assets/sprites/crab.png', 45, 30);
        this.game.load.spritesheet('spiky', 'assets/sprites/spiky.png', 55, 48);
        this.game.load.spritesheet('knight', 'assets/sprites/knight.png', 70, 60);
        this.game.load.image('knightParticle', 'assets/sprites/knightParticle.png');
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

        //Background
        Joust.utils.levelConfigurationFunctions.configureBackground(this);

        //Visible platforms and invisible collision tiles
        this.layers.platforms = this.map.createLayer('platforms');
        this.layers.colliding_tiles = this.map.createLayer('colliding_tiles');
        this.layers.colliding_tiles.alpha = 0;
        this.map.setCollision(24, true, 'colliding_tiles');
        Joust.utils.levelConfigurationFunctions.setCollisionDirectionsFromTiles(this.layers.colliding_tiles, { top: true, bottom: false, left: false, right: false });

        this.layers.platforms.resizeWorld();

        //Configuring arcade physics world

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.setBoundsToWorld();
        this.game.physics.arcade.checkCollision.down = true;
        this.game.stage.backgroundColor = "rgb(255,255,255)";
        this.game.physics.arcade.gravity.y = 1200;

        this.emitter = this.game.add.emitter(0, 0, 10000);
        this.emitter.makeParticles('knightParticle');
        this.emitter.rotation = 0;

        //Alert all the objects when the game updates
        this.game.time.events.onUpdate = new Phaser.Signal();

        //Spawning sprites

        this.sprites = {};
        this.spawnSprites();
    },

    spawnSprites: function ()
    {
        //Sprites spawnig

        Joust.utils.levelConfigurationFunctions.tileHeightCorrection = -32;

        this.sprites.knight = Joust.spawners.knight(this, 'objects', Joust.utils.colors.yeallow);
        this.sprites.flag = Joust.spawners.flag(this, 'objects');

        this.sprites.enemies = {};

        this.sprites.enemies.spiky = Joust.spawners.spiky(this, 'objects', this.sprites.knight, 1.1);
        this.sprites.enemies.crab = Joust.spawners.crab(this, 'objects', this.sprites.knight, 2);

        this.game.camera.follow(this.sprites.knight);
    },

    render: function ()
    {
        //Joust.game.debug.pointer(Joust.game.input.pointer1);
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
        if (flag)
        {
            this.sprites.knight.spawnPoint.set(flag.x, flag.y);
            flag.playLoop();
        }

        //Dispatch the update event, so the sprites are updated
        //(Take a look at each objectConstructors' functions for better comprehension)
        this.game.time.events.onUpdate.dispatch();
    },
}

Joust.utils.forEveryItem(Joust.levels,
    function (elem)
    {
        Joust.objectsConstructors.Level.call(elem.prototype);
        elem.prototype.constructor = Joust.objectsConstructors.Level;
    });