Cute.attach(document.getElementsByTagName('body')[0]);
Cute.context.mozImageSmoothingEnabled = false;
Cute.context.webkitImageSmoothingEnabled = false;
Cute.context.msImageSmoothingEnabled = false;
Cute.context.imageSmoothingEnabled = false;

const WIDTH = 800;
const HEIGHT = 600;

const Bunny = Cute({
	draw: function (ctx) {
		const sprite = document.getElementById('tomato');
		ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
					  0, 0, this.w, this.h);
	},
	state: {
		Ready () {

		}
	}
});


const Tomato = Cute({
	draw: function (ctx) {
		const sprite = document.getElementById('tomato');
		ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
					  0, 0, this.w, this.h);
	}
});

function Foxes () {
	const Fox = Cute({
		methods: {
			release: function (speed) {
				this.move(Math.random() * WIDTH, -50);
				this.Run(speed);
			},
			update: function () {
				this.move(v(this).add(0, speed));
				if (this.y > HEIGHT + 50) {
					this.pool();
				}
			}
		},
		draw: function (ctx) {
			const sprite = document.getElementById('fox');
			ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
						  0, 0, this.w, this.h);
		},
		state: {
			Run: function (speed) {
			},
			Pool: function () {
				foxPool.push(this);
			}
		}
	});

	const foxes = [];
	let base_speed = 10;
	let num_foxes_unleashed = 0;
}

const bun = Bunny({
	x: 10,
	y: 10,
	w: 30,
	h: 39
});

const foxes = Foxes();

bun.draw();
