(function () {
	function noop () {}

	const canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	const options = {
		background_color: '#ffffff'
	};

	function Screen () {
		const elems = [];

		Object.assign(this, {
			add: function (el) {
				elems.push(el);
			},
			remove: function (el) {
				elems.splice(elems.indexOf(el), 1);
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
				for (el of elems) {
					if (r.pointIntersect(r(el.screen, el.dimensions), q)) {
						return el;
					}
				}
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

	const screen = new Screen();


	function Dispatch () {
		function DispatchEventListener (evtype) {
			return function (evt) {
				dispatch(evtype, evt);
			};
		}

		[
			'blur',
			'click',
			'dblclick',
			'focus',
			'keydown',
			'keypress',
			'keyup',
			'mousedown',
			//'mouseenter',
			//'mouseleave',
			'mousemove',
			//'mouseout',
			//'mouseover',
			'mouseup',
			'scroll',
			'wheel'
		].forEach(function (evtype) {
			canvas.addEventListener(evtype, DispatchEventListener(evtype));
		});

		function isLocal (evtype) {
			return [
				//'click',
				'dblclick',
				'mousedown',
				'mouseout',
				'mouseover',
				'mouseup'
			].indexOf(evtype) !== -1;
		}

		function isGlobal (evtype) {
			return [
				'click',
				'blur',
				'focus',
				'keydown',
				'keypress',
				'mousemove',
				'scroll',
				'wheel'
			].indexOf(evtype) !== -1;
		}

		const localListeners = new Map();
		const globalListeners = {
			click: new Map(),
			blur: new Map(),
			focus: new Map(),
			keydown: new Map(),
			keypress: new Map(),
			mousemove: new Map(),
			scroll: new Map(),
			wheel: new Map()
		};
		const childListeners = new Map();
		const globalListenerIndex = new Map();

		function dispatch (evtype, evt) {
			addCanvasCoords(evt);

			if (evtype === 'mousemove') {
				dispatchGlobal(evtype, evt);
				// mouseover and mouseout events
				//const prior = screen.queryPoint(v(evt.canvasX, evt.canvasY).sub(v(evt.movementX, evt.movementY)));
				const prior = screen.queryPoint(v(evt.canvasX, evt.canvasY).sub(evt.movementX, evt.movementY));

				const mouseon = screen.queryPoint(v(evt.canvasX, evt.canvasY));
				if (prior !== mouseon) {
					dispatchLocal(prior, 'mouseout', evt);
					dispatchLocal(mouseon, 'mouseover', evt);
				}
			} else if (isLocal(evtype)) {
				const el = screen.queryPoint(v(evt.canvasX, evt.canvasY));
				dispatchLocal(el, evtype, evt);
			} else {
				dispatchGlobal(evtype, evt);
			}
		}

		function dispatchGlobal (evtype, evt) {
			const listeners = globalListeners[evtype];
			listeners.forEach(function (listener, el) {
				addLocalCoords(evt, el);
				listener.call(el, evt);
			});
		}

		function dispatchLocal (el, evtype, evt) {
			if (!el) {
				return;
			}
			addLocalCoords(evt, el);
			const listeners = localListeners.get(el);
			if (listeners && listeners[evtype]) {
				listeners[evtype].call(el, evt);
			}
		}

		function dispatchChild (el, evtype, evt) {
			const listeners = childListeners.get(el);
			if (listeners && listeners[evtype]) {
				listeners[evtype].call(el, evt);
			}
		}

		function addCanvasCoords (evt) {
			const rect = canvas.getBoundingClientRect();
			evt.canvasX = evt.clientX - rect.left;
			evt.canvasY = evt.clientY - rect.top;
		}

		function addLocalCoords (evt, el) {
			evt.localX = evt.canvasX - el.screen.x;
			evt.localY = evt.canvasY - el.screen.y;
		}

		Object.assign(this, {
			addEventListener: function (el, evtype, listener) {
				if (isLocal(evtype)) {
					if (localListeners.has(el)) {
						localListeners.get(el)[evtype] = listener;
					} else {
						const listeners = {};
						listeners[evtype] = listener;
						localListeners.set(el, listeners);
					}
				} else if (isGlobal(evtype)) {
					globalListeners[evtype].set(el, listener);
				} else {
					if (childListeners.has(el)) {
						childListeners.get(el)[evtype] = listener;
					} else {
						const listeners = {};
						listeners[evtype] = listener;
						childListeners.set(el, listeners);
					}
				}
			},
			removeEventListener: function (el, evtype) {
				if (isLocal(evtype)) {
					delete localListeners.get(el)[evtype];
				} else {
					globalListeners[evtype].delete(el);
				}
			},
			removeEventListeners: function (el) {
				localListeners.set(el, {});
				for (const evtype in globalListeners) {
					this.removeEventListener(el, evtype);
				}
			},
			emitEvent: function (el, evtype, evt) {
				dispatchChild(el, evtype, evt);
			}
		});
	}

	const dispatch = new Dispatch();

	function Cute (plan) {
		const prototype = Object.create(Cute.prototype);
		for (const k in plan.methods) {
			prototype[k] = plan.methods[k];
		}

		for (const k in plan.state) {
			if (k === 'default') {
				var defaultState = plan.state[k];
				continue;
			}
			prototype[k] = function () {
				dispatch.removeEventListeners(this);
				plan.state[k].apply(this, arguments);
			};
		}

		prototype.draw = function (op) {
			ctx.save();
			ctx.translate(this.screen.x, this.screen.y);
			(op || plan.draw || noop).call(this, ctx);
			ctx.restore();
		};

		const properties = {};
		const data = {};
		for (const k in plan.data) {
			data[k] = plan.data[k];
			properties[k] = {
				enumerable: true,
				get: function (val) {
					return data[k];
				},
				set: function (val) {
					console.log(val);
					data[k] = val;
				}
			};
		}

		function constructor (args)	{
			const o = Object.create(prototype, properties);
			o.constructor = plan.constructor || noop;

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
			(o[defaultState] || o.Ready || noop).call(o);
			return o;
		}
		// attach stuff to return

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

	Cute.destroy = function (el) {
		dispatch.removeEventListeners(el);
		screen.remove(el);
	};


	Cute.attach = function (parentEl, width, height) {
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
