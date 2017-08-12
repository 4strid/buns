(function () {
	function noop () {}

	const options = {
		'background-color': '#ffffff'
	};

	const canvas = document.createElement('canvas');
	let ctx = canvas.getContext('2d');

	let dispatch;
	let screen;

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

	function argsAndParams (o, args, params) {
		for (const p in params) {
			if (args[p]) {
				o[p] = args[p];
			} else {
				if (params[p].default) {
					o[p] = params[p].default;
				} else {
					console.warn('Missing required argument ' + p);
				}
			}
		}
	}

	function Cute (plan) {
		//if (arguments.length == 1) {
			//plan = base;
			//base = undefined;
			//var proto = Cute.prototype;
		//} else if (arguments.length == 2) {
			//var proto = base.prototype;
		//}
		const prototype = prototypeFromPlan(plan, Cute.prototype);

		prototype.draw = function (op) {
			ctx.save();
			ctx.translate(this.screen.x, this.screen.y);
			(op || plan.draw || noop).call(this, ctx);
			ctx.restore();
		};

		function constructor (args)	{
			args = args || {};
			const o = Object.create(prototype);
			o.constructor = plan.constructor;

			argsAndParams(o, args, plan.params);
			//if (plan.fed) {
				//for (const k in plan.fed) {
					//o[k] = plan.fed[k];
				//}
			//}
			Cute.constructor.call(o, args, plan);
			//if (base !== undefined) {
				//base.constructor.call(o);
			//}
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

	Cute.constructor = function (args, plan) {
		// make sure we got all the arguments
		this.x = args.x || plan.x || 0;
		this.y = args.y || plan.y || 0;
		this.w = args.w || plan.w || 0;
		this.h = args.h || plan.h || 0;
		this.parent = args.parent;
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
			dispatch.emitEvent(this, evtype, evt);
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
			ctx.fillStyle = options['background-color'];
			ctx.fillRect(this.screen.x - 1, this.screen.y - 1, this.w + 2, this.h + 2);
			//ctx.fillRect(this.screen.x, this.screen.y, this.w, this.h);
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
		addChild: function (child, name) {
			this.children = this.children || [];
			child.parent = this;
			//child.setParent(this);
			this.children.push(child);
			this.children[name] = child;
			Object.defineProperty(this.children, name, {value: child});
		},
		addChildren: function (children, name) {
			this.children = this.children || [];
			for (const child of children) {
				child.parent = this;
				//child.setParent(this);
			}
			this.children = this.children.concat(children);
			Object.defineProperty(this.children, name, {value: children});
		},
		get screen () {
			return this.parent ? v(this).add(this.parent.screen) : v(this);
		},
		get dimensions () {
			return {
				w: this.w,
				h: this.h
			};
		},
		destroy: function () {
			if (this.children) {
				for (child of this.children) {
					child.destroy();
				}
				this.children = [];
			}
			Cute.destroy(this);
		}
	};

	Cute.Sprite = function (plan) {
		//if (arguments.length == 1) {
			//plan = base;
			//base = undefined;
			//var proto = Cute.prototype;
		//} else if (arguments.length == 2) {
			//var proto = base.prototype;
		//}
		const prototype = prototypeFromPlan(plan, Cute.prototype);

		function spriteDraw (ctx) {
			const sprite = this.sprite;
			const src = v(
				sprite.currentFrame * sprite.width,
				sprite.currentAnimation * sprite.height
			);
			if (sprite.image.complete) {
				ctx.drawImage(sprite.image, src.x, src.y, sprite.width, sprite.height,
							  0, 0, this.w, this.h);
			} else {
				setTimeout(() => {
					spriteDraw.call(this, ctx);
				}, 0);
			}
		}

		prototype.draw = function (op) {
			ctx.save();
			ctx.translate(this.screen.x, this.screen.y);
			spriteDraw.call(this, ctx);
			ctx.restore();
		};

		prototype.animate = function (anim, frame) {
			this.sprite.currentAnimation = anim;
			this.sprite.currentFrame = frame;
			this.draw();
		};

		const image = new Image();
		image.src = plan.imagesrc;

		function constructor (args)	{
			args = args || {};
			const o = Object.create(prototype);
			o.constructor = plan.constructor;

			argsAndParams(o, args, plan.params);
			//if (plan.fed) {
				//for (const k in plan.fed) {
					//o[k] = plan.fed[k];
				//}
			//}
			Cute.constructor.call(o, args, plan);
			//if (base !== undefined) {
				//base.constructor.call(o);
			//}
			o.sprite = {
				image: image,
				currentAnimation: 0,
				currentFrame: 0,
				width: plan.width,
				height: plan.height
			};
			o.constructor.call(o);
			screen.add(o);
			(o.Ready || noop).call(o);
			return o;
		}
		// attach stuff to return
		constructor.prototype = prototype;
		constructor.constructor = plan.constructor;

		return constructor;
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

			Cute.constructor.call(o, args, plan);
			Cute.HTML.Element.call(o, el);

			argsAndParams(o, args, plan.params);

			o.constructor.call(o);
			screen.add(o);
			(o.Ready || noop).call(o);
			return o;
		}
		// attach stuff to return
		constructor.constructor = Cute;

		return constructor;
	};

	Cute.HTML.Element = function (el) {
		this.move(this.x, this.y);
		if (this.w) {
			el.style.width = this.w.toString() + 'px';
		}
		if (this.h) {
			el.style.height = this.h.toString() + 'px';
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
			dispatch.removeEventListeners(this);
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

	Cute.suppressContextMenu = function () {
		parentEl.addEventListener('contextmenu', function (evt) {
			evt.preventDefault();
		});
	};


	let parentEl = null;
	Cute.attach = function (parent, width, height) {
		parentEl = parent;
		parentEl.appendChild(canvas);
		canvas.width = width || parentEl.clientWidth;
		canvas.height = height || parentEl.clientHeight;
		ctx.fillStyle = options['background-color'];
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		screen = new Screen();

		dispatch = new Dispatch(canvas, screen, parentEl);

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
