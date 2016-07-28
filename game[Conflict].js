var UIModule = (function (){

    //function for listener, starts/stops runnig game
    function enterPressed(e){
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
            window.addEventListener("keydown",enterPressed,false);
            document.getElementById("Acorn").addEventListener("mousedown",gameModule.makeAcorn,false);
            document.getElementById("Restart").addEventListener("mousedown",gameModule.restart,false);
            gameModule.getCanvas().addEventListener("mousedown",_clickCell,false);
        },
        getContent(wrapper){
            return  document.getElementById(wrapper).innerHTML;
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

    //todo, paint only changes
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




    //places "acorn" shape on screen
    //TODO make nicer
    function _makeAcorn() {
        var middle = parseInt(_dimension/2);
        _world[middle][middle] = true;
        _drawCell((middle)*_cellDiameter+1,(middle)*_cellDiameter+1,_cellDiameter,_world[middle][middle]);
        _world[middle + 1][middle] = true;
        _drawCell((middle + 1)*_cellDiameter+1,(middle)*_cellDiameter+1,_cellDiameter,_world[middle + 1][middle]);
        _world[middle + 1][middle - 1] = true;
        _drawCell((middle + 1)*_cellDiameter+1,(middle - 1)*_cellDiameter+1,_cellDiameter,_world[middle + 1][middle - 1]);
        _world[middle + 2][middle] = true;
        _drawCell((middle + 2)*_cellDiameter+1,(middle)*_cellDiameter+1,_cellDiameter,_world[middle + 2][middle]);
        _world[middle + 2][middle + 1] = true;
        _drawCell((middle + 2)*_cellDiameter+1,(middle + 1)*_cellDiameter+1,_cellDiameter,_world[middle + 2][middle + 1]);
    };

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
        _dimension = parseInt(window.prompt("enter matrix size"));
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
                _dimension = parseInt(window.prompt("enter matrix size"));

                _canvas = document.getElementById("main");

                _cellMargin = 0;
                _cellDiameter = _canvas.width/(_dimension + _cellMargin);


                _canvasDraw = _canvas.getContext("2d");
                _canvasDraw.lineWidth = 0.5;

                _canvasWidth = _canvas.width;
                _canvasHeight = _canvas.height;

                _world = [];
                _changes = [];

                for(var i = 0; i < _dimension; i++){
                    _world[i] = [];
                    _changes[i] = [];
                    for(var j = 0; j < _dimension; j++){
                        _world[i][j] = false;
                        _changes[i][j] = false;
                    }
                }

                _gameRunning = false;

                //builds first time every cell
                //_paintCanvas();
                _paintFirstTime();



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
    UIModule.initialize();
};





/*$(function(){
    var dimension = 45;

    var world[dimension][dimension];

    var chanceOfLiveCell = 0.5;

    var table;
    var cells;
    var stillPlacing = true;
    var generations = 0;
    var stillAlive = false;

	table = $('#main');
	initializeGame();
	cells = table.find('td');
	placeCells();
	document.getElementById("Restart").onclick = function () {
		restartGame();
		generations=0;
		document.getElementById("generations").innerHTML= "";
		$("#Restart").blur();
	};
	document.getElementById("Randomize").onclick = function () {
		placeRandomCells();
		generations=0;
		document.getElementById("generations").innerHTML= "";
		$("#Randomize").blur();
	};
	document.getElementById("Walker").onclick = function () {
		restartGame();
		makeWalker();
		generations=0;
		document.getElementById("generations").innerHTML= "";
		$("#Walker").blur();
	};
	document.getElementById("Acorn").onclick = function () {
		restartGame();
		makeAcorn();
		generations=0;
		document.getElementById("generations").innerHTML= "";
		$("#Acorn").blur();
	};
	document.getElementById("Pulsar").onclick = function () {
		restartGame();
		makePulsar();
		generations=0;
		document.getElementById("generations").innerHTML= "";
		$("#Pulsar").blur();
	};
	document.getElementById("Gun").onclick = function () {
		restartGame();
		makeGun();
		generations=0;
		document.getElementById("generations").innerHTML= "";
		$("#Gun").blur();
	};

function makeGun() {
	var cell;
	//left cube
	cell = getCell(2,18);
	cell.addClass('alive');
	cell = getCell(2,19);
	cell.addClass('alive');
	cell = getCell(3,18);
	cell.addClass('alive');
	cell = getCell(3,19);
	cell.addClass('alive');
	//left gun
	cell = getCell(12,18);
	cell.addClass('alive');
	cell = getCell(12,19);
	cell.addClass('alive');
	cell = getCell(12,20);
	cell.addClass('alive');
	cell = getCell(13,21);
	cell.addClass('alive');
	cell = getCell(13,17);
	cell.addClass('alive');
	cell = getCell(14,22);
	cell.addClass('alive');
	cell = getCell(15,22);
	cell.addClass('alive');
	cell = getCell(14,16);
	cell.addClass('alive');
	cell = getCell(15,16);
	cell.addClass('alive');
	cell = getCell(16,19);
	cell.addClass('alive');
	cell = getCell(18,19);
	cell.addClass('alive');
	cell = getCell(18,18);
	cell.addClass('alive');
	cell = getCell(18,20);
	cell.addClass('alive');
	cell = getCell(19,19);
	cell.addClass('alive');
	cell = getCell(17,17);
	cell.addClass('alive');
	cell = getCell(17,21);
	cell.addClass('alive');
	//right glider
	cell = getCell(22,17);
	cell.addClass('alive');
	cell = getCell(22,16);
	cell.addClass('alive');
	cell = getCell(22,18);
	cell.addClass('alive');
	cell = getCell(23,17);
	cell.addClass('alive');
	cell = getCell(23,16);
	cell.addClass('alive');
	cell = getCell(23,18);
	cell.addClass('alive');
	cell = getCell(24,19);
	cell.addClass('alive');
	cell = getCell(24,15);
	cell.addClass('alive');
	cell = getCell(26,15);
	cell.addClass('alive');
	cell = getCell(26,14);
	cell.addClass('alive');
	cell = getCell(26,15);
	cell.addClass('alive');
	cell = getCell(26,14);
	cell.addClass('alive');
	cell = getCell(26,20);
	cell.addClass('alive');
	cell = getCell(26,19);
	cell.addClass('alive');
	cell = getCell(36,17);
	cell.addClass('alive');
	cell = getCell(36,16);
	cell.addClass('alive');
	cell = getCell(37,17);
	cell.addClass('alive');
	cell = getCell(37,16);
	cell.addClass('alive');

};
function makePulsar() {
	var cell;
	cell = getCell(18, 18);
	cell.addClass('alive');
	cell = getCell(17, 18);
	cell.addClass('alive');
	cell = getCell(16, 18);
	cell.addClass('alive');
	cell = getCell(19, 17);
	cell.addClass('alive');
	cell = getCell(19, 16);
	cell.addClass('alive');
	cell = getCell(19, 15);
	cell.addClass('alive');
	cell = getCell(14, 17);
	cell.addClass('alive');
	cell = getCell(14, 16);
	cell.addClass('alive');
	cell = getCell(14, 15);
	cell.addClass('alive');
	cell = getCell(18, 13);
	cell.addClass('alive');
	cell = getCell(17, 13);
	cell.addClass('alive');
	cell = getCell(16, 13);
	cell.addClass('alive');

	cell = getCell(24, 18);
	cell.addClass('alive');
	cell = getCell(23, 18);
	cell.addClass('alive');
	cell = getCell(22, 18);
	cell.addClass('alive');
	cell = getCell(26, 17);
	cell.addClass('alive');
	cell = getCell(26, 16);
	cell.addClass('alive');
	cell = getCell(26, 15);
	cell.addClass('alive');
	cell = getCell(21, 17);
	cell.addClass('alive');
	cell = getCell(21, 16);
	cell.addClass('alive');
	cell = getCell(21, 15);
	cell.addClass('alive');
	cell = getCell(24, 13);
	cell.addClass('alive');
	cell = getCell(23, 13);
	cell.addClass('alive');
	cell = getCell(22, 13);
	cell.addClass('alive');

	cell = getCell(24, 25);
	cell.addClass('alive');
	cell = getCell(23, 25);
	cell.addClass('alive');
	cell = getCell(22, 25);
	cell.addClass('alive');
	cell = getCell(26, 23);
	cell.addClass('alive');
	cell = getCell(26, 22);
	cell.addClass('alive');
	cell = getCell(26, 21);
	cell.addClass('alive');
	cell = getCell(21, 23);
	cell.addClass('alive');
	cell = getCell(21, 22);
	cell.addClass('alive');
	cell = getCell(21, 21);
	cell.addClass('alive');
	cell = getCell(24, 20);
	cell.addClass('alive');
	cell = getCell(23, 20);
	cell.addClass('alive');
	cell = getCell(22, 20);
	cell.addClass('alive');

	cell = getCell(17, 25);
	cell.addClass('alive');
	cell = getCell(18, 25);
	cell.addClass('alive');
	cell = getCell(16, 25);
	cell.addClass('alive');
	cell = getCell(19, 23);
	cell.addClass('alive');
	cell = getCell(19, 22);
	cell.addClass('alive');
	cell = getCell(19, 21);
	cell.addClass('alive');
	cell = getCell(14, 23);
	cell.addClass('alive');
	cell = getCell(14, 22);
	cell.addClass('alive');
	cell = getCell(14, 21);
	cell.addClass('alive');
	cell = getCell(18, 20);
	cell.addClass('alive');
	cell = getCell(17, 20);
	cell.addClass('alive');
	cell = getCell(16, 20);
	cell.addClass('alive');
};
function makeAcorn() {
	var cell;
	cell = getCell(20, 20);
	cell.addClass('alive');
	cell = getCell(21, 20);
	cell.addClass('alive');
	cell = getCell(21, 19);
	cell.addClass('alive');
	cell = getCell(22, 20);
	cell.addClass('alive');
	cell = getCell(22,21);
	cell.addClass('alive');
};
function makeWalker() {
	var cell;
	cell = getCell(20, 20);
	cell.addClass('alive');
	cell = getCell(21,20);
	cell.addClass('alive');
	cell = getCell(21,21);
	cell.addClass('alive');
	cell = getCell(22,21);
	cell.addClass('alive');
	cell = getCell(22,19);
	cell.addClass('alive');
}

function restartGame(){
	for(var i=0;i<dimension;i++){
		for(var j=0; j<dimension;j++){
			cell = getCell(i, j);
			cell.removeClass('alive');
		}
	}
	stillPlacing = true;
	document.getElementById('status').innerHTML = "Game is paused ";
}


function placeCells(){
	$("td").click(function (e) {
			if($(this).hasClass('alive')){
				$(this).removeClass('alive');
			}
			else
			{
				$(this).addClass('alive');
			}
	});
	$(document).keydown(function (e){
			if(e.keyCode== 13){
				if(stillPlacing){
					stillPlacing = false;
					document.getElementById('status').innerHTML = "Game is running ";
					document.getElementById('started').innerHTML = "Press enter to pause or resume game";
					playGame();
				} else{
					stillPlacing = true;
					document.getElementById('status').innerHTML = "Game is paused ";
				}
			}
	});
}

function initializeGame(){
	var trHtml = [];
	for (var y=0; y < dimension; y++){
		for(var x=0; x < dimension; x++){
			trHtml.push('<tr>');
			for(var x = 0 ; x < dimension; x++){
				trHtml.push('<td></td>');  // &nbsp
			}
			trHtml.push('<tr>');
		}
	}
	trHtml = trHtml.join( ' ' );
	table.append($(trHtml));
}


function placeRandomCells(){
	for (var y=0; y < dimension; y++){
		for(var x=0; x < dimension; x++){
			var cell = getCell(x, y);
			if (Math.random() > chanceOfLiveCell) {cell.addClass('alive');}
			else {cell.removeClass('alive'); }
		}
	}
}

function playGame() {
	playGeneration();
}

function playGeneration(){
	if(stillPlacing == false){
		document.getElementById("generations").innerHTML = "Number of generations your pattern survived " + generations;
		generations++;
		prepareNextGeneration();
		renderNextGeneration();
		var x=setTimeout(function(){playGeneration();},1);
	}
	else {
		clearTimeout(x);
	}
}

function prepareNextGeneration() {
	stillAlive = false;
	for (var y=0; y < dimension; y++){
		for(var x=0; x < dimension; x++){
			var cell = getCell(x, y);
			var neighbours = getLiveNeighbourCount(x, y);
			cell.attr('isalive', 'false');
			if ( isCellAlive(x, y) ) {
				stillAlive = true;
				if(neighbours  === 2 || neighbours === 3) {
					cell.attr('isalive', 'true');
				}
			} else if(neighbours === 3) {
				cell.attr('isalive' , 'true');
			}
		}
	}
	if( stillAlive === false ){
		stillPlacing=true;
	}
}

function renderNextGeneration() {
	cells.each(function () {
		var cell = $(this);
		cell.removeClass('alive');
		if (cell.attr('isalive') === 'true'){
			cell.addClass('alive');
			stillAlive = true;
		}
			cell.removeAttr('isalive');
	});
}

function getLiveNeighbourCount(x, y) {
	var count =0;
	if(isCellAlive(x-1, y-1)) count ++;
	if(isCellAlive(x, y-1)) count ++;
	if(isCellAlive(x+1, y-1)) count ++;
	if(isCellAlive(x-1, y)) count ++;
	if(isCellAlive(x+1, y)) count ++;
	if(isCellAlive(x-1, y+1)) count ++;
	if(isCellAlive(x, y+1)) count ++;
	if(isCellAlive(x+1, y+1)) count ++;
	return count;
}

function isCellAlive(x ,y) {
	return getCell(x ,y).attr('class') === 'alive' ;
}
function getCell(x, y){
	if(x>=dimension) { x = 0; }
	if(y>=dimension) { y = 0; }
	if(x < 0) { x = dimension-1; }
	if(y < 0) { y = dimension-1; }
	return $(cells[y * dimension + x]);
}
});
*/
