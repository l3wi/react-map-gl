var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import { Manager } from './utils/hammer';

import WheelInput from './inputs/wheel-input';
import MoveInput from './inputs/move-input';
import KeyInput from './inputs/key-input';

import { BASIC_EVENT_ALIASES, EVENT_RECOGNIZER_MAP, GESTURE_EVENT_ALIASES, RECOGNIZERS, RECOGNIZER_COMPATIBLE_MAP, RECOGNIZER_FALLBACK_MAP } from './constants';

import { whichButtons, getOffsetPosition } from './utils/event-utils';

function preventDefault(evt) {}

// Unified API for subscribing to events about both
// basic input events (e.g. 'mousemove', 'touchstart', 'wheel')
// and gestural input (e.g. 'click', 'tap', 'panstart').
// Delegates gesture related event registration and handling to Hammer.js.

var EventManager = function () {
  function EventManager(element) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, EventManager);

    this.element = element;
    this.options = options;
    this._onBasicInput = this._onBasicInput.bind(this);

    var ManagerClass = options.Manager || Manager;

    this.manager = new ManagerClass(element, {
      recognizers: options.recognizers || RECOGNIZERS
    }).on('hammer.input', this._onBasicInput);

    if (!options.recognizers) {
      // Set default recognize withs
      // http://hammerjs.github.io/recognize-with/
      Object.keys(RECOGNIZER_COMPATIBLE_MAP).forEach(function (name) {
        var recognizer = _this.manager.get(name);
        if (recognizer) {
          RECOGNIZER_COMPATIBLE_MAP[name].forEach(function (otherName) {
            recognizer.recognizeWith(otherName);
          });
        }
      });
    }

    this.eventHandlers = [];

    // Handle events not handled by Hammer.js:
    // - mouse wheel
    // - pointer/touch/mouse move
    this._onOtherEvent = this._onOtherEvent.bind(this);
    this.wheelInput = new WheelInput(element, this._onOtherEvent, {
      enable: false
    });
    this.moveInput = new MoveInput(element, this._onOtherEvent, {
      enable: false
    });
    this.keyInput = new KeyInput(element, this._onOtherEvent, { enable: false });

    if (options.rightButton) {
      // Block right click
      element.addEventListener('contextmenu', preventDefault);
    }

    // Register all passed events.
    var events = options.events;

    if (events) {
      this.on(events);
    }
  }

  // Tear down internal event management implementations.


  _createClass(EventManager, [{
    key: 'destroy',
    value: function destroy() {
      this.element.removeEventListener('contextmenu', preventDefault);

      this.wheelInput.destroy();
      this.moveInput.destroy();
      this.keyInput.destroy();
      this.manager.destroy();
    }

    // Register an event handler function to be called on `event`.

  }, {
    key: 'on',
    value: function on(event, handler, srcElement) {
      if (typeof event === 'string') {
        this._addEventHandler(event, handler, srcElement);
      } else {
        srcElement = handler;
        // If `event` is a map, call `on()` for each entry.
        for (var eventName in event) {
          this._addEventHandler(eventName, event[eventName], srcElement);
        }
      }
    }

    /**
     * Deregister a previously-registered event handler.
     * @param {string|Object} event   An event name (String) or map of event names to handlers
     * @param {Function} [handler]    The function to be called on `event`.
     */

  }, {
    key: 'off',
    value: function off(event, handler) {
      if (typeof event === 'string') {
        this._removeEventHandler(event, handler);
      } else {
        // If `event` is a map, call `off()` for each entry.
        for (var eventName in event) {
          this._removeEventHandler(eventName, event[eventName]);
        }
      }
    }

    /*
     * Enable/disable recognizer for the given event
     */

  }, {
    key: '_toggleRecognizer',
    value: function _toggleRecognizer(name, enabled) {
      var _this2 = this;

      var recognizer = this.manager.get(name);
      if (recognizer) {
        recognizer.set({ enable: enabled });

        var fallbackRecognizers = RECOGNIZER_FALLBACK_MAP[name];
        if (fallbackRecognizers && !this.options.recognizers) {
          // Set default require failures
          // http://hammerjs.github.io/require-failure/
          fallbackRecognizers.forEach(function (otherName) {
            var otherRecognizer = _this2.manager.get(otherName);
            if (enabled) {
              // Wait for this recognizer to fail
              otherRecognizer.requireFailure(name);
            } else {
              // Do not wait for this recognizer to fail
              otherRecognizer.dropRequireFailure(name);
            }
          });
        }
      }
      this.wheelInput.enableEventType(name, enabled);
      this.moveInput.enableEventType(name, enabled);
      this.keyInput.enableEventType(name, enabled);
    }

    /**
     * Process the event registration for a single event + handler.
     */

  }, {
    key: '_addEventHandler',
    value: function _addEventHandler(event, handler) {
      var _this3 = this;

      var srcElement = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

      var wrappedHandler = this._wrapEventHandler(event, handler, srcElement);
      // Alias to a recognized gesture as necessary.
      var eventAlias = GESTURE_EVENT_ALIASES[event] || event;
      // Get recognizer for this event
      var recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
      // Enable recognizer for this event.
      this._toggleRecognizer(recognizerName, true);

      // Find ancestors
      var ancestorEventHandlers = this.eventHandlers.filter(function (entry) {
        return entry.eventAlias === eventAlias && entry.srcElement !== srcElement && (!entry.srcElement || entry.srcElement.contains(srcElement));
      });

      // Save wrapped handler
      this.eventHandlers.push({
        event: event,
        eventAlias: eventAlias,
        recognizerName: recognizerName,
        srcElement: srcElement,
        handler: handler,
        wrappedHandler: wrappedHandler
      });

      // Sort handlers by DOM hierarchy
      // So the event will always fire first on child nodes
      ancestorEventHandlers.forEach(function (entry) {
        return _this3.manager.off(eventAlias, entry.wrappedHandler);
      });
      this.manager.on(eventAlias, wrappedHandler);
      ancestorEventHandlers.forEach(function (entry) {
        return _this3.manager.on(eventAlias, entry.wrappedHandler);
      });
    }

    /**
     * Process the event deregistration for a single event + handler.
     */

  }, {
    key: '_removeEventHandler',
    value: function _removeEventHandler(event, handler) {
      var eventHandlerRemoved = false;

      // Find saved handler if any.
      for (var i = this.eventHandlers.length; i--;) {
        var entry = this.eventHandlers[i];
        if (entry.event === event && entry.handler === handler) {
          // Deregister event handler.
          this.manager.off(entry.eventAlias, entry.wrappedHandler);
          // Delete saved handler
          this.eventHandlers.splice(i, 1);
          eventHandlerRemoved = true;
        }
      }

      if (eventHandlerRemoved) {
        // Alias to a recognized gesture as necessary.
        var eventAlias = GESTURE_EVENT_ALIASES[event] || event;
        // Get recognizer for this event
        var recognizerName = EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
        // Disable recognizer if no more handlers are attached to its events
        var isRecognizerUsed = this.eventHandlers.find(function (entry) {
          return entry.recognizerName === recognizerName;
        });
        if (!isRecognizerUsed) {
          this._toggleRecognizer(recognizerName, false);
        }
      }
    }

    /**
     * Returns an event handler that aliases events and add props before passing
     * to the real handler.
     */

  }, {
    key: '_wrapEventHandler',
    value: function _wrapEventHandler(type, handler, srcElement) {
      var _this4 = this;

      return function (event) {
        var mjolnirEvent = event.mjolnirEvent;


        if (!mjolnirEvent) {
          mjolnirEvent = _this4._normalizeEvent(event);
          event.mjolnirEvent = mjolnirEvent;
        }

        var isStopped = mjolnirEvent.handled && mjolnirEvent.handled !== srcElement;

        if (!isStopped) {
          var isFromDecendant = !srcElement || srcElement.contains(event.srcEvent.target);
          if (isFromDecendant) {
            handler(Object.assign({}, mjolnirEvent, {
              type: type,
              stopPropagation: function stopPropagation() {
                if (!mjolnirEvent.handled) {
                  mjolnirEvent.handled = srcElement;
                }
              }
            }));
          }
        }
      };
    }

    /**
     * Normalizes hammerjs and custom events to have predictable fields.
     */

  }, {
    key: '_normalizeEvent',
    value: function _normalizeEvent(event) {
      var element = this.element;


      return Object.assign({}, event, whichButtons(event), getOffsetPosition(event, element), {
        handled: false,
        rootElement: element
      });
    }

    /**
     * Handle basic events using the 'hammer.input' Hammer.js API:
     * Before running Recognizers, Hammer emits a 'hammer.input' event
     * with the basic event info. This function emits all basic events
     * aliased to the "class" of event received.
     * See constants.BASIC_EVENT_CLASSES basic event class definitions.
     */

  }, {
    key: '_onBasicInput',
    value: function _onBasicInput(event) {
      var srcEvent = event.srcEvent;

      var alias = BASIC_EVENT_ALIASES[srcEvent.type];
      if (alias) {
        // fire all events aliased to srcEvent.type
        this.manager.emit(alias, event);
      }
    }

    /**
     * Handle events not supported by Hammer.js,
     * and pipe back out through same (Hammer) channel used by other events.
     */

  }, {
    key: '_onOtherEvent',
    value: function _onOtherEvent(event) {
      this.manager.emit(event.type, event);
    }
  }]);

  return EventManager;
}();

