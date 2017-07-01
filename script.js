const WIDTH = 800;
const HEIGHT = 800;

Cute.set('background_color', '#cdf9bd');
Cute.attach(document.getElementsByTagName('body')[0], WIDTH, HEIGHT);
Cute.context.mozImageSmoothingEnabled = false;
Cute.context.webkitImageSmoothingEnabled = false;
Cute.context.msImageSmoothingEnabled = false;
Cute.context.imageSmoothingEnabled = false;


const Bunny = Cute({
	draw: function (ctx) {
		const sprite = document.getElementById('bunnunu');
		ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
					  0, 0, this.w, this.h);
	},
	state: {
		Ready: function () {
			this.on('mousemove', function (evt) {
				this.move(v(evt.canvasX - 40, evt.canvasY - 52));
				const collisions = this.getIntersections();
				for (coll of collisions) {
					this.Eaten();
				}
			});
		},
		Eaten: function () {
			console.log('oh no we got eaten');
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
				this.move(v(this).add(0, this.speed));
			}
		},
		draw: function (ctx) {
			const sprite = document.getElementById('fox');
			ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
						  0, 0, this.w, this.h);
		}
	});

	const foxes = [];

	function update (time) {
		for (f of foxes) {
			f.update(time);
			if (f.y > HEIGHT + 80) {
				Cute.destroy(f);
				foxes.splice(foxes.indexOf(f), 1);
			}
		}
	}
	this.update = update;

	let base_speed = 3;
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
	window.setInterval(spawn_fox, 200);

}

const foxes = new Foxes();

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

	foxes.update(time);
	bun.draw();
}
window.requestAnimationFrame(step);

