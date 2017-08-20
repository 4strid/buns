// the width and height of the game viewport
const WIDTH = 800;
const HEIGHT = 590;

// a nice green color
Cute.set('background-color', '#cdf9bd');

// this is how you get the Cute framework into the HTML page
Cute.attach(document.getElementById('game'), WIDTH, HEIGHT);

// to make our graphics pixelly and cute
Cute.context.mozImageSmoothingEnabled = false;
Cute.context.webkitImageSmoothingEnabled = false;
Cute.context.msImageSmoothingEnabled = false;
Cute.context.imageSmoothingEnabled = false;

let gameNotStarted = true;


// defines a Bunny class
const Bunny = Cute({
	/*
	 * draw
	 * params: ctx - the 2d canvas context of the Cute framework
	 * returns: none
	 *
	 * Draws one of two frames
	 */
	draw: function (ctx) {
		let sprite = document.getElementById('bunnunu');
		if (this.eaten) {
			sprite = document.getElementById('deadbun');
		}
		ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
					  0, 0, this.w, this.h);
	},
	methods: {
		update: function (time) {
			if (!this.eaten) {
				for (let fox of foxes.foxes) {
					if (this.intersects(fox)) {
						this.Eaten();
					}
				}
			}
		}
	},
	state: {
		Ready: function () {
			this.erase();
			this.eaten = false;
			this.on('mousemoveG', function (evt) {
				this.move(v(evt.canvasX - 40, evt.canvasY - 52));
			});
			this.on('click', function (evt) {
				if (gameNotStarted) {
					gameNotStarted = false;
					gameState.start();
				}
			});
		},
		Eaten: function () {
			this.eaten = true;
			const lives_left = gameState.dead();
			if (lives_left > 0) {
				this.on('click', function(event){
					grasses.start();
					window.setTimeout(function () {
						foxes.start();
					}, 750);
					this.Ready();
					this.eaten = false;
				});
			} else {
				this.erase();
			}
		}
	}
});

function Grasses () {
	let speed = 2.5;
	let spawn_timeout = 0;
	let spawn_interval = 300;
	let should_spawn = false;

	const Grass = Cute({
		methods: {
			update: function (time) {
				this.erase();
				this.move_(v(this).add(0, speed * time / 16));
				this.draw();
			}
		},
		draw: function (ctx) {
			const sprite = document.getElementById('grass');
			ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
						  0, 0, this.w, this.h);
		}
	});

	const grasses = [];

	this.start = function (){
		speed = 2.5;
		should_spawn = true;
		spawn_grass();
	};

	this.stop = function (){
		speed = 0;
		window.clearTimeout(spawn_timeout);
		should_spawn = false;
	};

	this.update = function (time) {
		for (let g of grasses) {
			g.update(time);
			if (g.y > HEIGHT + 80) {
				Cute.destroy(g);
				grasses.splice(grasses.indexOf(g), 1);
			}
		}
	};

	function spawn_grass () {
		if (should_spawn) {
			const grass = Grass({
				x: Math.random() * WIDTH,
				y: -80,
				w: 21,
				h: 14,
			});
			grasses.push(grass);
			if (should_spawn) {
				spawn_timeout = window.setTimeout(spawn_grass, spawn_interval);
			}
		}
	}
}

