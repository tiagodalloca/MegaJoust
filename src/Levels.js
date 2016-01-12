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
        this.game.load.image('platformTiles', 'assets/tiled_map/physics_tiles.png');
        this.game.load.image('backtile', 'assets/tiled_map/backtile.png');
        this.game.load.spritesheet('crab', 'assets/sprites/crab.png', 45, 30);
        this.game.load.spritesheet('spiky', 'assets/sprites/spiky.png', 55, 48);
        this.game.load.spritesheet('knight', 'assets/sprites/knight.png', 70, 60);
    },

    create: function ()
    {
        this.game.canvas.addEventListener("mousedown", (function () { Joust.goFullScreen(this.game) }).bind(this));
        this.game.world.setBounds(0, 0, this.game.width, this.game.height);

        //Tiled Map

        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('gray_pltf', 'gray_pltf');
        this.map.addTilesetImage('iced_pltf', 'iced_pltf');
        this.map.addTilesetImage('platformTiles', 'platformTiles');
        this.layers = {};

        //Background

        var backW = this.game.cache.getImage('backtile').width;

        for (var i = 0; i * backW < this.map.widthInPixels; i++)
            this.game.add.tileSprite(i * backW, -100, 1473, 1249, 'backtile');

        this.layers.platforms = this.map.createLayer('platforms');
        this.layers.colliding_tiles = this.map.createLayer('colliding_tiles');
        this.layers.colliding_tiles.alpha = 0;
        this.map.setCollision(24, true, 'colliding_tiles');
        //this.game.physics.arcade.enable(this.layers.colliding_tiles);
        //this.layers.colliding_tiles.body.checkCollision.down = false;

        Joust.utils.setCollisionDirectionsFromTiles(this.layers.colliding_tiles, {top: true, bottom: false, left: false, right: false});

        this.layers.platforms.resizeWorld();

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.setBoundsToWorld();
        this.game.physics.arcade.checkCollision.down = true;
        this.game.stage.backgroundColor = "rgb(255,255,255)";
        this.game.physics.arcade.gravity.y = 1200;


        this.game.time.events.onUpdate = new Phaser.Signal();
        this.sprites = {};
        this.spawnSprites();
    },

    spawnSprites: function ()
    {
        this.sprites.knight = Joust.spawners.knight(this, 'objects')

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
        Joust.utils.forEveryItem(this.sprites,
        (function (sprite)
        {
            this.game.physics.arcade.collide(sprite, this.layers.colliding_tiles);
        }).bind(this));

        this.game.time.events.onUpdate.dispatch();

        Joust.utils.forEveryItem(this.sprites,
        (function (sprite)
        {
            if (sprite != this.sprites.knight)
            {
                if (sprite.__proto__.__proto__ == Joust.objectsConstructors.Enemie.prototype)
                {
                    this.game.physics.arcade.collide(this.sprites.knight, sprite,
                    (function ()
                    {
                        Joust.levels.resetCurrentLevel();
                    }).bind(this));
                }
            }
        }).bind(this));
    },
}

//Joust.utils.forEveryItem(Joust.levels, function (ele, i, arr) { ele.extends(Joust.objectsConstructors.Level) });