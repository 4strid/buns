(function () {
	function noop () {}

	const canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	const options = {
		background_color: '#ffffff'
	};

	const screen = new Screen();

	const dispatch = new Dispatch(canvas, screen);

	function prototypeFromPlan (plan, parent) {
		const prototype = Object.create(parent);
		for (const k in plan.methods) {
			prototype[k] = plan.methods[k];
		}

		for (const k in plan.state) {
			prototype[k] = function () {
				dispatch.removeEventListeners(this);
				plan.state[k].apply(this, arguments);
			};
		}
		return prototype;
	}

	function Cute (base, plan) {
		if (arguments.length == 1) {
			plan = base;
			base = undefined;
			var proto = Cute.prototype;
		} else if (arguments.length == 2) {
			var proto = base.prototype;
		}
		const prototype = prototypeFromPlan(plan, proto);

		prototype.draw = function (op) {
			ctx.save();
			ctx.translate(this.screen.x, this.screen.y);
			(op || plan.draw || noop).call(this, ctx);
			ctx.restore();
		};

		function constructor (args)	{
			const o = Object.create(prototype);
			o.constructor = plan.constructor;

			for (const p in plan.params) {
				if (args[p]) {
					// typecheck SNORE
					o[p] = args[p];
				} else {
					if (plan.params[p].default) {
						o[p] = plan.params[p].default;
					} else {
						console.warn('Missing required argument ' + p);
					}
				}
			}

			if (plan.fed) {
				for (const k in plan.fed) {
					o[k] = plan.fed[k];
				}
			}

			Cute.constructor.call(o, args.x, args.y, args.w, args.h, args.context, args.parent);
			if (base !== undefined) {
				base.constructor.call(o);
			}
			o.constructor.call(o);
			screen.add(o);
			(o.Ready || noop).call(o);
			return o;
		}
		// attach stuff to return
		constructor.prototype = prototype;
		constructor.constructor = plan.constructor;

		return constructor;
		
	}

	Cute.constructor = function (x, y, w, h, context, parent) {
		// make sure we got all the arguments
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.parent = parent;
	};

	Cute.prototype = {
		on: function (evtype, handler) {
			dispatch.addEventListener(this, evtype, handler);
			return this;
		},
		listen: function (evtype, handler) {
			dispatch.addPersistentListener(this, evtype, handler);
		},
		unlisten: function (evtype) {
			dispatch.removePersistentListener(this, evtype);
		},
		emit: function (evtype, evt) {
			dispatch.emitEvent(this.parent, evtype, evt);
		},
		move: function (x, y) {
			const loc = v(x, y);
			this.erase();
			v.assign(this, loc);
			this.draw();
		},
		move_: function (x, y) {
			v.assign(this, v(x, y));
		},
		erase: function () {
			ctx.fillStyle = options.background_color;
			ctx.fillRect(this.screen.x - 1, this.screen.y - 1, this.w + 2, this.h + 2);
			const collisions = screen.getIntersections(this);
			for (el of collisions) {
				if (el !== this) {
					el.draw();
				}
			}
		},
		getIntersections: function () {
			return screen.getIntersections(this);
		},
		intersects: function (q) {
			return screen.intersects(this, q);
		},
		get screen () {
			return this.parent ? v(this).add(this.parent.screen) : v(this);
		},
		get dimensions () {
			return {
				w: this.w,
				h: this.h
			};
		}
	};

	Cute.HTML = function (plan) {
		const prototype = prototypeFromPlan(plan, Cute.HTML.prototype);
		const template = document.createElement('template');
		template.innerHTML = plan.template;

		const defaults = {};
		function constructor (args)	{
			Object.assign(args, defaults);
			const o = Object.create(prototype);
			o.constructor = plan.constructor || noop;
			const el = document.importNode(template.content.firstChild, true);
			o.el = el;
			Cute.HTML.Element.call(o, el, args.x, args.y, args.w, args.h);
			Cute.constructor.call(o, args.x, args.y, args.w, args.h, args.context, args.parent);

			for (const p in plan.params) {
				if (args[p]) {
					// typecheck SNORE
					o[p] = args[p];
				} else {
					if (plan.params[p].default) {
						o[p] = plan.params[p].default;
					} else {
						console.warn('Missing required argument ' + p);
					}
				}
			}

			Cute.constructor.call(o, args.x, args.y, args.w, args.h, args.context, args.parent);
			o.constructor.call(o);
			screen.add(o);
			(o.Ready || noop).call(o);
			return o;
		}
		// attach stuff to return
		constructor.constructor = Cute;

		return constructor;
	};

	Cute.HTML.Element = function (el, x, y, w, h) {
		this.move(x, y);
		if (w) {
			el.style.width = w.toString() + 'px';
		}
		if (h) {
			el.style.height = h.toString() + 'px';
		}
		el.style.position = 'absolute';
		el.style['z-index'] = 999;
		parentEl.appendChild(el);
	};

	Cute.HTML.prototype = Object.create(Cute.prototype);
	Object.assign(Cute.HTML.prototype, {
		on: function (evtype, handler) {
			dispatch.addDomEventListener(this, evtype, handler);
			return this;
		},
		move: function (x, y) {
			const loc = v(x, y);
			if (loc.isNaN()) {
				return;
			}
			v.assign(this, loc);
			const screen = this.parent ? v(this).add(this.parent.screen) : v(this);
			this.el.style.top = screen.y.toString() + 'px';
			this.el.style.left = screen.x.toString() + 'px';
		},
		erase: noop,
		draw: function () {
			this.move(v(this));
		},
		destroy: function () {
			parentEl.removeChild(this.el);
			dispatch.removeDomEventListeners(this);
			screen.remove(this);
		}
	});
	Object.defineProperty(Cute.HTML.prototype, 'screen', {
		get: function () {
			if (this.x !== undefined && this.y !== undefined) {
				return this.parent ? v(this).add(this.parent.screen) : v(this);
			} else {
				const canvasRect = parentEl.getBoundingClientRect();
				const thisRect = this.el.getBoundingClientRect();
				const domPos = {
					x: thisRect.top - canvasRect.top,
					y: thisRect.left - canvasRect.left
				};
				return domPos;
			}
		}
	});
	Object.defineProperty(Cute.HTML.prototype, 'dimensions', {
		get: function () {
			if (this.w  && this.h) {
				return {
					w: this.w,
					h: this.h
				};
			} else {
				const thisRect = this.el.getBoundingClientRect();
				return {
					w: thisRect.right - thisRect.left,
					h: thisRect.top - thisRect.bottom
				};
			}
		}
	});

	Cute.destroy = function (el) {
		dispatch.removeEventListeners(el);
		screen.remove(el);
	};


	let parentEl = null;
	Cute.attach = function (parent, width, height) {
		parentEl = parent;
		parentEl.appendChild(canvas);
		canvas.width = width || parentEl.clientWidth;
		canvas.height = height || parentEl.clientHeight;
		ctx.fillStyle = options.background_color;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	};

	Cute.set = function (prop, value) {
		options[prop] = value;
	};

	//Object.assign(Cute, {
		//attach (parentEl) {
			//parentEl.appendChild(canvas);
		//},
		//set (opts) {}
	//});
	
	Cute.context = ctx;
	
	window.Cute = Cute;
	window.l = function (x) {
		console.log(x);
		return x;
	};
})();