function Foxes () {
	const Fox = Cute({
		params: {
			speed: Number
		},
		methods: {
			update: function (time) {
				this.erase();
				this.move_(v(this).add(0, this.speed * time / 16));
				this.draw();
			}
		},
		draw: function (ctx) {
			const sprite = document.getElementById('fox');
			ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
						  0, 0, this.w, this.h);
		}
	});

	let spawn_timeout = 0;
	let spawn_interval = 300;
	let base_speed = 3.5;
	let should_spawn = false;

	const foxes = [];
	this.foxes = foxes;

	this.start = function (){
		base_speed = 3.5;
		spawn_interval = 300;
		should_spawn = true;
		spawn_fox();
	};

	this.stop = function (){
		window.clearTimeout(spawn_timeout);
		should_spawn = false;
	};

	this.update = function (time) {
		for (let f of foxes) {
			f.update(time);
			if (f.y > HEIGHT + 80) {
				Cute.destroy(f);
				foxes.splice(foxes.indexOf(f), 1);
				gameState.addPoints();
			}
		}
	};

	function spawn_fox () {
		if (should_spawn) {
			const start = Math.floor(Math.random()*10)*80+8;
			base_speed += 0.01;
			const fluctuation = Math.random()*1.5;
			const fox = Fox({
				x: start,
				y: -80,
				w: 63,
				h: 70,
				speed: base_speed+fluctuation 
			});
			foxes.push(fox);
			if (should_spawn) {
				spawn_timeout = window.setTimeout(spawn_fox, spawn_interval);
			}
			spawn_interval -= 0.5;
		}
	}
}

function GameState() {
	let lives = 3;
	let score = 0;

	const button = document.getElementById('restart');

	const startScreen = document.getElementById('start');
	const endScreen = document.getElementById('over');

	const scoreBoard = document.getElementById('score');

	const scoreJumbo = document.getElementById('jumbo-score');

	// game starts
	button.onclick = startGame;

	function startGame () {
		lives = 3;
		score = 0;
		scoreBoard.innerHTML = 'Score: '+ score;
		foxes.start();
		grasses.start();
		bun.Ready();
		startScreen.className = 'hide';
		endScreen.className = 'hide';
	}

	function endGame () {
		endScreen.className = '';
		scoreJumbo.innerHTML = score;
		scoreBoard.innerHTML = '';
	}

	const Life = Cute ({
		draw: function (ctx) {
			let sprite = document.getElementById('bunnunu');
			ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
						  0, 0, this.w, this.h);
		}
	});

	const lifeSprites = [
		Life({
			x: WIDTH - 95,
			y: HEIGHT - 45,
			w: 30, 
			h: 39
		}),

		Life({
			x: WIDTH - 65,
			y: HEIGHT - 45,
			w: 30, 
			h: 39
		}),
		
		Life({
			x: WIDTH - 35,
			y: HEIGHT - 45,
			w: 30, 
			h: 39
		})
	];

	this.drawlives = function () {
		for (const life of lifeSprites) {
			// erase the lives
			life.erase();
		}
		// draw however many lives remain
		for (let i = 0; i < lives; i++){
			lifeSprites[i].draw();
		}
	};

	this.addPoints = function() {
		if (!bun.eaten) {
			score++;
			scoreBoard.innerHTML = 'Score: '+ score;
		}
	};
	this.dead = function() {
		lives -= 1;
		foxes.stop();
		grasses.stop();
		// game ends
		if (lives === 0) {
			endGame();
		}
		return lives;
	};

	this.start = startGame;
}

const gameState = new GameState();

const foxes = new Foxes();

const grasses = new Grasses();

const bun = Bunny({
	x: 400,
	y: 400,
	w: 70,
	h: 91 
});


// before the start the program there is no "last time"
let last_time = null;

/*
 * Params: time: system time
 * 	time comes from requestAnimationFrame and is a unique value which represents execution time,
 * Returns: None
 * The function which fires every frame, updating all the components of the game
 * every 1/60th of a second.
 *
 * Updates and draws the bun, foxes, and gameState
 */
function step(time) {
	// requestAnimationFrame asks the window to call the function 'step' later
	window.requestAnimationFrame(step);
	const elapsed = time - last_time;
	last_time = time;
	// checks to see if we've dropped significantly below 60 frames per second
	if (elapsed > 25) {
		console.log('slowed down! ' + elapsed);
	}

	grasses.update(elapsed);
	foxes.update(elapsed);
	bun.update(elapsed);
	bun.erase();
	bun.draw();

	gameState.drawlives();
}
// start the program
window.requestAnimationFrame(step);
