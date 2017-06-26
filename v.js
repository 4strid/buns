(function () {
	const proto = {
		add (x, y) {
			const that = v(x, y);
			return v(this.x + that.x, this.y + that.y);
		},
		sub (x, y) {
			const that = v(x, y);
			return v(this.x - that.x, this.y - that.y);
		},
		scale (s) {
			return v(this.x * s, this.y * s);
		},
		div (s) {
			return v(this.x / s, this.y / s);
		},
		floor () {
			return v(Math.floor(this.x), Math.floor(this.y));
		},
		isNaN () {
			return Number.isNaN(this.x) || Number.isNaN(this.y);
		}
	};

	function v (x, y) {
		let v = Object.create(proto);
		if (typeof arguments[0] === 'object') {
			v.x = arguments[0].x;
			v.y = arguments[0].y;
		} else {
			v.x = x;
			v.y = y;
		}
		return v;
	};
	
	Object.assign(v, {
		assign (a, src) {
			a.x = src.x;
			a.y = src.y;
		},
		add (a, b) {
			return {
				x: a.x + b.x,
				y: a.y + b.y
			};
		},
		sub (a, b) {
			return {
				x: a.x - b.x,
				y: a.y - b.y
			};
		},
		addl (a, b) {
			a.x = a.x + b.x;
			a.y = a.y + b.y;
		},
		subl (a, b) {
			a.x = a.x - b.x;
			a.y = a.y - b.y;
		}
	});

	function v4 (r, g, b, a) {
		return {
			r: r,
			g: g,
			b: b,
			a: a
		};
	}
	
	window.v = v;
	window.v4 = v4;
})();
