(function() {

	'use strict';

	var bird,
		birdImage = new Image(),
		blockImage = new Image(),
		blocks = [],
		canvas,
		clouds = [],
		cloudsImages = ["small-cloud.png", "medium-cloud.png", "big-cloud.png"],
		ctx,
		gameScore,
		gameSpeed = 2,
		gameStartStatus = false,
		gravity = 0.18,
		keypressed = false,
		endGameSound = document.createElement("audio"),
		gameContainer = document.getElementsByClassName("game-container")[0],
		jumpSound = document.createElement("audio"),
		menu = document.getElementsByClassName("menu")[0],
		requestAnim,
		scoreSvg = document.createElement("svg"),
		scoreText = document.createElement("text"),
		scoreTextNode = document.createTextNode(''),
		select = document.getElementsByTagName('input'),
		startButton = document.getElementById("start");

	birdImage.src = "bird.png";
	blockImage.src = "brick.png";
	endGameSound.src = "end-game.mp3";
	jumpSound.src = "jump.mp3";

	scoreSvg.setAttribute('width', '1000');
	scoreSvg.setAttribute('height', '250');
	scoreSvg.className = "game-score";
	scoreText.style.fontSize = "25px";
	scoreText.setAttributeNS(null,"x",0);     
	scoreText.setAttributeNS(null,"y",0); 
	scoreText.appendChild(scoreTextNode);
	scoreSvg.appendChild(scoreText);

	for(let i = 0; i < select.length; i++) {
		select[i].onclick = function() {
			gravity = 0.2;
			gameSpeed = Math.max(3, i + 3);
			startButton.disabled = false;
			gravity += (Math.pow(2, gameSpeed - 2) / 100 + 0.02 * (gameSpeed - 3));
		}
	}

	class Bird {
		constructor(x, y) {
		    this.x = x;
		    this.y = y;
		    this.velocity = 0;
		    this.image = birdImage;
		    this.lives = 1;
		}

		draw() {
			ctx.drawImage(this.image, this.x, this.y);
		}

		update() {
			if(this.y + this.velocity + 40 >= 300) {
		        this.velocity = 0;
		        this.y = 260;
		    } else {
	    		this.velocity += gravity;
	        	this.y += this.velocity;
		    }
		}

		jump() {
			this.draw();
			if (keypressed && !bird.velocity) {
		        bird.velocity = -6;
		        keypressed = false;
		    }
			this.update();
		}
	}

	class Cloud {
		constructor(x, y, cloudImage) {
			this.x = x;
			this.y = y;
			this.velocity = 0;
			this.outOfMap = false;
			this.image = cloudImage;
		}

		draw() {
			ctx.drawImage(this.image, this.x, this.y);
		}

		update() {
			this.velocity += gameSpeed;
			this.x -= gameSpeed;
			if(this.x <= -4 && this.outOfMap === false) {
				this.outOfMap = true;
				addNewCloud();
			}
			if(clouds[0].x <= -400) {
				clouds.shift();
			}
		}

		move() {
			this.draw();
			this.update();
		}
	}

	class Block {
		constructor(x, y) {
			this.x = x;
			this.y = y;
			this.velocity = gameSpeed;
			this.image = blockImage;
			this.outOfMap = false;
			this.passedBlock = false;
		}

		draw() {
			ctx.drawImage(this.image, this.x, this.y);
		}

		update() {
			this.x -= this.velocity;
			if(gameScore && gameScore % 15 === 0) {
				this.velocity += 0.01;
			}
			if(birdCollide(this)) {
				console.log("Colission");
				bird.lives = 0;
			}

			if(this.x + 32 < bird.x && !this.passedBlock) {
				gameScore += 1;
				scoreTextNode.nodeValue = gameScore + ' points';
				this.passedBlock = true;
			}

			if(this.x <= -4 && this.outOfMap === false) {
				this.outOfMap = true;
				addNewBlock();
			}

			if(blocks.length && blocks[0].x <= -400) {
				blocks.shift();
			}
		}

		move() {
			this.draw();
			this.update();
		}
	}

	function moveClouds() {
		for(var i = 0; i < clouds.length; i++) {
			clouds[i].move();
		}
	}

	function moveBlocks() {
		for(var i = 0; i < blocks.length; i++) {
			blocks[i].move();
		}
	}

	function getRandomInt(min, max) {
	  	return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function getNextItemShift(min, max) {
		return getRandomInt(min, max);
	}

	function getCloudHeight() {
		return getRandomInt(-40, -10);
	}

	function initialCloudDraw() {
		for(var i = 0; i < clouds.length; i++) {
			clouds[i].draw();
		}
	}

	function addNewCloud() {
		var x = clouds[clouds.length - 1].x + getNextItemShift(220, 350),
			y = getCloudHeight(),
			cloudImage = new Image();
		cloudImage.src = cloudsImages[getRandomInt(0, 2)];

		var cloud = new Cloud(x, y, cloudImage);
		cloud.velocity = clouds[clouds.length - 1].velocity;

		clouds.push(cloud);
	}

	function addNewBlock() {
		var x = blocks.length ? (blocks[blocks.length - 1].x + Math.max(canvas.width - blocks[blocks.length - 1].x, getNextItemShift(220, 350))) : (canvas.width + 50),
			y = 270;

		var block = new Block(x, y);
		block.velocity = blocks.length ? blocks[blocks.length - 1].velocity : gameSpeed;

		blocks.push(block);
	}

	function birdCollide(obstacle) {
		var isColission = false;
		if((((obstacle.x >= bird.x && obstacle.x + 30 <= bird.x + 56) || 
			(obstacle.x >= bird.x && obstacle.x <= bird.x + 52) ||
			(obstacle.x + 32 >= bird.x && obstacle.x + 30 <= bird.x + 56))) && 
			(bird.y <= obstacle.y && bird.y >= obstacle.y - 30)) {
			isColission = true;
		}
		return isColission;
	}

	function initialCloudPopulate() {
		for(let i = 0; i < 4; i++) {
			var x = i * (canvas.width / 6),
				y = getCloudHeight(),
				cloudImage = new Image();
			cloudImage.src = cloudsImages[getRandomInt(0, 2)];
			if(i) {
				x = clouds[i - 1].x + getNextItemShift(200, 400);
			}
			var cloud = new Cloud(x, y, cloudImage);
			clouds.push(cloud);
		}
		initialCloudDraw();
	}

	function initialTrapGenerator() {
		var randomNumber = getRandomInt(4, 10),
			i;

		for(i = 0; i < randomNumber; i++) {
			addNewBlock();
		}
	}

	function startGame() {
		fadeOut(menu);
		scoreTextNode.nodeValue = gameScore + ' points';
		fadeIn(scoreSvg);
		clouds = [];
		blocks = [];
		canvas = document.createElement('canvas');
		canvas.id = "game-area";
		canvas.style.backgroundColor = "#effbff";
		gameContainer.appendChild(canvas);
		gameContainer.appendChild(scoreSvg);
		fadeIn(canvas);
		canvas.width = 1000;
		canvas.height = 300;
		ctx = canvas.getContext('2d');
		bird = new Bird(30, 260);
		initialCloudPopulate();
		initialTrapGenerator();
		gameStartStatus = true;
	}

	function endGame() {
		endGameSound.play();
		gameStartStatus = false;
		setTimeout(function(){ 
			gameContainer.removeChild(canvas);
			startButton.disabled = false;
			fadeOut(scoreSvg);
			fadeIn(menu);
			endGameSound.pause();
			endGameSound.currentTime = 0.0;
		}, 4000);
	}

	function drawEnvironment() {
		moveClouds();
		moveBlocks();
	    bird.jump();
	}

	document.addEventListener('keyup', function (e) {
	    if (e.keyCode == '32' && gameStartStatus) {
	        keypressed = true;
	        jumpSound.play();
	    }
	}, false);

	startButton.disabled = true;

	startButton.onclick = function() {
		startButton.disabled = true;
		gameScore = 0;
		startGame();
		requestAnim =
			window.requestAnimationFrame ||
	        window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame ||
	        setInterval;
		requestAnim(function loop() {
			if(gameStartStatus === false) {
				return;
			}
		    canvas.width = canvas.width;
		    drawEnvironment();
		    if(bird.lives) {
				requestAnim(loop); 
			} else {
				endGame();
			}
		});
	}

	function fadeOut(el){
	  	el.style.opacity = 1;
	  	(function fade() {
	    	if ((el.style.opacity -= .1) < 0) {
		     	el.style.display = "none";
		    } else {
		      	requestAnimationFrame(fade);
		    }
	  	})();
	}

	function fadeIn(el, display){
	  	el.style.opacity = 0;
	  	el.style.display = "block";
		(function fade() {
		    var val = parseFloat(el.style.opacity);
		    if (!((val += .1) > 1)) {
		      	el.style.opacity = val;
		      	requestAnimationFrame(fade);
		    }
		})();
	}

})();