(function () {
	function Dispatch (canvas, screen) {
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
			canvas.addEventListener(evtype, DispatchEventListener(evtype));
		});

		const localListeners = new Map();
		const globalListeners = {};
		allEventTypes.forEach(function (evtype) {
			globalListeners[evtype] = new Map();
		});
		const userListeners = new Map();
		const persistentListeners = new Map();
		const domListeners = new Map();

		function dispatch (evtype, evt) {
			addCanvasCoords(evt);

			const el = screen.queryPoint(v(evt.canvasX, evt.canvasY));
			dispatchLocal(el, evtype, evt);
			dispatchGlobal(evtype, evt);
			if (allEventTypes.indexOf(evtype) === -1) {
				dispatchChild(el, evtype, evt);
			}
			dispatchMouseoverMouseout(evtype, evt);

		}

		function dispatchMouseoverMouseout (evtype, evt) {
			const prior = screen.queryPoint(v(evt.canvasX, evt.canvasY).sub(evt.movementX, evt.movementY));
			const mouseon = screen.queryPoint(v(evt.canvasX, evt.canvasY));
			if (evtype === 'mousemove') {
				// mouseover and mouseout events
				if (prior !== mouseon) {
					dispatchLocal(prior, 'mouseout', evt);
					dispatchLocal(mouseon, 'mouseover', evt);
				}
			} else if (evtype === 'mouseout') {
				dispatchLocal(prior, 'mouseout', evt);
			}
		}

		function getGlobalEvtype (evtype) {
			if (evtype.substr(-2, 2) === '_g') {
				return evtype.substring(0, evtype.length - 2);
			}
		}

		function dispatchEvent (map, el, evtype, evt) {
			const listeners = map.get(el);
			if (listeners && listeners[evtype]) {
				listeners[evtype].call(el, evt);
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
			dispatchEvent(localListeners, el, evtype, evt);
		}

		function dispatchChild (el, evtype, evt) {
			if (!el) {
				return;
			}
			dispatchEvent(userListeners, el, evtype, evt);
			dispatchEvent(persistentListeners, el, evtype, evt);
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
					el.el.removeEventListener(listeners[l]);
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
			emitEvent: function (el, evtype, evt) {
				dispatchChild(el, evtype, evt);
			}
		});
	}

	window.Dispatch = Dispatch;
})();
