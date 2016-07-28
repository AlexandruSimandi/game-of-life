/*
future ideas:
-cell colors change, use Math.random to change hex color of next generation in a random manner 100% will implement
-add patterns at designated point, 50/50 will implement
*/

var UIModule = (function (){

    //function for listener, starts/stops runnig game
    function _enterPressed(e){
        if(e.keyCode == 13){
            if(gameModule.isRunning() == false){
                _setContent('status',"Game is running");
                _setContent('started',"Press enter to pause")
                _setContent('Restart',"Restart")
                gameModule.run();
            }else {
                _setContent('status',"Game is paused");
                _setContent('started',"Press enter to resume");
                gameModule.pause();
            }
        }
    }

    //sets content of an element from html
    function _setContent(wrapper,text){
        document.getElementById(wrapper).innerHTML = text;
    }

    //makes possible to click a cell anytime and change alive/dead property
    function _clickCell(e){
        var mousePos = _getMousePos(e);
        var i = parseInt(mousePos.x / gameModule.getCellDiameter());
        var j = parseInt(mousePos.y / gameModule.getCellDiameter());

        gameModule.drawCell(i,j);
    }

    //gets mouse position relative to canvas, returns x,y coordiantes
    function _getMousePos(evt) {
        var rect = gameModule.getCanvas().getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }

    function _getContent(wrapper){
        return  document.getElementById(wrapper);
    }


    return {
        initialize: function(){
            window.addEventListener("keydown",_enterPressed,false);
            _getContent("Acorn").addEventListener("mousedown",gameModule.makeAcorn,false);
            _getContent("Walker").addEventListener("mousedown",gameModule.makeWalker,false);
            _getContent("Gun").addEventListener("mousedown",gameModule.makeGun,false);
            _getContent("Engine").addEventListener("mousedown",gameModule.makeEngine,false);
            _getContent("Restart").addEventListener("mousedown",gameModule.restart,false);
            gameModule.getCanvas().addEventListener("mousedown",_clickCell,false);
        },
        getContent: function(wrapper){
            return _getContent(wrapper);
        }
    };

})();

var hashModule = (function(){

    //it's a pirate!!!
    var _objectArr = [];

    var _keyMap = {};



    return {
        add: function(stringified){
            if(!_keyMap.hasOwnProperty(stringified)){
                _objectArr.push(stringified);
                _keyMap[stringified] = true;
            }
        },

        getArr: function(){
            return _objectArr;
        },

        clear: function(){
            _objectArr = [];
            _keyMap = {};
        }
    };

})();

