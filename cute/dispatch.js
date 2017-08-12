(function () {
	function Dispatch (canvas, screen, container) {
		function DispatchEventListener (evtype) {
			return function (evt) {
				dispatch(evtype, evt);
			};
		}

		function DomEventListener (el, evtype) {
			return function (evt) {
				domListeners.get(el)[evtype].call(el, evt);
			};
		}

		const allEventTypes = [
			'blur',
			'click',
			'dblclick',
			'focus',
			'keydown',
			'keypress',
			'keyup',
			'mousedown',
			'mouseenter',
			'mouseleave',
			'mousemove',
			'mouseout',
			'mouseover',
			'mouseup',
			'scroll',
			'wheel'
		];
		allEventTypes.forEach(function (evtype) {
			container.addEventListener(evtype, DispatchEventListener(evtype));
		});

		document.addEventListener('mouseout', function (evt) {
			dispatchMouseoverMouseout('mouseout', evt);
		});

		const localListeners = new Map();
		const globalListeners = {};
		allEventTypes.forEach(function (evtype) {
			globalListeners[evtype] = new Map();
		});
		const userListeners = new Map();
		const persistentListeners = new Map();
		const domListeners = new Map();

		let mousePrior = [];

		function dispatch (evtype, evt) {
			addCanvasCoords(evt);

			dispatchGlobal(evtype, evt);
			const els = screen.queryPoint(v(evt.canvasX, evt.canvasY));
			for (el of els) {
				dispatchLocal(el, evtype, evt);
				if (allEventTypes.indexOf(evtype) === -1) {
					dispatchChild(el, evtype, evt);
				}
			}
			dispatchMouseoverMouseout(evtype, evt);
		}

		function dispatchMouseoverMouseout (evtype, evt) {
			//const prior = screen.queryPoint(v(evt.canvasX, evt.canvasY).sub(evt.movementX, evt.movementY));
			const mouseon = screen.queryPoint(v(evt.canvasX, evt.canvasY));
			if (evtype === 'mousemove') {
				// compare prior and mouseon
				for (el of mouseon) {
					if (mousePrior.indexOf(el) === -1) {
						dispatchLocal(el, 'mouseover', evt);
					}
				}
				for (prior of mousePrior) {
					if (mouseon.indexOf(prior) === -1) {
						dispatchLocal(prior, 'mouseout', evt);
					}
				}
			} else if (evtype === 'mouseout') {
				for (prior of mousePrior) {
					dispatchLocal(prior, 'mouseout', evt);
				}
			}
			mousePrior = mouseon;
		}

		function getGlobalEvtype (evtype) {
			if (evtype[evtype.length - 1] === 'G') {
				return evtype.substring(0, evtype.length - 1);
			}
		}

		function dispatchEvent (map, el, evtype, evt, src) {
			src = src || el;
			const listeners = map.get(el);
			if (listeners && listeners[evtype]) {
				listeners[evtype].call(el, evt, src);
			}
		}

		function dispatchGlobal (evtype, evt) {
			const listeners = globalListeners[evtype];
			listeners.forEach(function (listener, el) {
				addLocalCoords(evt, el);
				listener.call(el, evt, el);
			});
			for (x of persistentListeners) {
				console.log(x);
			}
		}

		function dispatchLocal (el, evtype, evt) {
			if (!el) {
				return;
			}
			addLocalCoords(evt, el);
			dispatchEvent(localListeners, el, evtype, evt);
		}

		function dispatchChild (el, evtype, evt) {
			if (!el.parent) {
				return;
			}
			dispatchEvent(userListeners, el.parent, evtype, evt, el);
			dispatchEvent(persistentListeners, el.parent, evtype, evt, el);
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

		function addListener(map, el, evtype, listener) {
			if (map.has(el)) {
				map.get(el)[evtype] = listener;
			} else {
				const listeners = {};
				listeners[evtype] = listener;
				map.set(el, listeners);
			}
		}

		Object.assign(this, {
			addEventListener: function (el, evtype, listener) {
				const globalEvtype = getGlobalEvtype(evtype);
				if (globalEvtype) {
					if (allEventTypes.indexOf(globalEvtype) > -1) {
						globalListeners[globalEvtype].set(el, listener);
					} else {
						console.warn('invalid global event type');
					}
				} else {
					if (allEventTypes.indexOf(evtype) > -1) { // local
						addListener(localListeners, el, evtype, listener);
					} else { // user defined
						addListener(userListeners, el, evtype, listener);
					}
				}
			},
			removeEventListener: function (el, evtype) {
				const globalEvtype = getGlobalEvtype(evtype);
				if (globalEvtype) {
					globalListeners[globalEvtype].delete(el);
				} else {
					delete localListeners.get(el)[evtype];
				}
			},
			removeEventListeners: function (el) {
				localListeners.set(el, {});
				for (const evtype in globalListeners) {
					globalListeners[evtype].delete(el);
				}
				const listeners = domListeners.get(el) || {};
				for (const l in listeners) {
					el.el.removeEventListener(l, listeners[l]);
				}
				domListeners.set(el, {});
			},
			addDomEventListener: function (el, evtype, listener) {
				el.el.addEventListener(evtype, DomEventListener(el, evtype));
				addListener(domListeners, el, evtype, listener);
			},
			addPersistentListener: function (el, evtype, listener) {
				addListener(persistentListeners, el, evtype, listener);
			},
			removePersistentListener: function (el, evtype) {
				if (persistentListeners.has(el)) {
					delete persistentListeners.get(el)[evtype];
				}
			},
			emitEvent: function (el, evtype, args) {
				dispatchChild(el, evtype, args);
			}
		});
	}

	window.Dispatch = Dispatch;
})();
