(function () {
	function Screen () {
		const elems = [];

		Object.assign(this, {
			add: function (el) {
				if (el.w > 0 && el.h > 0) {
					elems.push(el);
				}
			},
			remove: function (el) {
				const i = elems.indexOf(el);
				if (i > -1) {
					elems.splice(i, 1);
				}
			},
			getIntersections (q) {
				const collisions = [];
				for (el of elems) {
					if (r.intersect(r(q.screen, q.dimensions), r(el.screen, el.dimensions))) {
						if (q !== el) {
							collisions.push(el);
						}
					}
				}
				return collisions;
			},
			intersects (q1, q2) {
				return r.intersect(r(q1.screen, q1.dimensions), r(q2.screen, q2.dimensions));
			},
			queryPoint: function (q) {
				const collisions = [];
				for (el of elems) {
					if (r.pointIntersect(r(el.screen, el.dimensions), q)) {
						collisions.push(el);
					}
				}
				return collisions;
			},
			queryRect: function (qr) {
				const collisions = [];
				for (el of elems) {
					if (r.intersect(r(el.screen, el.dimensions), l(qr))) {
						collisions.push(el);
					}
				}
				return collisions;
			}
		});
	}
	window.Screen = Screen;
})();