//module used to compute and render in canvas
var gameModule  = (function () {

    //matrix size
    var _dimension;

    //canvas used in html file
    var _canvas;

    //basic cell stuff good to know for module
    var _cellDiameter;

    //canvas prop
    var _canvasDraw;
    var _canvasWidth;
    var _canvasHeight;

    //matrix for alive/dead cells and matrix to memorize changes
    var _world;
    var _changes;

    var _moduleInitialized = false;
    var _gameRunning;

    var _currentColor;


    function _getRed(color){
        var ColorHexString = color.substring(1,3);
        return parseInt(ColorHexString,16);


    }

    function _getGreen(color){
        var ColorHexString = color.substring(3,5);
        return parseInt(ColorHexString,16);

    }

    function _getBlue(color){
        var ColorHexString = color.substring(5,7);
        return parseInt(ColorHexString,16);

    }

    function _setRed(color, value){
        var noRedString = color.substring(3,7);

        var valueString = value.toString(16);

        if(valueString.length == 1){
            valueString = '0' + valueString;
        }

        return '#' + valueString + noRedString;

    }

    function _setGreen(color, value){
        var noGreenLeftString = color.substring(0,3);
        var noGreenRightString = color.substring(5,7);

        var valueString = value.toString(16);

        if(valueString.length == 1){
            valueString = '0' + valueString;
        }

        return noGreenLeftString + valueString + noGreenRightString;

    }

    function _setBlue(color, value){
        var noBlueString = color.substring(0,5);


        var valueString = value.toString(16);

        if(valueString.length == 1){
            valueString = '0' + valueString;
        }

        return noBlueString + valueString;

    }

    function _randomizeColor(){

        var newColorHexChar = _currentColor.substr(1);
        var newColorNumberHex = parseInt(newColorHexChar,16);


        //picks R, G or B
        var randomChange = parseInt(Math.random() * 3);


        //value to change picked color
        var variation = (parseInt(Math.random() * 7) - 3) * 4;

        //checks if change is in color interval

        var colorChange;


        switch(randomChange){
            //green
            case 1:
                colorChange = _getGreen(_currentColor) + variation;
                if(colorChange < 200 && colorChange > 0){
                    _currentColor = _setGreen(_currentColor, colorChange);
                } else {
                    _currentColor = _setGreen(_currentColor, colorChange - 2 * variation);
                }
                break;

            //blue
            case 2:
                colorChange = _getBlue(_currentColor) + variation;
                if(colorChange < 110 && colorChange > 0){
                    _currentColor = _setBlue(_currentColor, colorChange);
                } else {
                    _currentColor = _setBlue(_currentColor, colorChange - 2 * variation);
                }
                break;
            //red
            default:
                colorChange = _getRed(_currentColor) + variation;
                if(colorChange < 110 && colorChange > 0){
                    _currentColor = _setRed(_currentColor, colorChange);
                } else {
                    _currentColor = _setRed(_currentColor, colorChange - 2 * variation);
                }
                break;

        }

    }

    //draws cell in canvas
    function _drawCell(x,y,radius,alive){
        if(alive){
            /*
            _canvasDraw.beginPath();
            _canvasDraw.fillStyle = "#000000";
            _canvasDraw.rect(x,y,radius,radius);
            _canvasDraw.closePath();
            _canvasDraw.stroke();
            _canvasDraw.fillStyle= _currentColor;
            _canvasDraw.fill();
            */
            _canvasDraw.fillStyle = _currentColor;
            _canvasDraw.fillRect(x,y,radius,radius);
        } else _canvasDraw.clearRect(x,y,radius,radius);

    }

    //gets the cell properly in case the questioned cell is over the border
    function _getCellProperty(x, y){
        if(x>=_dimension) { x = 0; }
        if(y>=_dimension) { y = 0; }
        if(x < 0) { x = _dimension - 1; }
        if(y < 0) { y = _dimension - 1; }
        return _world[x][y];
    }

    function _getCellIndex(x, y){
        if(x>=_dimension) { x = 0; }
        if(y>=_dimension) { y = 0; }
        if(x < 0) { x = _dimension - 1; }
        if(y < 0) { y = _dimension - 1; }
        return {
            x: x,
            y: y
        };
    }

    //counts how many alive neighbors there are
    function _checkNeighbours(x,y){
        var count = 0;
        if(_getCellProperty(x-1, y-1)) count ++;
        if(_getCellProperty(x, y-1)) count ++;
        if(_getCellProperty(x+1, y-1)) count ++;
        if(_getCellProperty(x-1, y)) count ++;
        if(_getCellProperty(x+1, y)) count ++;
        if(_getCellProperty(x-1, y+1)) count ++;
        if(_getCellProperty(x, y+1)) count ++;
        if(_getCellProperty(x+1, y+1)) count ++;
        return count;
    }

    //paints only changes
    function _paintCanvas(updates){
        for(var k = 0; k < updates.length; k++){
            _drawCell(updates[k].i*_cellDiameter,updates[k].j*_cellDiameter,_cellDiameter,_world[updates[k].i][updates[k].j]);
        }
    }


    //paints #dimension vertical lines and #dimension horizontal lines
    function _paintFirstTime(){

        _canvasDraw.clearRect(0,0,_canvasWidth,_canvasHeight);

        for(var i = 0; i < _dimension; i++){
            _canvasDraw.beginPath();
            _canvasDraw.moveTo(i*_cellDiameter+1,0);
            _canvasDraw.lineTo(i*_cellDiameter+1,_canvasHeight);
            _canvasDraw.stroke();

            _canvasDraw.beginPath();
            _canvasDraw.moveTo(0,i*_cellDiameter+1);
            _canvasDraw.lineTo(_canvasWidth,i*_cellDiameter+1);
            _canvasDraw.stroke();
        }
    }




    function _placeCell(i,j){
        _world[i][j] = true;
        _addChangedNeighbours(i,j);
        _drawCell((i)*_cellDiameter,(j)*_cellDiameter,_cellDiameter,_world[i][j]);
    }



    function _addChangedNeighbours(i,j){

        var cell ;
        cell = _getCellIndex(i,j)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i-1,j-1)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i,j-1)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i+1,j-1)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i+1,j)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i+1,j+1)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i,j+1)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i-1,j+1)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));
        cell = _getCellIndex(i-1,j)
        hashModule.add(JSON.stringify({i: cell.x, j: cell.y}));


    }

    function _makeAcorn() {
        var middle = parseInt(_dimension/2);
        _placeCell(middle,middle);
        _placeCell(middle+1,middle);
        _placeCell(middle+1,middle-1);
        _placeCell(middle+2,middle);
        _placeCell(middle+2,middle+1);
    };

    function _makeGun() {
        var middle = parseInt(_dimension/2);
        _placeCell(middle-15,middle+1);
        _placeCell(middle-15,middle+2);
        _placeCell(middle-14,middle+1);
        _placeCell(middle-14,middle+2);

        _placeCell(middle-5,middle+1);
        _placeCell(middle-5,middle+2);
        _placeCell(middle-5,middle+3);
        _placeCell(middle-4,middle+4);
        _placeCell(middle-4,middle);
        _placeCell(middle-3,middle+5);
        _placeCell(middle-2,middle+5);
        _placeCell(middle-3,middle-1);
        _placeCell(middle-2,middle-1);
        _placeCell(middle-1,middle+2);
        _placeCell(middle+1,middle+2);
        _placeCell(middle+1,middle+1);
        _placeCell(middle+1,middle+3);
        _placeCell(middle+2,middle+2);
        _placeCell(middle,middle);
        _placeCell(middle,middle+4);

        _placeCell(middle+5,middle);
        _placeCell(middle+5,middle-1);
        _placeCell(middle+5,middle+1);
        _placeCell(middle+6,middle);
        _placeCell(middle+6,middle-1);
        _placeCell(middle+6,middle+1);
        _placeCell(middle+7,middle+2);
        _placeCell(middle+7,middle-2);
        _placeCell(middle+9,middle-2);
        _placeCell(middle+9,middle-3);
        _placeCell(middle+9,middle-2);
        _placeCell(middle+9,middle-3);
        _placeCell(middle+9,middle+3);
        _placeCell(middle+9,middle+2);
        _placeCell(middle+19,middle);
        _placeCell(middle+19,middle-1);
        _placeCell(middle+20,middle);
        _placeCell(middle+20,middle-1);

    };

    function _makeWalker() {
        var middle = parseInt(_dimension/2);
        _placeCell(middle,middle);
        _placeCell(middle+1,middle);
        _placeCell(middle+1,middle+1);
        _placeCell(middle+2,middle+1);
        _placeCell(middle+2,middle-1);
    }

    function _makeEngine(){
        var middle = parseInt(_dimension/2);
        _placeCell(middle-20,middle);
        _placeCell(middle-19,middle);
        _placeCell(middle-18,middle);
        _placeCell(middle-17,middle);
        _placeCell(middle-16,middle);
        _placeCell(middle-15,middle);
        _placeCell(middle-14,middle);
        _placeCell(middle-13,middle);

        _placeCell(middle-11,middle);
        _placeCell(middle-10,middle);
        _placeCell(middle-9,middle);
        _placeCell(middle-8,middle);
        _placeCell(middle-7,middle);

        _placeCell(middle-3,middle);
        _placeCell(middle-2,middle);
        _placeCell(middle-1,middle);

        _placeCell(middle+6,middle);
        _placeCell(middle+7,middle);
        _placeCell(middle+8,middle);
        _placeCell(middle+9,middle);
        _placeCell(middle+10,middle);
        _placeCell(middle+11,middle);
        _placeCell(middle+12,middle);

        _placeCell(middle+14,middle);
        _placeCell(middle+15,middle);
        _placeCell(middle+16,middle);
        _placeCell(middle+17,middle);
        _placeCell(middle+18,middle);
    }

    //looping function that computes and renders next generation in game, stops/stars running based on bool gameRunning modified by enterPressed
    function _playGeneration(){
        if(_gameRunning){

            _changes = hashModule.getArr();

            var _newChanges = [];
            var _worldChanges = [];

            for(var k = 0; k < _changes.length; k++){
                var cell = JSON.parse(_changes[k]);

                var lifeScore = _checkNeighbours(cell.i,cell.j);

                if (_world[cell.i][cell.j]) {
                    if(lifeScore  == 2 || lifeScore == 3) {
                        _worldChanges.push({i: cell.i, j: cell.j, value: true});
                    } else {
                        _worldChanges.push({i: cell.i, j: cell.j, value: false});
                    }
                } else if(lifeScore == 3) {
                    _worldChanges.push({i: cell.i, j: cell.j, value: true});
                }
                else {
                   _worldChanges.push({i: cell.i, j: cell.j, value: false});
                }

                if(_world[cell.i][cell.j] != _worldChanges[_worldChanges.length-1].value){
                    _newChanges.push({i: cell.i, j: cell.j});
                }

            }


            //clear set
            hashModule.clear();

            //update world
            for(var k = 0; k < _worldChanges.length; k++){
                _world[_worldChanges[k].i][_worldChanges[k].j] = _worldChanges[k].value;

                if(_worldChanges[k].value){
                    _addChangedNeighbours(_worldChanges[k].i,_worldChanges[k].j);
                }
            }

            _paintCanvas(_newChanges);
            _randomizeColor();

            var x = setTimeout(function() {_playGeneration();}, 0);

        }
    }

    function _resetGame(){
        _dimension = parseInt(UIModule.getContent("dimension").value);
        _cellDiameter = _canvasWidth/(_dimension);

        hashModule.clear();

        _currentColor = "#00dd00";

        for(var i = 0; i < _dimension; i++){
            _world[i] = [];
            for(var j = 0; j < _dimension; j++){
                _world[i][j] = false;
            }
        }
    }



    return {
        //initializes everything only once
        initialize: function(){
            if(_moduleInitialized == false){
                _moduleInitialized = true;

                _canvas = document.getElementById("main");

                _currentColor = "#00dd00";


                _canvasDraw = _canvas.getContext("2d");
                _canvasDraw.lineWidth = 0.5;

                _canvasWidth = _canvas.width;
                _canvasHeight = _canvas.height;

                _world = [];
                _changes = [];
                _gameRunning = false;


            }
        },
        run: function (){
            _gameRunning = true;

            _playGeneration();
        },
        pause: function(){
            _gameRunning = false;

        },
        restart: function(){
            _gameRunning = false;
            _resetGame();
            _paintFirstTime();

        },
        isRunning: function(){
            return _gameRunning;
        },
        makeAcorn: function(){
            _makeAcorn();
        },
        makeGun: function(){
            _makeGun();
        },
        makeWalker: function(){
            _makeWalker();
        },
        makeEngine: function(){
            _makeEngine();
        },
        getCanvas: function(){
            return _canvas;
        },
        drawCell: function(i,j){
            if(_world[i][j]){
                _world[i][j] = false;
            } else {
                _world[i][j] = true;
            }
            _addChangedNeighbours(i,j);
            _drawCell(i*_cellDiameter,j*_cellDiameter,_cellDiameter,_world[i][j]);
        },
        getCanvas: function(){
            return _canvas;
        },
        getCellDiameter: function(){
            return _cellDiameter;
        }

    };

})();

