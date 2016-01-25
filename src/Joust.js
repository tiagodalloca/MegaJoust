///<reference path="../lib/phaser.js">


Function.prototype.extends = function (parent)
{
    this.prototype = Object.create(parent.prototype);
    this.prototype.constructor = this;
    this.inheritedFrom = parent;
}

Function.prototype.isMySon = function (son)
{
    return son.constructor === this;
}

const extending = function (sup, sub)
{
    sub.prototype = Object.create(sup.prototype);
    sub.prototype.constructor = sub;
    sub.inheritedFrom = sup;
};

var Joust =
{

    goFullScreen: function (game)
    {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE;
        if (game.scale.isFullScreen)
        {
            game.scale.stopFullScreen();
        }
        else
        {
            game.scale.startFullScreen();
        }
    },

    objectsConstructors:
    {
        Knight: function (game, x, y, key, vel, jumpVel, size, drag, mass, tint)
        {
            Phaser.Sprite.call(this, game, x, y, key);
            this.tint = tint;
            this.size = size;
            this.scale.x = this.size;
            this.scale.y = this.size;
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            this.invenciblePoints = 100;
            this.alpha = 0.5;
            game.add.existing(this);

            this.particleTexture = new Phaser.Sprite(game, 0, 0, 'knightParticle');
            this.particleTexture.scale.set(0.5, 0.5);
            this.particleTexture.tint = tint;
            this.particleTexture = this.particleTexture.generateTexture();

            this.emitter = new Phaser.Particles.Arcade.Emitter(game, 0, 0, 200);
            this.emitter.makeParticles(this.particleTexture, 0, 160, true);

            this.spawnPoint = new Phaser.Point(x, y);

            this.drag = drag;
            this.vel = vel;
            this.jumpVel = jumpVel;

            game.physics.arcade.enable(this);
            this.body.setSize(this.width - 30, this.height, 0, 0);
            this.body.collideWorldBounds = true;
            this.body.width -= this.size * 5;
            this.body.height -= this.size * 5;
            this.body.mass = mass;
            this.body.maxVelocity.x = this.vel;
            this.body.maxVelocity.y = 500;
            this.body.drag.x = drag;
            this.body.allowRotation = false;

            this.animations.add('run', [1, 2, 3], 20, true);
            this.animations.add('fly', [4, 5], 10, true);

            var touchingTheFloor, runningFrameSpeed;
            var holdUpdates = 0;

            var _this = this;
            _body = this.body;

            this._updateFunction = function ()
            {
                if (_this.alive)
                {
                    touchingTheFloor = (_this.body.touching.down || _this.body.onFloor());
                    runningFrameSpeed = Math.round(Math.abs(_this.body.velocity.x) / 20);

                    if (touchingTheFloor)
                    {
                        _this.nFlights = 0;
                    }

                    if (runningFrameSpeed < 5)
                        runningFrameSpeed = 5;

                    if (game.input.pointer2.isDown)
                    {
                        if (holdUpdates == 0)
                            _this.fly();

                        holdUpdates++;
                    }

                    else
                    {
                        holdUpdates = 0;
                    }

                    if (game.input.pointer1.isDown)
                    {
                        if (game.input.pointer1.screenX > game.width / 2)
                            _this.walkToRight();

                        if (game.input.pointer1.screenX < game.width / 2)
                            _this.walkToLeft();
                    }

                    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
                    {
                        _this.walkToRight();
                    }

                    else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
                    {
                        _this.walkToLeft();
                    }

                    else if (touchingTheFloor)
                    {
                        _this.body.drag.x = drag;

                        if (_this.body.velocity.x != 0)
                        {
                            _this.animations.stop();
                            _this.animations.frame = 6;
                        }

                        else
                        {
                            _this.animations.stop();
                            _this.animations.frame = 0;
                        }
                    }

                    else
                    {
                        _this.animations.play('fly');
                        _this.body.drag.x = 0;
                    }
                }

                if (_this.invenciblePoints != 0)
                {
                    _this.invenciblePoints--;

                    if (_this.invenciblePoints == 0)
                        _this.alpha = 1;
                }
            };
            this._onUpArrowUp = function ()
            {
                _this.fly();
            };

            game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(this._onUpArrowUp);
            game.time.events.onUpdate.add(this._updateFunction);

            this.walkToLeft = function ()
            {
                _this.scale.x = -_this.size;

                if (touchingTheFloor)
                {
                    _this.animations.play('run');
                    _this.animations.currentAnim.speed = runningFrameSpeed;
                }

                _this.body.velocity.add(-_this.vel / 30, 0);
            }

            this.walkToRight = function ()
            {
                _this.scale.x = _this.size;

                if (touchingTheFloor)
                {
                    _this.animations.play('run');
                    _this.animations.currentAnim.speed = runningFrameSpeed;
                }

                _this.body.velocity.add(_this.vel / 30, 0);
            }

            this.fly = function ()
            {
                if (_this.nFlights < 3 && _this.alive)
                {
                    _this.play('fly');
                    _body.velocity.set(_body.velocity.x, -_this.jumpVel);
                    _this.nFlights++;
                }
            };

            this.desintegrate = function ()
            {
                this.emitter.x = this.x - this.width / 2;
                this.emitter.y = this.y;

                if (this.body.velocity.x != 0)
                    this.emitter.setXSpeed(Math.abs(this.body.velocity.x) / this.body.velocity.x * -1 * this.vel / 2, Math.abs(this.body.velocity.x) / this.body.velocity.x * (Math.abs(this.body.velocity.x * 1.5) + this.vel / 2));

                else
                    this.emitter.setXSpeed(-this.vel, this.vel);

                this.emitter.setYSpeed(this.body.velocity.y / 2, this.body.velocity.y - this.jumpVel / 1.3);
                this.emitter.maxParticleScale = 0.5;
                this.emitter.minParticleScale = 0.5;
                this.emitter.height = Math.abs(this.height) / 2;
                this.emitter.width = Math.abs(this.width); this.emitter.gravity = 0;
                this.emitter.start(true, 5000, null, 80); //explode 200 particles and let them 'living' for 5s
                this.emitter.forEach(
                function (child)
                {
                    child.tint = this.tint;
                    child.body.allowRotation = false;
                    child.body.drag.x = this.drag;
                }, this);

                this.body.velocity.set(0, 0);
                this.kill();
            };

            this.revive = function ()
            {
                this.constructor.inheritedFrom.prototype.revive.apply(this, arguments);
                this.x = this.spawnPoint.x;
                this.y = this.spawnPoint.y;
                this.invenciblePoints = 100;
                this.alpha = 0.5;
            }
        },

        Enemie: function (x, y, game, key) //Abstract class
        {
            if (this.constructor === Joust.Enemie)
                throw new Error("Enemie cannot be instancieted");

            Phaser.Sprite.call(this, game, x, y, key);
            game.add.existing(this);
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
            this.body.allowRotation = false;

            this.anchor.x = 0.5;
            this.anchor.y = 0.5;

            if (!!arguments[4] && typeof arguments[4] === 'number')
                this.scale.set(arguments[4]);
        },

        Spiky: function (x, y, game, key, vel, drag, target)
        {
            Joust.objectsConstructors.Enemie.call(this, x, y, game, key, arguments[arguments.length - 1]);

            this.vel = vel;
            this.body.drag.x = drag;

            this.animations.add('run', [0, 1, 2, 3, 4], Math.round(Math.random() * 7 + 3), true);
            this.animations.play('run');

            var _this = this;

            this._onUpdateFunction = function ()
            {
                if (target.alive)
                {
                    if (_this.body.velocity.x == 0 && Math.abs(_this.x - target.x) < 800)
                    {
                        if (_this.x > target.x)
                            _this.body.velocity.add(_this.vel * Math.random() * -1, 0);

                        else
                            _this.body.velocity.add(_this.vel * Math.random(), 0);
                    }

                    else if (_this.body.velocity.x > 0)
                        _this.scale.x = -1 * Math.abs(_this.scale.x);

                    else
                        _this.scale.x = Math.abs(_this.scale.x);
                }
            };
            game.time.events.onUpdate.add(this._onUpdateFunction);
        },

        Crab: function (x, y, game, key, vel, target)
        {
            Joust.objectsConstructors.Enemie.call(this, x, y, game, key, arguments[arguments.length - 1]);

            this.vel = vel;
            this.jumpVel = -15 * this.vel;
            this.body.maxVelocity.x = this.vel;

            this.animations.add('run', [0, 1, 2, 3], Math.round(Math.random() * 7 + 3), true);
            this.animations.play('run');
            var _this = this;

            this._onUpdateFunction = function ()
            {
                if (target.alive)
                {
                    var touchingTheFloor = (_this.body.touching.down || _this.body.onFloor());

                    if (touchingTheFloor)
                    {
                        if (Math.abs(_this.x - target.x) < 300)
                        {
                            if (Math.abs(_this.x - target.x) > 10)
                            {
                                if (_this.x > target.x)
                                    _this.body.velocity.add(_this.vel * Math.random() * -1, 0);

                                else
                                    _this.body.velocity.add(_this.vel * Math.random(), 0);
                            }

                            else
                            {
                                _this.body.velocity.x = 0;
                            }
                        }

                        if (target.y + target.height * target.anchor.y < _this.y + _this.height * _this.anchor.y
                            && Math.abs(_this.x - target.x) < 100)
                            _this.body.velocity.add(0, _this.jumpVel);
                    }

                    if (_this.body.velocity.x > 0)
                        _this.scale.x = -1 * Math.abs(_this.scale.x);

                    else
                        _this.scale.x = Math.abs(_this.scale.x);
                }

                else
                {
                    _this.body.velocity.x = 0;
                }
            };
            this.game.time.events.onUpdate.add(this._onUpdateFunction);
        },

        Flag: function (x, y, game, key) //Not "animated"
        {
            Phaser.Sprite.call(this, game, x, y, key, 1);
            game.add.existing(this);

            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;

            this.anchor.x = 0.5;
            this.anchor.y = 0.5;

            this.animations.add('looping', [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 60, true);

            var _this = this;

            this.looped = false;
            this.playLoop = function ()
            {
                if (!this.looped)
                {
                    _this.animations.play('looping').onLoop.add(
                     function ()
                     {
                         if (_this.animations.currentAnim.loopCount == 2)
                         {
                             _this.animations.currentAnim.stop();
                             _this.animations.frame = 0;
                         }
                     });

                    this.looped = true;
                }
            }
        },

        //Not sprites

        Level: function Level()
        {
            //Class that represents a stage or level from the game
            //!!BUT DO NOT INSTANTIATE!!
            //(Take a look at the final lines of Levels.js)

            if (!(this.create || this.preload || this.mapKey || this.mapPath))
                throw new Error("'create', 'preload, 'mapKey' and 'mapPath' properties must have been settled!");

            this.layers = {};

            this._defaultCreate = function ()
            {
                this.game.canvas.addEventListener("mousedown", (function () { Joust.goFullScreen(this.game) }).bind(this));
                //Set background
                Joust.utils.levelConfigurationFunctions.configureBackground(this);
            };

            this._defaultUpdate = function ()
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
                    var cont = 0;
                    this.sprites.flag.forEach(function (elem) { if (elem.looped) cont++; });

                    if (cont + 1 == this.sprites.flag.length) //If that is the last flag, then finish the level
                        this.finishLevel();

                    else
                    {
                        Joust.spawners.texts.inGameText(this, flag.x, flag.y - flag.height, "checkpoint");
                        this.sprites.knight.spawnPoint.set(flag.x, flag.y);
                        flag.playLoop();
                    }
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
            };

            this._defaultRender = function ()
            {
                //Joust.game.debug.pointer(Joust.game.input.pointer1);
                this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
            };

            this._defaultSpawnSprites = function ()
            {
                this.sprites.knight = Joust.spawners.knight(this, 'objects', Math.random() * 0xffffff);
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
            };

            this._defaultFinishLevel = function ()
            {
                Joust.utils.levelBehaviorFunctions.resetLevel(this);
            };

            if (!this.update)
                this.update = this._defaultUpdate;

            if (!this.render)
                this.render = this._defaultRender;

            if (!this.spawnSprites)
                this.spawnSprites = this._defaultSpawnSprites;

            if (!this.finishLevel)
                this.finishLevel = this._defaultFinishLevel;

            this.init = function ()
            {
                if (this.scale.scaleMode != Phaser.ScaleManager.SHOW_ALL)
                    this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

                this.game.stage.smoothed = false;

                this.sprites = {};
                this.sprites.enemies = {};
                //Alert all the objects (many are sprites) when the game updates
                this.game.time.events.onUpdate = new Phaser.Signal();
            }
        }
    },

    utils:
    {
        arrayFromObject: function (obj)
        {
            return Object.keys(obj).map(function (key) { return obj[key] });
        },

        forEveryItem: function forEveryItem(array, callback)
        {
            if (array.constructor != Array)
                array = Joust.utils.arrayFromObject(array);

            array.forEach(
            function (ele, ind, arr)
            {
                if (ele != null)
                {
                    if (ele.constructor != Array && ele.constructor != Object)
                        callback(ele);

                    else
                    {
                        if (ele.constructor == Object)
                            forEveryItem(Joust.utils.arrayFromObject(ele), callback);

                        if (ele.constructor == Array)
                            forEveryItem(ele, callback);
                    }
                }
            });
        },

        colors:
        {
            RED: 0xdb1100,
            LIGHTRED: 0xff5a5a,
            YEALLOW: 0xffce00,
            ORANGE: 0xffa500,
            GREEN: 0x00a800,
            LIGHTBLUE: 0x00a3aa,
            BLUE: 0x004fcc,
            DARKBLUE: 0x000577,
            PURPLE: 0x7500a8
        },

        throwAnErrorIfItsNotALevel: function (thing)
        {
            if (Joust.objectsConstructors.Level.isMySon(thing))
                return true;

            else
            {
                throw new Error("This thing its not a Level");
            }
        },

        levelConfigurationFunctions:
        {
            setCollisionDirectionsFromTiles: function (tilemapLayer)
            {
                var clt = tilemapLayer;

                clt.map.layers[clt.index].data.forEach(
                function (elem, i, arr)
                {
                    elem.forEach(
                    function (elem, i, arr)
                    {
                        if (elem.index != -1)
                        {
                            elem.collideUp = stringToBoolean(elem.properties.top);
                            elem.collideDown = stringToBoolean(elem.properties.bottom);
                            elem.collideLeft = stringToBoolean(elem.properties.left);
                            elem.collideRight = stringToBoolean(elem.properties.right);

                            elem.faceTop = stringToBoolean(elem.properties.top)
                            elem.faceBottom = stringToBoolean(elem.properties.bottom);
                            elem.faceLeft = stringToBoolean(elem.properties.left);
                            elem.faceRight = stringToBoolean(elem.properties.right);
                        }
                    });

                    function stringToBoolean(string)
                    {
                        switch (string.toLowerCase().trim())
                        {
                            case "true": case "yes": case "1": return true;
                            case "false": case "no": case "0": case null: return false;
                            default: return Boolean(string);
                        }
                    }
                });
            },

            createSpriteByType: function (arrObjs, type, stringCacheTexture, frame, game)
            {
                var sprites = [];

                for (var cont = 0; cont < arrObjs.length; cont++)
                {
                    if (arrObjs[cont].type === type)
                    {
                        var asd = new Phaser.Sprite(game, arrObjs[cont].x, arrObjs[cont].y - 50, stringCacheTexture, frame);
                        game.add.existing(asd);
                        sprites.push(asd);
                    }
                }

                return sprites
            },

            createSpriteProtoByType: function (arrObjs, type)
            {
                var sprites = [];

                //Sometimes, the position of the sprites are not correct
                //and normally are different by a 'tile'

                if (!this.tileHeightCorrection)
                    this.tileHeightCorrection = 0; //function's property

                if (!this.tileWidthCorrection)
                    this.tileWidthCorrection = 0;

                for (var cont = 0; cont < arrObjs.length; cont++)
                {
                    if (arrObjs[cont].type === type)
                    {
                        var asd = {};
                        asd.x = arrObjs[cont].x + this.tileWidthCorrection;
                        asd.y = arrObjs[cont].y + this.tileHeightCorrection;
                        //Other properties might be added
                        sprites.push(asd);
                    }
                }

                return sprites
            },

            configureBackground: function (level)
            {
                if (Joust.utils.throwAnErrorIfItsNotALevel(level))
                {
                    level.game.stage.backgroundColor = "rgb(255,255,255)";

                    var backW = level.game.cache.getImage('backtile').width;
                    var backH = level.game.cache.getImage('backtile').height;

                    level.background = new Phaser.Group(level.game, level.game.world, 'background');

                    for (var i = 0; i * backW < level.map.widthInPixels; i++)
                        level.background.create(i * backW, -100, 'backtile', false);

                    level.background.cacheAsBitmap = true;
                }
            },

            configureCollidingTiles: function (level, layerName)
            {
                level.layers.colliding_tiles = level.map.createLayer(layerName);
                level.layers.colliding_tiles.renderable = false;
                level.layers.colliding_tiles.visible = false;
                level.map.setCollision(24, true, layerName);
                Joust.utils.levelConfigurationFunctions.setCollisionDirectionsFromTiles(level.layers.colliding_tiles);
            },

            configureVisibleTiles: function (level, layerName, cacheAsBitmap)
            {
                level.layers[layerName] = level.map.createLayer(layerName);

                if (cacheAsBitmap)
                    level.layers.platforms.cacheAsBitmap = cacheAsBitmap;
            },

            configureArcadePhysics: function (level, gravity)
            {
                level.game.physics.startSystem(Phaser.Physics.ARCADE);
                level.game.physics.arcade.setBoundsToWorld();
                level.game.physics.arcade.gravity.y = gravity;
            },

            configureStaticSprites: function (level)
            {
                //Static sprites that will be added later
                level.staticSprites = new Phaser.Group(level.game, level.game.world, 'staticSprites');
                level.staticSprites.cacheAsBitmap = true;
                level.staticSprites.oldLength = 0;
                //All the sprites that are placed in 'trash' are killed after updating cache
                level.staticSprites.trash = [];
            }

        },

        levelBehaviorFunctions:
        {
            collideSpritesWithCollisionTiles: function (level)
            {
                if (Joust.utils.throwAnErrorIfItsNotALevel(level))
                {
                    Joust.utils.forEveryItem(level.sprites,
                    (function (sprite)
                    {
                        level.game.physics.arcade.collide(sprite, level.layers.colliding_tiles);
                    }));

                    level.game.physics.arcade.collide(level.sprites.knight.emitter, level.layers.colliding_tiles,
                    function Bob(particle)
                    {
                        if (particle.body.velocity.y == 0 && particle.body.velocity.x == 0)
                        {
                            if (particle.cont != undefined)
                                particle.cont++;

                            else
                                particle.cont = 0;

                            if (particle.cont > 100)
                            {
                                if (!Bob.particleTexture)
                                    Bob.particleTexture = particle.generateTexture();

                                level.staticSprites.trash.push(particle);
                                var spr = level.staticSprites.create(particle.x, particle.y, Bob.particleTexture);
                                spr.anchor.x = 0.5;
                                spr.anchor.y = 0.5;
                                spr.scale.set(particle.scale.x, particle.scale.y);
                                particle.cont = 0;
                            }
                        }
                    });
                }
            },

            isTheKnightTouchingAnEnemie: function (level)
            {
                if (Joust.utils.throwAnErrorIfItsNotALevel(level))
                {
                    var boo = false

                    Joust.utils.forEveryItem(level.sprites,
                    (function (sprite)
                    {
                        if (sprite != level.sprites.knight)
                        {
                            if (sprite.__proto__.constructor.inheritedFrom == Joust.objectsConstructors.Enemie)
                            {
                                level.game.physics.arcade.overlap(level.sprites.knight, sprite,
                                function ()
                                {
                                    boo = level.sprites.knight;
                                });
                            }
                        }
                    }));

                    return boo;
                }
            },

            isTheKnightTouchingAFlag: function (level)
            {
                var boo = false;

                Joust.utils.forEveryItem(level.sprites.flag,
                (function (flag)
                {
                    level.game.physics.arcade.overlap(level.sprites.knight, flag,
                    function ()
                    {
                        boo = flag;
                    });
                }));

                return boo;
            },

            resetLevel: function (level)
            {
                if (Joust.utils.throwAnErrorIfItsNotALevel(level))
                {
                    Joust.utils.forEveryItem(level.sprites,
                    function (sprite)
                    {
                        sprite.destroy();
                    });

                    level.game.time.events.onUpdate.removeAll();
                    level.game.time.events.removeAll();
                    level.spawnSprites();
                }
            },

            killKnight: function (level, deadKnight)
            {
                deadKnight.desintegrate();
                var clock = level.game.time.events.add(1000,
                function (timer)
                {
                    this.game.camera.unfollow();
                    var tween = this.game.add.tween(this.game.camera).to(
                    {
                        x: deadKnight.spawnPoint.x - this.game.camera.width / 2,
                        y: deadKnight.spawnPoint.y - this.game.camera.height / 2
                    }, 500, Phaser.Easing.Elastic.Out, true);
                    tween.onComplete.add(
                    function ()
                    {
                        deadKnight.revive();
                        this.game.camera.follow(deadKnight);
                    }, level);
                }, level, clock);

                clock.autoDestroy = true;
            }
        },

        loader:
        {
            //Super auto load stuff!
            loadEverything:
            {
                preload: function ()
                {
                    Joust.utils.loader.loadCheckpointFlag(this);
                    Joust.utils.loader.loadEnemieCrab(this);
                    Joust.utils.loader.loadEnemieSpiky(this);
                    Joust.utils.loader.loadKnight(this);
                    Joust.utils.loader.loadGrayPlatform(this);
                    Joust.utils.loader.loadIcedPlatform(this);
                    Joust.utils.loader.loadCollidingPlatform(this);
                    Joust.utils.loader.loadGrassPlatform(this);

                    Joust.utils.forEveryItem(Joust.levels,
                    (function (level)
                    {
                        this.game.load.tilemap(level.prototype.mapKey, level.prototype.mapPath, null, Phaser.Tilemap.TILED_JSON);
                    }).bind(this));
                }
            },

            autoLoadTilesets: function (level, mapKeyName, tileW, tileH)
            {
                level.map = level.game.add.tilemap(mapKeyName, tileW, tileH);
                level.map.loadedTilesets = [];
                level.map.tilesets.forEach(
                (function (tileset)
                {
                    switch (tileset.name.toLowerCase())
                    {
                        case 'grass_pltf':
                            this.map.addTilesetImage('grass_pltf');
                            break;

                        case 'gray_pltf':
                            this.map.addTilesetImage('gray_pltf');
                            break;

                        case 'iced_pltf':
                            this.map.addTilesetImage('iced_pltf');
                            break;
                    }
                }).bind(level));
            },

            //Common
            loadGrassPlatform: function (level) { level.game.load.image('grass_pltf', 'assets/tiled_map/grass_pltf.png'); },
            loadGrayPlatform: function (level) { level.game.load.image('gray_pltf', 'assets/tiled_map/gray_pltf.png'); },
            loadIcedPlatform: function (level) { level.game.load.image('iced_pltf', 'assets/tiled_map/iced_pltf.png'); },
            loadBackground: function (level, path) { level.game.load.image('backtile', path); },
            loadCheckpointFlag: function (level) { level.game.load.spritesheet('flag', 'assets/sprites/flag.png', 45, 66); },
            loadEnemieCrab: function (level) { level.game.load.spritesheet('crab', 'assets/sprites/crab.png', 90, 60); },
            loadEnemieSpiky: function (level) { level.game.load.spritesheet('spiky', 'assets/sprites/spiky.png', 110, 93); },
            loadKnight: function (level) { level.game.load.spritesheet('knight', 'assets/sprites/knight.png', 70, 60); level.game.load.image('knightParticle', 'assets/sprites/particle.png'); }

        },
    },

    levels:
    {
        currentLevel: null,
    },

    spawners:
    {
        knight: function (level, objectLayerName, color)
        {
            var kn = (Joust.utils.levelConfigurationFunctions.createSpriteProtoByType(level.map.objects[objectLayerName], 'knight'))[0];
            var knight = new Joust.objectsConstructors.Knight(level.game, kn.x, kn.y, 'knight', 500, 500, 1, 500, 100, color);
            return knight;
        },

        spiky: function (level, objectLayerName, target, scale)
        {
            var elems = Joust.utils.levelConfigurationFunctions.createSpriteProtoByType(level.map.objects[objectLayerName], 'spiky');

            for (var cont = 0; cont < elems.length; cont++)
            {
                var ele = elems[cont];
                ele = new Joust.objectsConstructors.Spiky(ele.x, ele.y, level.game, 'spiky', 50, 10, target, scale);
                elems[cont] = ele;
            }

            return elems;
        },

        crab: function (level, objectLayerName, target, scale)
        {
            var elems = Joust.utils.levelConfigurationFunctions.createSpriteProtoByType(level.map.objects[objectLayerName], 'crab');

            for (var cont = 0; cont < elems.length; cont++)
            {
                var ele = elems[cont];
                ele = new Joust.objectsConstructors.Crab(ele.x, ele.y, level.game, 'crab', 45 + Math.random() * 5, target, scale);
                elems[cont] = ele;
            }

            return elems;
        },

        flag: function (level, objectLayerName, scale)
        {
            var elems = Joust.utils.levelConfigurationFunctions.createSpriteProtoByType(level.map.objects[objectLayerName], 'flag');

            for (var cont = 0; cont < elems.length; cont++)
            {
                var ele = elems[cont];
                ele = new Joust.objectsConstructors.Flag(ele.x, ele.y, level.game, 'flag');
                elems[cont] = ele;
            }

            return elems;
        },

        texts:
        {
            inGameText: function inGameText(level, x, y, text, style, addToCacheOnly)
            {
                var gameText;

                if (!inGameText.cache)
                {
                    inGameText.cache = {};
                    createText();
                    inGameText[gameText.text] = gameText;
                }

                if (!addToCacheOnly)
                {
                    if (!inGameText[text])
                        createText();

                    else
                        reviveText();


                    var tween = level.game.add.tween(gameText).to(
                        {
                            y: y - 30,
                            alpha: 0.3
                        }, 1000, "Linear", true);
                    tween.onComplete.add(
                    function ()
                    {
                        gameText.alpha = 1;
                        gameText.kill();
                    }, level);
                }

                else
                {
                    createText();
                    inGameText.cache[text] = null;
                    createText();
                    gameText.kill();
                }

                function createText()
                {
                    style.font = "15px pixel_emulatorregular";
                    gameText = level.game.add.text(x, y, text, style);
                    gameText.smoothed = false;
                    gameText.width += 20;
                    gameText.anchor.x = 0.5;
                    inGameText.cache[text] = gameText;
                }

                function reviveText()
                {
                    gameText = inGameText.cache[text];
                    gameText.x = x;
                    gameText.y = y;
                    gameText.revive();
                }

                return gameText;
            }
        }
    }
};

Joust.objectsConstructors.Knight.extends(Phaser.Sprite);
Joust.objectsConstructors.Enemie.extends(Phaser.Sprite);
Joust.objectsConstructors.Spiky.extends(Joust.objectsConstructors.Enemie);
Joust.objectsConstructors.Crab.extends(Joust.objectsConstructors.Enemie);
Joust.objectsConstructors.Flag.extends(Phaser.Sprite);