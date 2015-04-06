window.onload = function(){
    
    
    
    var dimension = parseInt(window.prompt("enter matrix size"));
    
    var canvas = document.getElementById("main");
    
    var cellMargin = 0;
    var cellRadius = canvas.width/(dimension + cellMargin);
    var cellDiameter = cellRadius*2;
   
    
    var canvasDraw = canvas.getContext("2d");
    canvasDraw.lineWidth = 0.5;
      
    
    var canvasWidth = canvas.width;
    var canvasHeight = canvas.height;
    
    
   
    var world = [];
    var changes = [];
    
    for(var i = 0; i < dimension; i++){
        world[i] = [];
        changes[i] = [];
        for(var j = 0; j < dimension; j++){
            world[i][j] = false; 
            changes[i][j] = true;
        }
    }
    
    
    //draws cell in canvas
    var drawCell = function(x,y,radius,alive){
        //canvasDraw.clearRect(x,y,radius,radius);
        canvasDraw.beginPath();
        canvasDraw.fillStyle = "#000000";
        //canvasDraw.arc(x,y,radius,0,2*Math.PI);
        canvasDraw.rect(x,y,radius,radius);
        canvasDraw.closePath();
        canvasDraw.stroke();
        if(alive){
            canvasDraw.fillStyle="green";
            
        } else canvasDraw.fillStyle="white";
        canvasDraw.fill();
    }
    
    //gets the cell properly in case the questioned cell is over the border
    var getCell = function(x, y){
        if(x>=dimension) { x = 0; }
        if(y>=dimension) { y = 0; }
        if(x < 0) { x = dimension - 1; }
        if(y < 0) { y = dimension - 1; }
        return world[x][y];
    }
    
    //counts how many alive neighbors there are
    var checkNeighbours = function (x,y){
        var count = 0;
        if(getCell(x-1, y-1)) count ++;
        if(getCell(x, y-1)) count ++;
        if(getCell(x+1, y-1)) count ++;
        if(getCell(x-1, y)) count ++;
        if(getCell(x+1, y)) count ++;
        if(getCell(x-1, y+1)) count ++;
        if(getCell(x, y+1)) count ++;
        if(getCell(x+1, y+1)) count ++;
        return count;
    }


    //builds first time every cell
    paintCanvas();
    
    
    //todo, paint only changes
    function paintCanvas(){
        for(var i = 0; i < dimension; i++){
            for(var j = 0; j < dimension; j++){
                if(changes[i][j])
                drawCell(i*cellRadius+1,j*cellRadius+1,cellRadius,world[i][j]);
            }
        }
    }
    
    canvas.addEventListener("mousedown",clickCell,false);
    window.addEventListener("keydown",startGame,false);
    
    function clickCell(e){
        var mousePos = getMousePos(canvas,e);
        var i = parseInt(mousePos.x / cellRadius);
        var j = parseInt(mousePos.y / cellRadius);
        
        if(world[i][j]){
            world[i][j] = false;   
        } else world[i][j] = true;
        
        drawCell(i*cellRadius+1,j*cellRadius+1,cellRadius,world[i][j]);
    }
    
    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
    }
    
    
    function startGame(e){
        
        
        
        if(e.keyCode == 13){
            
            
            playGeneration();
        }
        
    }
    
    document.getElementById("Acorn").addEventListener("mousedown",makeAcorn,false);
    
    function makeAcorn() {
        world[20][20] = true;
        drawCell(20*cellRadius+1,20*cellRadius+1,cellRadius,world[20][20]);
        world[21][20] = true;
        drawCell(21*cellRadius+1,20*cellRadius+1,cellRadius,world[21][20]);
        world[21][19] = true;
        drawCell(21*cellRadius+1,19*cellRadius+1,cellRadius,world[21][19]);
        world[22][20] = true;
        drawCell(22*cellRadius+1,20*cellRadius+1,cellRadius,world[22][20]);
        world[22][21] = true;
        drawCell(22*cellRadius+1,21*cellRadius+1,cellRadius,world[22][21]);
    };
    
    var playGeneration = function(){
        //clearCanvas();
        //canvasDraw.clearRect ( 0 , 0 , canvas.width, canvas.height );
        var worldTemp = [];
    
        for(var i = 0; i < dimension; i++){
            worldTemp[i] = [];
            var lifeScore;
            for(var j = 0; j < dimension; j++){
                lifeScore = checkNeighbours(i,j);
                if (world[i][j]) {
                    if(lifeScore  == 2 || lifeScore == 3) {
                        worldTemp[i][j] = true;
                    } else {
                        worldTemp[i][j] = false;
                    }
                } else if(lifeScore == 3) {
                    worldTemp[i][j] = true;
                }
                if(world[i][j] != worldTemp[i][j]){
                    changes[i][j] = true;
                } else changes[i][j] = false;
            }
            
        }
        world = worldTemp;
        paintCanvas();
        var x = setTimeout(function() {playGeneration();}, 1);
        
    }
    
    
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