export default EventManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9ldmVudC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbIk1hbmFnZXIiLCJXaGVlbElucHV0IiwiTW92ZUlucHV0IiwiS2V5SW5wdXQiLCJCQVNJQ19FVkVOVF9BTElBU0VTIiwiRVZFTlRfUkVDT0dOSVpFUl9NQVAiLCJHRVNUVVJFX0VWRU5UX0FMSUFTRVMiLCJSRUNPR05JWkVSUyIsIlJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVAiLCJSRUNPR05JWkVSX0ZBTExCQUNLX01BUCIsIndoaWNoQnV0dG9ucyIsImdldE9mZnNldFBvc2l0aW9uIiwicHJldmVudERlZmF1bHQiLCJldnQiLCJFdmVudE1hbmFnZXIiLCJlbGVtZW50Iiwib3B0aW9ucyIsIl9vbkJhc2ljSW5wdXQiLCJiaW5kIiwiTWFuYWdlckNsYXNzIiwibWFuYWdlciIsInJlY29nbml6ZXJzIiwib24iLCJPYmplY3QiLCJrZXlzIiwiZm9yRWFjaCIsInJlY29nbml6ZXIiLCJnZXQiLCJuYW1lIiwicmVjb2duaXplV2l0aCIsIm90aGVyTmFtZSIsImV2ZW50SGFuZGxlcnMiLCJfb25PdGhlckV2ZW50Iiwid2hlZWxJbnB1dCIsImVuYWJsZSIsIm1vdmVJbnB1dCIsImtleUlucHV0IiwicmlnaHRCdXR0b24iLCJhZGRFdmVudExpc3RlbmVyIiwiZXZlbnRzIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImRlc3Ryb3kiLCJldmVudCIsImhhbmRsZXIiLCJzcmNFbGVtZW50IiwiX2FkZEV2ZW50SGFuZGxlciIsImV2ZW50TmFtZSIsIl9yZW1vdmVFdmVudEhhbmRsZXIiLCJlbmFibGVkIiwic2V0IiwiZmFsbGJhY2tSZWNvZ25pemVycyIsIm90aGVyUmVjb2duaXplciIsInJlcXVpcmVGYWlsdXJlIiwiZHJvcFJlcXVpcmVGYWlsdXJlIiwiZW5hYmxlRXZlbnRUeXBlIiwid3JhcHBlZEhhbmRsZXIiLCJfd3JhcEV2ZW50SGFuZGxlciIsImV2ZW50QWxpYXMiLCJyZWNvZ25pemVyTmFtZSIsIl90b2dnbGVSZWNvZ25pemVyIiwiYW5jZXN0b3JFdmVudEhhbmRsZXJzIiwiZmlsdGVyIiwiZW50cnkiLCJjb250YWlucyIsInB1c2giLCJvZmYiLCJldmVudEhhbmRsZXJSZW1vdmVkIiwiaSIsImxlbmd0aCIsInNwbGljZSIsImlzUmVjb2duaXplclVzZWQiLCJmaW5kIiwidHlwZSIsIm1qb2xuaXJFdmVudCIsIl9ub3JtYWxpemVFdmVudCIsImlzU3RvcHBlZCIsImhhbmRsZWQiLCJpc0Zyb21EZWNlbmRhbnQiLCJzcmNFdmVudCIsInRhcmdldCIsImFzc2lnbiIsInN0b3BQcm9wYWdhdGlvbiIsInJvb3RFbGVtZW50IiwiYWxpYXMiLCJlbWl0Il0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBU0EsT0FBVCxRQUF3QixnQkFBeEI7O0FBRUEsT0FBT0MsVUFBUCxNQUF1QixzQkFBdkI7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLHFCQUF0QjtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsb0JBQXJCOztBQUVBLFNBQ0VDLG1CQURGLEVBRUVDLG9CQUZGLEVBR0VDLHFCQUhGLEVBSUVDLFdBSkYsRUFLRUMseUJBTEYsRUFNRUMsdUJBTkYsUUFPTyxhQVBQOztBQVNBLFNBQVNDLFlBQVQsRUFBdUJDLGlCQUF2QixRQUFnRCxxQkFBaEQ7O0FBRUEsU0FBU0MsY0FBVCxDQUF3QkMsR0FBeEIsRUFBNkIsQ0FBRTs7QUFFL0I7QUFDQTtBQUNBO0FBQ0E7O0lBQ3FCQyxZO0FBQ25CLHdCQUFZQyxPQUFaLEVBQW1DO0FBQUE7O0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJOztBQUFBOztBQUNqQyxTQUFLRCxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLQyxPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLQyxhQUFMLEdB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eEIsRUFBOEI5QixLQUE5QjtBQUNEOzs7Ozs7ZUE3UWtCNUIsWSIsImZpbGUiOiJldmVudC1tYW5hZ2VyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHsgTWFuYWdlciB9IGZyb20gJy4vdXRpbHMvaGFtbWVyJ1xuXG5pbXBvcnQgV2hlZWxJbnB1dCBmcm9tICcuL2lucHV0cy93aGVlbC1pbnB1dCdcbmltcG9ydCBNb3ZlSW5wdXQgZnJvbSAnLi9pbnB1dHMvbW92ZS1pbnB1dCdcbmltcG9ydCBLZXlJbnB1dCBmcm9tICcuL2lucHV0cy9rZXktaW5wdXQnXG5cbmltcG9ydCB7XG4gIEJBU0lDX0VWRU5UX0FMSUFTRVMsXG4gIEVWRU5UX1JFQ09HTklaRVJfTUFQLFxuICBHRVNUVVJFX0VWRU5UX0FMSUFTRVMsXG4gIFJFQ09HTklaRVJTLFxuICBSRUNPR05JWkVSX0NPTVBBVElCTEVfTUFQLFxuICBSRUNPR05JWkVSX0ZBTExCQUNLX01BUFxufSBmcm9tICcuL2NvbnN0YW50cydcblxuaW1wb3J0IHsgd2hpY2hCdXR0b25zLCBnZXRPZmZzZXRQb3NpdGlvbiB9IGZyb20gJy4vdXRpbHMvZXZlbnQtdXRpbHMnXG5cbmZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGV2dCkge31cblxuLy8gVW5pZmllZCBBUEkgZm9yIHN1YnNjcmliaW5nIHRvIGV2ZW50cyBhYm91dCBib3RoXG4vLyBiYXNpYyBpbnB1dCBldmVudHMgKGUuZy4gJ21vdXNlbW92ZScsICd0b3VjaHN0YXJ0JywgJ3doZWVsJylcbi8vIGFuZCBnZXN0dXJhbCBpbnB1dCAoZS5nLiAnY2xpY2snLCAndGFwJywgJ3BhbnN0YXJ0JykuXG4vLyBEZWxlZ2F0ZXMgZ2VzdHVyZSByZWxhdGVkIGV2ZW50IHJlZ2lzdHJhdGlvbiBhbmQgaGFuZGxpbmcgdG8gSGFtbWVyLmpzLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnNcbiAgICB0aGlzLl9vbkJhc2ljSW5wdXQgPSB0aGlzLl9vbkJhc2ljSW5wdXQuYmluZCh0aGlzKVxuXG4gICAgY29uc3QgTWFuYWdlckNsYXNzID0gb3B0aW9ucy5NYW5hZ2VyIHx8IE1hbmFnZXJcblxuICAgIHRoaXMubWFuYWdlciA9IG5ldyBNYW5hZ2VyQ2xhc3MoZWxlbWVudCwge1xuICAgICAgcmVjb2duaXplcnM6IG9wdGlvbnMucmVjb2duaXplcnMgfHwgUkVDT0dOSVpFUlNcbiAgICB9KS5vbignaGFtbWVyLmlucHV0JywgdGhpcy5fb25CYXNpY0lucHV0KVxuXG4gICAgaWYgKCFvcHRpb25zLnJlY29nbml6ZXJzKSB7XG4gICAgICAvLyBTZXQgZGVmYXVsdCByZWNvZ25pemUgd2l0aHNcbiAgICAgIC8vIGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vcmVjb2duaXplLXdpdGgvXG4gICAgICBPYmplY3Qua2V5cyhSRUNPR05JWkVSX0NPTVBBVElCTEVfTUFQKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBjb25zdCByZWNvZ25pemVyID0gdGhpcy5tYW5hZ2VyLmdldChuYW1lKVxuICAgICAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgICAgIFJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVBbbmFtZV0uZm9yRWFjaChvdGhlck5hbWUgPT4ge1xuICAgICAgICAgICAgcmVjb2duaXplci5yZWNvZ25pemVXaXRoKG90aGVyTmFtZSlcbiAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIHRoaXMuZXZlbnRIYW5kbGVycyA9IFtdXG5cbiAgICAvLyBIYW5kbGUgZXZlbnRzIG5vdCBoYW5kbGVkIGJ5IEhhbW1lci5qczpcbiAgICAvLyAtIG1vdXNlIHdoZWVsXG4gICAgLy8gLSBwb2ludGVyL3RvdWNoL21vdXNlIG1vdmVcbiAgICB0aGlzLl9vbk90aGVyRXZlbnQgPSB0aGlzLl9vbk90aGVyRXZlbnQuYmluZCh0aGlzKVxuICAgIHRoaXMud2hlZWxJbnB1dCA9IG5ldyBXaGVlbElucHV0KGVsZW1lbnQsIHRoaXMuX29uT3RoZXJFdmVudCwge1xuICAgICAgZW5hYmxlOiBmYWxzZVxuICAgIH0pXG4gICAgdGhpcy5tb3ZlSW5wdXQgPSBuZXcgTW92ZUlucHV0KGVsZW1lbnQsIHRoaXMuX29uT3RoZXJFdmVudCwge1xuICAgICAgZW5hYmxlOiBmYWxzZVxuICAgIH0pXG4gICAgdGhpcy5rZXlJbnB1dCA9IG5ldyBLZXlJbnB1dChlbGVtZW50LCB0aGlzLl9vbk90aGVyRXZlbnQsIHsgZW5hYmxlOiBmYWxzZSB9KVxuXG4gICAgaWYgKG9wdGlvbnMucmlnaHRCdXR0b24pIHtcbiAgICAgIC8vIEJsb2NrIHJpZ2h0IGNsaWNrXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgcHJldmVudERlZmF1bHQpXG4gICAgfVxuXG4gICAgLy8gUmVnaXN0ZXIgYWxsIHBhc3NlZCBldmVudHMuXG4gICAgY29uc3QgeyBldmVudHMgfSA9IG9wdGlvbnNcbiAgICBpZiAoZXZlbnRzKSB7XG4gICAgICB0aGlzLm9uKGV2ZW50cylcbiAgICB9XG4gIH1cblxuICAvLyBUZWFyIGRvd24gaW50ZXJuYWwgZXZlbnQgbWFuYWdlbWVudCBpbXBsZW1lbnRhdGlvbnMuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgcHJldmVudERlZmF1bHQpXG5cbiAgICB0aGlzLndoZWVsSW5wdXQuZGVzdHJveSgpXG4gICAgdGhpcy5tb3ZlSW5wdXQuZGVzdHJveSgpXG4gICAgdGhpcy5rZXlJbnB1dC5kZXN0cm95KClcbiAgICB0aGlzLm1hbmFnZXIuZGVzdHJveSgpXG4gIH1cblxuICAvLyBSZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBgZXZlbnRgLlxuICBvbihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudCkge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9hZGRFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIsIHNyY0VsZW1lbnQpXG4gICAgfSBlbHNlIHtcbiAgICAgIHNyY0VsZW1lbnQgPSBoYW5kbGVyXG4gICAgICAvLyBJZiBgZXZlbnRgIGlzIGEgbWFwLCBjYWxsIGBvbigpYCBmb3IgZWFjaCBlbnRyeS5cbiAgICAgIGZvciAoY29uc3QgZXZlbnROYW1lIGluIGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX2FkZEV2ZW50SGFuZGxlcihldmVudE5hbWUsIGV2ZW50W2V2ZW50TmFtZV0sIHNyY0VsZW1lbnQpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlcmVnaXN0ZXIgYSBwcmV2aW91c2x5LXJlZ2lzdGVyZWQgZXZlbnQgaGFuZGxlci5cbiAgICogQHBhcmFtIHtzdHJpbmd8T2JqZWN0fSBldmVudCAgIEFuIGV2ZW50IG5hbWUgKFN0cmluZykgb3IgbWFwIG9mIGV2ZW50IG5hbWVzIHRvIGhhbmRsZXJzXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXSAgICBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGBldmVudGAuXG4gICAqL1xuICBvZmYoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgZXZlbnRgIGlzIGEgbWFwLCBjYWxsIGBvZmYoKWAgZm9yIGVhY2ggZW50cnkuXG4gICAgICBmb3IgKGNvbnN0IGV2ZW50TmFtZSBpbiBldmVudCkge1xuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnROYW1lLCBldmVudFtldmVudE5hbWVdKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIEVuYWJsZS9kaXNhYmxlIHJlY29nbml6ZXIgZm9yIHRoZSBnaXZlbiBldmVudFxuICAgKi9cbiAgX3RvZ2dsZVJlY29nbml6ZXIobmFtZSwgZW5hYmxlZCkge1xuICAgIGNvbnN0IHJlY29nbml6ZXIgPSB0aGlzLm1hbmFnZXIuZ2V0KG5hbWUpXG4gICAgaWYgKHJlY29nbml6ZXIpIHtcbiAgICAgIHJlY29nbml6ZXIuc2V0KHsgZW5hYmxlOiBlbmFibGVkIH0pXG5cbiAgICAgIGNvbnN0IGZhbGxiYWNrUmVjb2duaXplcnMgPSBSRUNPR05JWkVSX0ZBTExCQUNLX01BUFtuYW1lXVxuICAgICAgaWYgKGZhbGxiYWNrUmVjb2duaXplcnMgJiYgIXRoaXMub3B0aW9ucy5yZWNvZ25pemVycykge1xuICAgICAgICAvLyBTZXQgZGVmYXVsdCByZXF1aXJlIGZhaWx1cmVzXG4gICAgICAgIC8vIGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vcmVxdWlyZS1mYWlsdXJlL1xuICAgICAgICBmYWxsYmFja1JlY29nbml6ZXJzLmZvckVhY2gob3RoZXJOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBvdGhlclJlY29nbml6ZXIgPSB0aGlzLm1hbmFnZXIuZ2V0KG90aGVyTmFtZSlcbiAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhpcyByZWNvZ25pemVyIHRvIGZhaWxcbiAgICAgICAgICAgIG90aGVyUmVjb2duaXplci5yZXF1aXJlRmFpbHVyZShuYW1lKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBEbyBub3Qgd2FpdCBmb3IgdGhpcyByZWNvZ25pemVyIHRvIGZhaWxcbiAgICAgICAgICAgIG90aGVyUmVjb2duaXplci5kcm9wUmVxdWlyZUZhaWx1cmUobmFtZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMud2hlZWxJbnB1dC5lbmFibGVFdmVudFR5cGUobmFtZSwgZW5hYmxlZClcbiAgICB0aGlzLm1vdmVJbnB1dC5lbmFibGVFdmVudFR5cGUobmFtZSwgZW5hYmxlZClcbiAgICB0aGlzLmtleUlucHV0LmVuYWJsZUV2ZW50VHlwZShuYW1lLCBlbmFibGVkKVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgdGhlIGV2ZW50IHJlZ2lzdHJhdGlvbiBmb3IgYSBzaW5nbGUgZXZlbnQgKyBoYW5kbGVyLlxuICAgKi9cbiAgX2FkZEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudCA9IG51bGwpIHtcbiAgICBjb25zdCB3cmFwcGVkSGFuZGxlciA9IHRoaXMuX3dyYXBFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIsIHNyY0VsZW1lbnQpXG4gICAgLy8gQWxpYXMgdG8gYSByZWNvZ25pemVkIGdlc3R1cmUgYXMgbmVjZXNzYXJ5LlxuICAgIGNvbnN0IGV2ZW50QWxpYXMgPSBHRVNUVVJFX0VWRU5UX0FMSUFTRVNbZXZlbnRdIHx8IGV2ZW50XG4gICAgLy8gR2V0IHJlY29nbml6ZXIgZm9yIHRoaXMgZXZlbnRcbiAgICBjb25zdCByZWNvZ25pemVyTmFtZSA9IEVWRU5UX1JFQ09HTklaRVJfTUFQW2V2ZW50QWxpYXNdIHx8IGV2ZW50QWxpYXNcbiAgICAvLyBFbmFibGUgcmVjb2duaXplciBmb3IgdGhpcyBldmVudC5cbiAgICB0aGlzLl90b2dnbGVSZWNvZ25pemVyKHJlY29nbml6ZXJOYW1lLCB0cnVlKVxuXG4gICAgLy8gRmluZCBhbmNlc3RvcnNcbiAgICBjb25zdCBhbmNlc3RvckV2ZW50SGFuZGxlcnMgPSB0aGlzLmV2ZW50SGFuZGxlcnMuZmlsdGVyKGVudHJ5ID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGVudHJ5LmV2ZW50QWxpYXMgPT09IGV2ZW50QWxpYXMgJiZcbiAgICAgICAgZW50cnkuc3JjRWxlbWVudCAhPT0gc3JjRWxlbWVudCAmJlxuICAgICAgICAoIWVudHJ5LnNyY0VsZW1lbnQgfHwgZW50cnkuc3JjRWxlbWVudC5jb250YWlucyhzcmNFbGVtZW50KSlcbiAgICAgIClcbiAgICB9KVxuXG4gICAgLy8gU2F2ZSB3cmFwcGVkIGhhbmRsZXJcbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMucHVzaCh7XG4gICAgICBldmVudCxcbiAgICAgIGV2ZW50QWxpYXMsXG4gICAgICByZWNvZ25pemVyTmFtZSxcbiAgICAgIHNyY0VsZW1lbnQsXG4gICAgICBoYW5kbGVyLFxuICAgICAgd3JhcHBlZEhhbmRsZXJcbiAgICB9KVxuXG4gICAgLy8gU29ydCBoYW5kbGVycyBieSBET00gaGllcmFyY2h5XG4gICAgLy8gU28gdGhlIGV2ZW50IHdpbGwgYWx3YXlzIGZpcmUgZmlyc3Qgb24gY2hpbGQgbm9kZXNcbiAgICBhbmNlc3RvckV2ZW50SGFuZGxlcnMuZm9yRWFjaChlbnRyeSA9PlxuICAgICAgdGhpcy5tYW5hZ2VyLm9mZihldmVudEFsaWFzLCBlbnRyeS53cmFwcGVkSGFuZGxlcilcbiAgICApXG4gICAgdGhpcy5tYW5hZ2VyLm9uKGV2ZW50QWxpYXMsIHdyYXBwZWRIYW5kbGVyKVxuICAgIGFuY2VzdG9yRXZlbnRIYW5kbGVycy5mb3JFYWNoKGVudHJ5ID0+XG4gICAgICB0aGlzLm1hbmFnZXIub24oZXZlbnRBbGlhcywgZW50cnkud3JhcHBlZEhhbmRsZXIpXG4gICAgKVxuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgdGhlIGV2ZW50IGRlcmVnaXN0cmF0aW9uIGZvciBhIHNpbmdsZSBldmVudCArIGhhbmRsZXIuXG4gICAqL1xuICBfcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgbGV0IGV2ZW50SGFuZGxlclJlbW92ZWQgPSBmYWxzZVxuXG4gICAgLy8gRmluZCBzYXZlZCBoYW5kbGVyIGlmIGFueS5cbiAgICBmb3IgKGxldCBpID0gdGhpcy5ldmVudEhhbmRsZXJzLmxlbmd0aDsgaS0tOyApIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5ldmVudEhhbmRsZXJzW2ldXG4gICAgICBpZiAoZW50cnkuZXZlbnQgPT09IGV2ZW50ICYmIGVudHJ5LmhhbmRsZXIgPT09IGhhbmRsZXIpIHtcbiAgICAgICAgLy8gRGVyZWdpc3RlciBldmVudCBoYW5kbGVyLlxuICAgICAgICB0aGlzLm1hbmFnZXIub2ZmKGVudHJ5LmV2ZW50QWxpYXMsIGVudHJ5LndyYXBwZWRIYW5kbGVyKVxuICAgICAgICAvLyBEZWxldGUgc2F2ZWQgaGFuZGxlclxuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc3BsaWNlKGksIDEpXG4gICAgICAgIGV2ZW50SGFuZGxlclJlbW92ZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50SGFuZGxlclJlbW92ZWQpIHtcbiAgICAgIC8vIEFsaWFzIHRvIGEgcmVjb2duaXplZCBnZXN0dXJlIGFzIG5lY2Vzc2FyeS5cbiAgICAgIGNvbnN0IGV2ZW50QWxpYXMgPSBHRVNUVVJFX0VWRU5UX0FMSUFTRVNbZXZlbnRdIHx8IGV2ZW50XG4gICAgICAvLyBHZXQgcmVjb2duaXplciBmb3IgdGhpcyBldmVudFxuICAgICAgY29uc3QgcmVjb2duaXplck5hbWUgPSBFVkVOVF9SRUNPR05JWkVSX01BUFtldmVudEFsaWFzXSB8fCBldmVudEFsaWFzXG4gICAgICAvLyBEaXNhYmxlIHJlY29nbml6ZXIgaWYgbm8gbW9yZSBoYW5kbGVycyBhcmUgYXR0YWNoZWQgdG8gaXRzIGV2ZW50c1xuICAgICAgY29uc3QgaXNSZWNvZ25pemVyVXNlZCA9IHRoaXMuZXZlbnRIYW5kbGVycy5maW5kKFxuICAgICAgICBlbnRyeSA9PiBlbnRyeS5yZWNvZ25pemVyTmFtZSA9PT0gcmVjb2duaXplck5hbWVcbiAgICAgIClcbiAgICAgIGlmICghaXNSZWNvZ25pemVyVXNlZCkge1xuICAgICAgICB0aGlzLl90b2dnbGVSZWNvZ25pemVyKHJlY29nbml6ZXJOYW1lLCBmYWxzZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBldmVudCBoYW5kbGVyIHRoYXQgYWxpYXNlcyBldmVudHMgYW5kIGFkZCBwcm9wcyBiZWZvcmUgcGFzc2luZ1xuICAgKiB0byB0aGUgcmVhbCBoYW5kbGVyLlxuICAgKi9cbiAgX3dyYXBFdmVudEhhbmRsZXIodHlwZSwgaGFuZGxlciwgc3JjRWxlbWVudCkge1xuICAgIHJldHVybiBldmVudCA9PiB7XG4gICAgICBsZXQgeyBtam9sbmlyRXZlbnQgfSA9IGV2ZW50XG5cbiAgICAgIGlmICghbWpvbG5pckV2ZW50KSB7XG4gICAgICAgIG1qb2xuaXJFdmVudCA9IHRoaXMuX25vcm1hbGl6ZUV2ZW50KGV2ZW50KVxuICAgICAgICBldmVudC5tam9sbmlyRXZlbnQgPSBtam9sbmlyRXZlbnRcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNTdG9wcGVkID1cbiAgICAgICAgbWpvbG5pckV2ZW50LmhhbmRsZWQgJiYgbWpvbG5pckV2ZW50LmhhbmRsZWQgIT09IHNyY0VsZW1lbnRcblxuICAgICAgaWYgKCFpc1N0b3BwZWQpIHtcbiAgICAgICAgY29uc3QgaXNGcm9tRGVjZW5kYW50ID1cbiAgICAgICAgICAhc3JjRWxlbWVudCB8fCBzcmNFbGVtZW50LmNvbnRhaW5zKGV2ZW50LnNyY0V2ZW50LnRhcmdldClcbiAgICAgICAgaWYgKGlzRnJvbURlY2VuZGFudCkge1xuICAgICAgICAgIGhhbmRsZXIoXG4gICAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBtam9sbmlyRXZlbnQsIHtcbiAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgc3RvcFByb3BhZ2F0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCFtam9sbmlyRXZlbnQuaGFuZGxlZCkge1xuICAgICAgICAgICAgICAgICAgbWpvbG5pckV2ZW50LmhhbmRsZWQgPSBzcmNFbGVtZW50XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGhhbW1lcmpzIGFuZCBjdXN0b20gZXZlbnRzIHRvIGhhdmUgcHJlZGljdGFibGUgZmllbGRzLlxuICAgKi9cbiAgX25vcm1hbGl6ZUV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3QgeyBlbGVtZW50IH0gPSB0aGlzXG5cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihcbiAgICAgIHt9LFxuICAgICAgZXZlbnQsXG4gICAgICB3aGljaEJ1dHRvbnMoZXZlbnQpLFxuICAgICAgZ2V0T2Zmc2V0UG9zaXRpb24oZXZlbnQsIGVsZW1lbnQpLFxuICAgICAge1xuICAgICAgICBoYW5kbGVkOiBmYWxzZSxcbiAgICAgICAgcm9vdEVsZW1lbnQ6IGVsZW1lbnRcbiAgICAgIH1cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGJhc2ljIGV2ZW50cyB1c2luZyB0aGUgJ2hhbW1lci5pbnB1dCcgSGFtbWVyLmpzIEFQSTpcbiAgICogQmVmb3JlIHJ1bm5pbmcgUmVjb2duaXplcnMsIEhhbW1lciBlbWl0cyBhICdoYW1tZXIuaW5wdXQnIGV2ZW50XG4gICAqIHdpdGggdGhlIGJhc2ljIGV2ZW50IGluZm8uIFRoaXMgZnVuY3Rpb24gZW1pdHMgYWxsIGJhc2ljIGV2ZW50c1xuICAgKiBhbGlhc2VkIHRvIHRoZSBcImNsYXNzXCIgb2YgZXZlbnQgcmVjZWl2ZWQuXG4gICAqIFNlZSBjb25zdGFudHMuQkFTSUNfRVZFTlRfQ0xBU1NFUyBiYXNpYyBldmVudCBjbGFzcyBkZWZpbml0aW9ucy5cbiAgICovXG4gIF9vbkJhc2ljSW5wdXQoZXZlbnQpIHtcbiAgICBjb25zdCB7IHNyY0V2ZW50IH0gPSBldmVudFxuICAgIGNvbnN0IGFsaWFzID0gQkFTSUNfRVZFTlRfQUxJQVNFU1tzcmNFdmVudC50eXBlXVxuICAgIGlmIChhbGlhcykge1xuICAgICAgLy8gZmlyZSBhbGwgZXZlbnRzIGFsaWFzZWQgdG8gc3JjRXZlbnQudHlwZVxuICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQoYWxpYXMsIGV2ZW50KVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZXZlbnRzIG5vdCBzdXBwb3J0ZWQgYnkgSGFtbWVyLmpzLFxuICAgKiBhbmQgcGlwZSBiYWNrIG91dCB0aHJvdWdoIHNhbWUgKEhhbW1lcikgY2hhbm5lbCB1c2VkIGJ5IG90aGVyIGV2ZW50cy5cbiAgICovXG4gIF9vbk90aGVyRXZlbnQoZXZlbnQpIHtcbiAgICB0aGlzLm1hbmFnZXIuZW1pdChldmVudC50eXBlLCBldmVudClcbiAgfVxufVxuIl19