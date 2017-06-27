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
