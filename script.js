Cute.attach(document.getElementsByTagName('body')[0]);
Cute.context.mozImageSmoothingEnabled = false;
Cute.context.webkitImageSmoothingEnabled = false;
Cute.context.msImageSmoothingEnabled = false;
Cute.context.imageSmoothingEnabled = false;

const Bunny = Cute({
	draw: function (ctx) {
		ctx.drawImage(document.getElementById('bunnunu'), 0, 0, 10, 13,
					  0, 0, this.w, this.h);
	}
});

const Tomato = Cute({
	draw: function (ctx) {
		const sprite = document.getElementById('tomato');
		ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
					  0, 0, this.w, this.h);
	}
});

const Fox = Cute({
	draw: function (ctx) {
		const sprite = document.getElementById('fox');
		ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height,
					  0, 0, this.w, this.h);
	}
});

function spawn_fox () {
start = Math.floor(Math.random()*10)*80+4;

const fox = Fox({
	x: start,
	y: -80,
	w: 72,
	h: 80
});
}
window.setInterval(spawn_fox, 500);

window


fox.move(x, y)

const tomat = Tomato({
	x: 0,
	y: 0,
	w: 40,
	h: 40,
});

tomat.draw();

const bun = Bunny({
	x: 10,
	y: 10,
	w: 30,
	h: 39
});

const bun2 = Bunny({
	x: 100,
	y: 50,
	w: 300,
	h: 390
});

bun.draw();
bun2.draw();
