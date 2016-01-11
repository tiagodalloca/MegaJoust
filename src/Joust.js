///<reference path="../lib/phaser.js">


Function.prototype.extends = function (parent)
{
    this.prototype = Object.create(parent.prototype);
    this.prototype.constructor = this;
    this.parent = parent;
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
        Knight: function (game, x, y, vel, size, drag, mass, tint)
        {
            Phaser.Sprite.call(this, game, x, y, 'knight');
            this.tint = tint;
            this.size = size;
            this.scale.x = this.size;
            this.scale.y = this.size;
            this.anchor.x = 0.5;
            game.add.existing(this);

            game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
            this.body.checkCollision.up = false;
            this.body.width -= this.size * 5;
            this.body.height -= this.size * 5;
            this.body.mass = mass;
            this.body.maxVelocity.x = this.vel;
            this.body.maxVelocity.y = 500;
            this.body.drag.x = drag;

            this.vel = vel;

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
                _this.play('fly');
                _body.velocity.add(0, -_this.vel * 2);
            }

            this.events.onDestroy.add(
            function ()
            {
                delete (_this);
            });
        },

        Enemie: function (sprite)
        {
            Phaser.Sprite.call(this, sprite.game, sprite.x, sprite.y, sprite.key);
            sprite.game.add.existing(this);
            sprite.destroy();
            this.game.physics.arcade.enable(this);
            this.body.collideWorldBounds = true;
        },

        Spiky: function (sprite, vel, drag, target)
        {
            Joust.objectsConstructors.Enemie.call(this, sprite);

            this.vel = vel;
            this.body.drag.x = drag;
            this.body.height -= 10;
            this.anchor.x = 0.5;
            this.anchor.y = 0.5;

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
                    _this.scale.x = -1;

                else
                    _this.scale.x = 1;
            });

        },

        //Not sprites

        //Level: function (preload, create, render, update) //Class that represents a stage or level from the game
        //{

        //    if (!(this.update || this.render || this.create || this.preload))
        //        throw new Error("All the game properties must have been settled");

        //    Joust.levels.currentLevel = this;
        //    this.reset = Joust.reset;
        //}
    },

    utils:
    {
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
        }
    },

    levels:
    {
        currentLevel: null,
        resetCurrentLevel: function ()
        {
            Joust.utils.forEveryItem(Joust.levels.currentLevel.sprites,
            function (sprite)
            {
                sprite.destroy();
            });
            Joust.levels.currentLevel.game.time.events.onUpdate.removeAll();
            Joust.levels.currentLevel.game.time.events.removeAll();
            Joust.levels.currentLevel.spawnSprites();
        }
    },

    spawners :
    {
        knight: function (level, objectLayerName, cacheTextureName)
        {
            var kn = (Joust.utils.createSpriteByType(level.map.objects[objectLayerName], 'knight', cacheTextureName, 0, level.game))[0];
            var knight = new Joust.objectsConstructors.Knight(level.game, kn.x, kn.y, 250, 1, 300, 100, Joust.utils.colors.blue);
            kn.destroy();
            return knight;
        },

        spiky : function(level, objectLayerName, cacheTextureName,target)
        {
            var elems = Joust.utils.createSpriteByType(level.map.objects[objectLayerName], 'spiky', cacheTextureName, 0, level.game);

            for (var cont = 0; cont < elems; cont++)
            {
                var ele = elems[cont];
                ele = new Joust.objectsConstructors.Spiky(ele, 50, 10, target);
                ele.animations.add('run', [0, 1, 2, 3, 4], Math.round(Math.random() * 7 + 3), true);
                ele.animations.play('run');
                elems[cont] = ele;
            }

            return elems;
        }
    }
};

//extending(Phaser.Sprite, Joust.objectsConstructors.Knight);
//extending(Phaser.Sprite, Joust.objectsConstructors.Enemie);
//extending(Joust.objectsConstructors.Enemie, Joust.objectsConstructors.Spiky);

//Joust.utils.forEveryItem(Joust.levels, function (ele, i, arr) { extending(Joust.objectsConstructors.Level, ele) });

Joust.objectsConstructors.Knight.extends(Phaser.Sprite);
Joust.objectsConstructors.Enemie.extends(Phaser.Sprite);
Joust.objectsConstructors.Spiky.extends(Joust.objectsConstructors.Enemie);