import Core from 'checheza_core';

import PIXI from 'expose-loader?PIXI!phaser-ce/build/custom/pixi.js';
import p2 from 'expose-loader?p2!phaser-ce/build/custom/p2.js';
import Phaser from 'expose-loader?Phaser!phaser-ce/build/custom/phaser-split.js';

import GoodSound from '../assets/good.wav';

import memory_background from '../assets/memory_background.png';
import cards_lvl1 from '../assets/memory_cards_lvl1.png';
import cards_lvl2 from '../assets/memory_cards_lvl2.png';
import cards_lvl3 from '../assets/memory_cards_lvl3.png';
import cards_lvl4 from '../assets/memory_cards_lvl4.png';
import cards_lvl5 from '../assets/memory_cards_lvl5.png';
import cards_lvl6 from '../assets/memory_cards_lvl6.png';
import cards_lvl7 from '../assets/memory_cards_lvl7.png';
import cards_lvl8 from '../assets/memory_cards_lvl8.png';


class MainDomain {
    constructor(widget) { 
        this.widget = widget;
    }

    // method called after render, add logics, event listeners etc. here
    start() {
        this.game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, 'game', { create: this.create });
               // Add exit button
		Core.utils.addExitButton();
    }

    create() {
        this.game.state.add("1", new Level(this, 1, 2, 100, 10, 2, 1, "2"));
        this.game.state.add("2", new Level(this, 2, 2, 100, 8, 1.4, 2, "3"));
        this.game.state.add("3", new Level(this, 2, 3, 100, 8, 1.4, 3, "4"));
        this.game.state.add("4", new Level(this, 2, 5, 100, 4, 1.0, 5, "5"));
        this.game.state.add("5", new Level(this, 4, 4, 100, 4, 0.7, 8, "6"));
        this.game.state.add("6", new Level(this, 4, 6, 100, 4, 0.7, 12, "7"));
        this.game.state.add("7", new Level(this, 5, 5, 100, 2, 0.5, 16, "8"));
        this.game.state.add("8", new Level(this, 5, 8, 100, 2, 0.5, 20, "1"));

        this.game.state.start("1");
    }

    // return markup here.
    render() { 
        return `<div style="width:100vw; height:100vh;" id="game"></div>`
    }
}

export default MainDomain;

class Level {
    constructor(memory, cols, rows, tileSize, tileSpacing, tileScaling, frame, nextLevel) {
        this.frame = frame;
        this.cols = cols;
        this.rows = rows;
        this.game = memory.game;
        this.nextLevel = nextLevel;
        this.tileSize = tileSize
        this.tileSpacing = tileSpacing;
        this.tileScaling = tileScaling ;
        this.tilesLeft = rows * cols;
        this.lastTile = rows * cols;
        this.tilesArray = [];
        this.selectedArray = [];
        this.timeLeft = 0;
        this.sound;
        this.cards = memory.cards;
    }

    scaleFactor() {
        return ( (this.tileSize + this.tileSpacing * rows) / this.game.width )
    }

    preload() {
        let cardTiles = null;

        switch(this.game.state.current) {
            case "1":
                cardTiles = cards_lvl1;
                break;
            case "2":
                cardTiles = cards_lvl2;
                break;
            case "3":
                cardTiles = cards_lvl3;
                break;
            case "4":
                cardTiles = cards_lvl4;
                break;
            case "5":
                cardTiles = cards_lvl5;
                break;
            case "6":
                cardTiles = cards_lvl6;
                break;
            case "7":
                cardTiles = cards_lvl7;
                break;
            case "8":
                cardTiles = cards_lvl8;
                break;
        }



        this.game.load.spritesheet("tiles", cardTiles, this.tileSize, this.tileSize);
        this.game.load.audio("pair", GoodSound);
        this.game.load.image("background", memory_background);
    }

    create() {
        this.sound = this.game.add.audio("pair");
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.pageAlignHorizontally = true;
        this.game.add.tileSprite(0, 0, this.game.width, this.game.height, 'background');
        this.placeTiles(this.cols, this.rows);
    }

    /*
        returns a scale factor
    */
    checkSize(numRows, numCols, tileSize, tileSpacing) {
        return (( numCols * tileSize + numCols * tileSpacing ) / this.game.width) + 1;
    }

    placeTiles(numRows, numCols) {
        var numRows = numRows;
        var numCols = numCols;
        let tileSize = this.tileSize;
        let tileSpacing = this.tileSpacing;
        var leftSpace = (this.game.width - (numCols * (tileSize * this.tileScaling)) - tileSpacing) / 2;
        var topSpace = (this.game.height - (numRows * (tileSize * this.tileScaling)) - tileSpacing) / 2;


        for (var i = 0; i < numRows * numCols; i++) {
            this.tilesArray.push(Math.floor(i / 2));
        }

        for (i = 0; i < numRows * numCols; i++) {
            var from = this.game.rnd.between(0, this.tilesArray.length - 1);
            var to = this.game.rnd.between(0, this.tilesArray.length - 1);
            var temp = this.tilesArray[from];
            this.tilesArray[from] = this.tilesArray[to];
            this.tilesArray[to] = temp;
        }

        for (i = 0; i < numCols; i++) {
            for (var j = 0; j < numRows; j++) {
                var tile = this.game.add.button(leftSpace + i * ((this.tileSize * this.tileScaling)  + tileSpacing), topSpace + j * ((this.tileSize * this.tileScaling) + tileSpacing), "tiles", this.showTile, this);
                tile.scale.setTo(this.tileScaling, this.tileScaling);
                tile.frame = this.frame;
                tile.value = this.tilesArray[j * numCols + i];
            }
        }
    }


    showTile(target) {
        if (this.selectedArray.length < 2 && this.selectedArray.indexOf(target) == -1) {
            target.frame = target.value;
            this.selectedArray.push(target);
            if (this.selectedArray.length == 2) {
                this.game.time.events.add(Phaser.Timer.SECOND, this.checkTiles, this);
            }
        }
    }

    checkTiles() {
        if (this.selectedArray[0].value == this.selectedArray[1].value) {
            this.sound.play();
            this.selectedArray[0].destroy();
            this.selectedArray[1].destroy();
            this.tilesLeft -= 2;

            if (this.tilesLeft <= 0) {
                this.tilesArray.length = 0;
                this.selectedArray.length = 0;
                if(this.nextLevel == "1") {
                    core.startWidget("checheza.main.treehouse");
                } else {
                    this.game.state.start(this.nextLevel);
                }
            }
        }
        else {
            this.selectedArray[0].frame = this.frame;
            this.selectedArray[1].frame = this.frame;
        }
        this.selectedArray.length = 0;
    }
}