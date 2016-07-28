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

    
    return {
        initialize: function(){
            window.addEventListener("keydown",_enterPressed,false);
            document.getElementById("Acorn").addEventListener("mousedown",gameModule.makeAcorn,false);
            document.getElementById("Walker").addEventListener("mousedown",gameModule.makeWalker,false);
            document.getElementById("Gun").addEventListener("mousedown",gameModule.makeGun,false);
            document.getElementById("Engine").addEventListener("mousedown",gameModule.makeEngine,false);
            document.getElementById("Restart").addEventListener("mousedown",gameModule.restart,false);
            gameModule.getCanvas().addEventListener("mousedown",_clickCell,false);
        },
        getContent: function(wrapper){
            return  document.getElementById(wrapper);
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
    var _cellMargin;
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

    //draws cell in canvas
    function _drawCell(x,y,radius,alive){
        _canvasDraw.beginPath();
        _canvasDraw.fillStyle = "#000000";
        _canvasDraw.rect(x,y,radius,radius);
        _canvasDraw.closePath();
        _canvasDraw.stroke();
        if(alive){
            _canvasDraw.fillStyle="green";

        } else _canvasDraw.fillStyle="white";
        _canvasDraw.fill();
    }

    //gets the cell properly in case the questioned cell is over the border
    function _getCell(x, y){
        if(x>=_dimension) { x = 0; }
        if(y>=_dimension) { y = 0; }
        if(x < 0) { x = _dimension - 1; }
        if(y < 0) { y = _dimension - 1; }
        return _world[x][y];
    }

    //counts how many alive neighbors there are
    function _checkNeighbours(x,y){
        var count = 0;
        if(_getCell(x-1, y-1)) count ++;
        if(_getCell(x, y-1)) count ++;
        if(_getCell(x+1, y-1)) count ++;
        if(_getCell(x-1, y)) count ++;
        if(_getCell(x+1, y)) count ++;
        if(_getCell(x-1, y+1)) count ++;
        if(_getCell(x, y+1)) count ++;
        if(_getCell(x+1, y+1)) count ++;
        return count;
    }

    //paints only changes
    function _paintCanvas(){
        for(var i = 0; i < _dimension; i++){
            for(var j = 0; j < _dimension; j++){
                if(_changes[i][j]){
                    _drawCell(i*_cellDiameter+1,j*_cellDiameter+1,_cellDiameter,_world[i][j]);
                }
            }
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
        _drawCell((i)*_cellDiameter+1,(j)*_cellDiameter+1,_cellDiameter,_world[i][j]);
    }
    


    //places "acorn" shape on screen
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
            var worldTemp = [];
            for(var i = 0; i < _dimension; i++){
                worldTemp[i] = [];
                var lifeScore;
                for(var j = 0; j < _dimension; j++){
                    lifeScore = _checkNeighbours(i,j);
                    if (_world[i][j]) {
                        if(lifeScore  == 2 || lifeScore == 3) {
                            worldTemp[i][j] = true;
                        } else {
                            worldTemp[i][j] = false;
                        }
                    } else if(lifeScore == 3) {
                        worldTemp[i][j] = true;
                    }else {
                       worldTemp[i][j] = false;   
                    }
                    if(_world[i][j] != worldTemp[i][j]){
                        _changes[i][j] = true;
                    } else _changes[i][j] = false;
                }

            }
            _world = worldTemp;
            _paintCanvas();
            var x = setTimeout(function() {_playGeneration();}, 1);
        }
    }
    
    function _resetGame(){
        _dimension = parseInt(UIModule.getContent("dimension").value);
        _cellDiameter = _canvasWidth/(_dimension + _cellMargin);
        
        for(var i = 0; i < _dimension; i++){
            _world[i] = [];
            _changes[i] = [];
            for(var j = 0; j < _dimension; j++){
                _world[i][j] = false;
                _changes[i][j] = false;
            }
        }
    }



    return {
        //initializes everything only once
        initialize: function(){
            if(_moduleInitialized == false){
                _moduleInitialized = true;
                //_dimension = parseInt(window.prompt("enter matrix size"));

                _canvas = document.getElementById("main");

                _cellMargin = 0;
                //_cellDiameter = _canvas.width/(_dimension + _cellMargin);


                _canvasDraw = _canvas.getContext("2d");
                _canvasDraw.lineWidth = 0.5;

                _canvasWidth = _canvas.width;
                _canvasHeight = _canvas.height;

                _world = [];
                _changes = [];
                /*
                for(var i = 0; i < _dimension; i++){
                    _world[i] = [];
                    _changes[i] = [];
                    for(var j = 0; j < _dimension; j++){
                        _world[i][j] = false;
                        _changes[i][j] = false;
                    }
                }
                */
                _gameRunning = false;

                //builds first time every cell
                //_paintCanvas();
                //_paintFirstTime();



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
            _drawCell(i*_cellDiameter+1,j*_cellDiameter+1,_cellDiameter,_world[i][j]);
        },
        getCanvas: function(){
            return _canvas;
        },
        getCellDiameter: function(){
            return _cellDiameter;   
        }

    };

})();




window.onload = function(){
    gameModule.initialize();
    gameModule.restart();
    UIModule.initialize();
};