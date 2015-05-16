//globals define
define(function(require, exports, module) {
    'use strict';
    // import dependencies
    var Engine          = require('famous/core/Engine');
    var View            = require('famous/core/View');
    var Surface         = require('famous/core/Surface');
    var Modifier        = require('famous/core/Modifier');
    var StateModifier   = require('famous/modifiers/StateModifier');
    var EventHandler    = require('famous/core/EventHandler');
    var PhysicsEngine   = require('famous/physics/PhysicsEngine');
    var Transitionable  = require('famous/transitions/Transitionable');
    var SpringTransition= require('famous/transitions/SpringTransition');
    //var Particle        = require('famous/physics/bodies/Particle');
    //var Drag            = require('famous/physics/forces/Drag');
    //var RepulsionForce  = require('famous/physics/forces/Repulsion');
    //var Wall            = require('famous/physics/constraints/Wall');
    var Random          = require('famous/math/Random');
    var Transform       = require('famous/core/Transform');
    var MouseSync       = require('famous/inputs/MouseSync');
    var TouchSync       = require('famous/inputs/ScrollSync');
    var GenericSync     = require('famous/inputs/GenericSync');

    GenericSync.register({
        'mouse': MouseSync,
        'touch': TouchSync
    });

    var sync = new GenericSync(['mouse', 'touch']);
    Transitionable.registerMethod('spring', SpringTransition);
    var gridOut = new Transitionable(0);
    var gridOutTrans = {
                method: 'spring',
                dampingRatio: 0.5,
                period: 600
            };

    var context = Engine.createContext();

    var cols = 5;
    var rows = 5;
    var gridSize = Math.min(window.innerWidth, window.innerHeight) / 1.5;
    var itemSize = gridSize / (cols + 1);
    var gridItems = [];
    var transformOutArray = [itemSize / 2 - gridSize / 2,
                            (itemSize / 2 - gridSize / 2) / 2,
                            0,
                            (gridSize / 2 - itemSize / 2) / 2,
                            gridSize / 2 - itemSize / 2];

    var transformInArray = Array.prototype.slice.call(transformOutArray);
    transformInArray.reverse();
    var cameraView = new View();
    var camera = new Modifier({
        origin: [0.5, 0.5],
        align: [0.5, 0.5]
    });

    context.add(camera).add(cameraView);

    function gridItemsOut(){
        var xPos = gridOut.get() * this.transformOut.rows;
        var yPos = gridOut.get() * this.transformOut.cols;
        return Transform.translate(xPos, yPos, 0);
    }

    function createGridItems(){
        for (var r = 0; r < rows; r += 1){
            for (var c = 0; c < cols; c += 1){
               var gridItem = new Surface({
                    size: [itemSize, itemSize],
                    properties:{
                        backgroundColor: '#'+('00000'+(Math.random()*16777216<<0).toString(16)).substr(-6)
                    }
                });
               gridItem.transformOut = {rows: transformOutArray[r], cols: transformOutArray[c]};

                gridItem.mod = new Modifier({
                    origin: [0.5, 0.5],
                    align: [0.5, 0.5],
                    transform: gridItemsOut.bind(gridItem)
                });

                gridItem.idx = gridItems.length;

                cameraView.add(gridItem.mod).add(gridItem);
                gridItems.push(gridItem);
            }
        }
        gridItems[12].mod.setTransform(Transform.translate(0, 0, 100));
    }

    function colorReset(){
        for (var i = 0; i < gridItems.length; i += 1){
            gridItems[i].setProperties({
                backgroundColor: '#'+('00000'+(Math.random()*16777216<<0).toString(16)).substr(-6)
            });
        }
    }

    function transformOut(){
        gridOut.set(1, gridOutTrans);
        /*for (var i = 0; i < gridItems.length; i+=1){
            //var index = i;
            var gridItem = gridItems[i];
            var tran = Transform.translate(gridItem.transformOut.rows, gridItem.transformOut.cols);
            gridItem.mod.setTransform(tran, {
                method: 'spring',
                dampingRatio: 0.5,
                period: 600
            });
        }*/
    }

    function transformIn(){
        /*for (var j = 0; j < gridItems.length; j+=1){
            var index = j;
            var gridItem = gridItems[index];
            gridItem.mod.setTransform(Transform.identity, {
                method: 'spring',
                dampingRatio: 0.5,
                period: 600
            });
        }*/
        gridOut.set(0, gridOutTrans);
        colorReset();
    }

    createGridItems();
    transformOut();
    Engine.pipe(sync);
    gridItems[12].pipe(sync);
    sync.on('start', transformIn);
    sync.on('end', transformOut);
});



