(function () {
	const r = function (x, y, w, h) {
		if (arguments.length === 2) {
			return {
				x: x.x,
				y: x.y,
				w: y.w,
				h: y.h
			};
		}
		return {
			x: x,
			y: y,
			w: w,
			h: h
		};
	};
	
	Object.assign(r, {
		get (src) {
			return {
				x: src.x,
				y: src.y,
				w: src.w,
				h: src.h
			};
		},
		pointIntersect (rect, p) {
			const left = rect.x;
			const right = rect.x + rect.w;
			const top = rect.y;
			const bottom = rect.y + rect.h;
			return p.x >= left && p.x <= right && p.y >= top && p.y <= bottom;
		},
		intersect (a, b) {
			return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
		}
	});
	
	window.r = r;
})();
