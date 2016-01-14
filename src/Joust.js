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
    sub.parent = sup;
};

var Joust =
{

    goFullScreen: function (game)
    {
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
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
        Knight: function (game, x, y, key, vel, jumpVel,size, drag, mass, tint)
        {
            Phaser.Sprite.call(this, game, x, y, key);
            this.tint = tint;
            this.size = size;
            this.scale.x = this.size;
            this.scale.y = this.size;
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;
            game.add.existing(this);

            this.vel = vel;
            this.jumpVel = jumpVel;

            game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
            this.body.width -= this.size * 5;
            this.body.height -= this.size * 5;
            this.body.mass = mass;
            this.body.maxVelocity.x = this.vel;
            this.body.maxVelocity.y = 500;
            this.body.drag.x = drag;

            this.animations.add('run', [1, 2, 3], 20, true);
            this.animations.add('fly', [4, 5], 10, true);

            var _this = this;
            _body = this.body;
            var touchingTheFloor, runningFrameSpeed;
            var holdUpdates = 0;

            game.input.keyboard.addKey(Phaser.Keyboard.UP).onUp.add(
            function ()
            {
                if (_this.nFlights < 3)
                {
                    _this.fly();
                    _this.nFlights++;
                }
            });

            game.time.events.onUpdate.add(
            function ()
            {
                touchingTheFloor = (_this.body.touching.down || _this.body.onFloor());
                runningFrameSpeed = Math.round(Math.abs(_this.body.velocity.x) / 20);

                if (touchingTheFloor)
                    _this.nFlights = 0;

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
            });

            this.walkToLeft = function ()
            {
                _this.scale.x = -_this.size;

                if (touchingTheFloor)
                {
                    _this.animations.play('run');
                    _this.animations.currentAnim.speed = runningFrameSpeed;
                }

                _this.body.velocity.add(-_this.vel/30, 0);
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
                _this.play('fly');
                _body.velocity.add(0, -_this.jumpVel);
            }

            this.events.onDestroy.add(
            function ()
            {
                delete (_this);
            });
        },

        Enemie: function (x, y, game, key) //Abstract class
        {
            if (this.constructor === Joust.Enemie)
                throw new Error("Enemie cannot be instancieted");

            Phaser.Sprite.call(this, game, x, y, key);
            game.add.existing(this);
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;

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

            this.game.time.events.onUpdate.add(
            function ()
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
            });

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

            this.game.time.events.onUpdate.add(
            function ()
            {
                var touchingTheFloor = (_this.body.touching.down || _this.body.onFloor());

                if (touchingTheFloor)
                {
                    if (_this.x > target.x)
                        _this.body.velocity.add(_this.vel * Math.random() * -1, 0);

                    else
                        _this.body.velocity.add(_this.vel * Math.random(), 0);

                    if (target.y + target.height * target.anchor.y < _this.y + _this.height * _this.anchor.y)
                        _this.body.velocity.add(0, _this.jumpVel);
                }

                if (_this.body.velocity.x > 0)
                    _this.scale.x = -1 * Math.abs(_this.scale.x);

                else
                    _this.scale.x = Math.abs(_this.scale.x);
            });

        },

        //Not sprites

        Level: function () //Class that represents a stage or level from the game
        {
            if (!(this.update && this.render && this.create && this.preload))
                throw new Error("All the game properties must have been settled");
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
            red: 0xe35e4d,
            lightred: 0xff5a5a,
            yeallow: 0xffce00,
            orange: 0xffa500,
            green: 0x00a800,
            lightblue: 0x00a3aa,
            blue: 0x004fcc,
            darkblue: 0x000577,
            purple: 0x7500a8
        },

        throwAnErrorIfItsNotALevel : function(thing)
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

                for (var cont = 0; cont < arrObjs.length; cont++)
                {
                    if (arrObjs[cont].type === type)
                    {
                        var asd = {};
                        asd.x = arrObjs[cont].x;
                        asd.y = arrObjs[cont].y - 40;
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
                    var backW = level.game.cache.getImage('backtile').width;
                    var backH = level.game.cache.getImage('backtile').height

                    for (var i = 0; i * backW < level.map.widthInPixels; i++)
                        level.game.add.tileSprite(i * backW, -100, backW, backH, 'backtile');
                }
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
                                level.game.physics.arcade.collide(level.sprites.knight, sprite,
                                (function ()
                                {
                                    boo = true;
                                }));
                            }
                        }
                    }));

                    return boo;
                }
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
        }
    },

    levels:
    {
        currentLevel: null,
    },

    spawners:
    {
        knight: function (level, objectLayerName)
        {
            var kn = (Joust.utils.levelConfigurationFunctions.createSpriteProtoByType(level.map.objects[objectLayerName], 'knight'))[0];
            var knight = new Joust.objectsConstructors.Knight(level.game, kn.x, kn.y, 'knight', 500, 500, 1, 500, 100, Joust.utils.colors.blue);
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
                ele = new Joust.objectsConstructors.Crab(ele.x, ele.y, level.game, 'crab', 30 + Math.random() * 30, target, scale);
                elems[cont] = ele;
            }

            return elems;
        }
    }
};

Joust.objectsConstructors.Knight.extends(Phaser.Sprite);
Joust.objectsConstructors.Enemie.extends(Phaser.Sprite);
Joust.objectsConstructors.Spiky.extends(Joust.objectsConstructors.Enemie);
Joust.objectsConstructors.Crab.extends(Joust.objectsConstructors.Enemie);