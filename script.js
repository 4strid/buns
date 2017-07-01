const WIDTH = 800;
const HEIGHT = 590;

Cute.set('background_color', '#cdf9bd');
Cute.attach(document.getElementById('game'), WIDTH, HEIGHT);
Cute.context.mozImageSmoothingEnabled = false;
Cute.context.webkitImageSmoothingEnabled = false;
Cute.context.msImageSmoothingEnabled = false;
Cute.context.imageSmoothingEnabled = false;


const Bunny = Cute({
	draw: function (ctx) {
		let sprite = document.getElementById('bunnunu');
		if (this.eaten){
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
			this.on('mousemove', function (evt) {
				this.move(v(evt.canvasX - 40, evt.canvasY - 52));
			});
		},
		Eaten: function () {
			this.eaten = true;
			const lives_left = gameState.dead();
			if (lives_left > 0) {
				this.on('click', function(event){
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



function Foxes () {
	const Fox = Cute({
		params: {
			speed: Number
		},
		methods: {
			update: function (time) {
				this.move(v(this).add(0, this.speed * time / 16));
			}
		},
		draw: function (ctx) {
			const sprite = document.getElementById('fox');
			ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
						  0, 0, this.w, this.h);
		}
	});

	let spawn_fox_interval;
	let base_speed = 3;

	const foxes = [];
	this.foxes = foxes;

	this.start = function (){
		base_speed = 3;
		spawn_fox_interval = window.setInterval(spawn_fox, 200);
	};

	this.stop = function (){
		window.clearInterval(spawn_fox_interval);
	};

	this.update = function (time) {
		for (f of foxes) {
			f.update(time);
			if (f.y > HEIGHT + 80) {
				Cute.destroy(f);
				foxes.splice(foxes.indexOf(f), 1);
				gameState.addPoints();
			}
		}
	};

	function spawn_fox () {
		const start = Math.floor(Math.random()*10)*80+4;
		base_speed += 0.01;
		const fluctuation = Math.random()*1.5;
		const fox = Fox({
			x: start,
			y: -80,
			w: 72,
			h: 80,
			speed: base_speed+fluctuation 
		});
		foxes.push(fox);
	}
	spawn_fox();
}

function GameState() {
	let lives = 3;
	let score = 0;

	const button = document.getElementById("restart");

	const scoreBoard = document.getElementById("score");

	button.onclick = function () {
		button.className = "hide-button";
		lives = 3;
		score = 0;
		scoreBoard.innerHTML = "Score: "+score;
		foxes.start();
		bun.Ready();
	};

	
	this.addPoints = function() {
		if (!bun.eaten) {
			score ++;
			scoreBoard.innerHTML = "Score: "+score;
		}
	};
	this.dead = function() {
		lives -= 1;
		foxes.stop();
		if (lives === 0) {
			button.className = "show-button";
		}
		return lives;
	};
}

const gameState = new GameState();

const foxes = new Foxes();
foxes.start();

const bun = Bunny({
	x: 400,
	y: 400,
	w: 80,
	h: 104
});

let last_time = null;
function step(time) {
	window.requestAnimationFrame(step);
	const elapsed = time - last_time;
	last_time = time;

	foxes.update(elapsed);
	bun.update(elapsed);
	bun.draw();
}
window.requestAnimationFrame(step);

