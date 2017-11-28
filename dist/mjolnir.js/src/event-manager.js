'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _hammer = require('./utils/hammer');

var _wheelInput = require('./inputs/wheel-input');

var _wheelInput2 = _interopRequireDefault(_wheelInput);

var _moveInput = require('./inputs/move-input');

var _moveInput2 = _interopRequireDefault(_moveInput);

var _keyInput = require('./inputs/key-input');

var _keyInput2 = _interopRequireDefault(_keyInput);

var _constants = require('./constants');

var _eventUtils = require('./utils/event-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function preventDefault(evt) {}

// Unified API for subscribing to events about both
// basic input events (e.g. 'mousemove', 'touchstart', 'wheel')
// and gestural input (e.g. 'click', 'tap', 'panstart').
// Delegates gesture related event registration and handling to Hammer.js.

var EventManager = function () {
  function EventManager(element) {
    var _this = this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    (0, _classCallCheck3.default)(this, EventManager);

    this.element = element;
    this.options = options;
    this._onBasicInput = this._onBasicInput.bind(this);

    var ManagerClass = options.Manager || _hammer.Manager;

    this.manager = new ManagerClass(element, {
      recognizers: options.recognizers || _constants.RECOGNIZERS
    }).on('hammer.input', this._onBasicInput);

    if (!options.recognizers) {
      // Set default recognize withs
      // http://hammerjs.github.io/recognize-with/
      (0, _keys2.default)(_constants.RECOGNIZER_COMPATIBLE_MAP).forEach(function (name) {
        var recognizer = _this.manager.get(name);
        if (recognizer) {
          _constants.RECOGNIZER_COMPATIBLE_MAP[name].forEach(function (otherName) {
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
    this.wheelInput = new _wheelInput2.default(element, this._onOtherEvent, {
      enable: false
    });
    this.moveInput = new _moveInput2.default(element, this._onOtherEvent, {
      enable: false
    });
    this.keyInput = new _keyInput2.default(element, this._onOtherEvent, { enable: false });

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


  (0, _createClass3.default)(EventManager, [{
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

        var fallbackRecognizers = _constants.RECOGNIZER_FALLBACK_MAP[name];
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
      var eventAlias = _constants.GESTURE_EVENT_ALIASES[event] || event;
      // Get recognizer for this event
      var recognizerName = _constants.EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
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
        var eventAlias = _constants.GESTURE_EVENT_ALIASES[event] || event;
        // Get recognizer for this event
        var recognizerName = _constants.EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias;
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
            handler((0, _assign2.default)({}, mjolnirEvent, {
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


      return (0, _assign2.default)({}, event, (0, _eventUtils.whichButtons)(event), (0, _eventUtils.getOffsetPosition)(event, element), {
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

      var alias = _constants.BASIC_EVENT_ALIASES[srcEvent.type];
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

exports.default = EventManager;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9ldmVudC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbInByZXZlbnREZWZhdWx0IiwiZXZ0IiwiRXZlbnRNYW5hZ2VyIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfb25CYXNpY0lucHV0IiwiYmluZCIsIk1hbmFnZXJDbGFzcyIsIk1hbmFnZXIiLCJtYW5hZ2VyIiwicmVjb2duaXplcnMiLCJvbiIsImZvckVhY2giLCJyZWNvZ25pemVyIiwiZ2V0IiwibmFtZSIsInJlY29nbml6ZVdpdGgiLCJvdGhlck5hbWUiLCJldmVudEhhbmRsZXJzIiwiX29uT3RoZXJFdmVudCIsIndoZWVsSW5wdXQiLCJlbmFibGUiLCJtb3ZlSW5wdXQiLCJrZXlJbnB1dCIsInJpZ2h0QnV0dG9uIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50cyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkZXN0cm95IiwiZXZlbnQiLCJoYW5kbGVyIiwic3JjRWxlbWVudCIsIl9hZGRFdmVudEhhbmRsZXIiLCJldmVudE5hbWUiLCJfcmVtb3ZlRXZlbnRIYW5kbGVyIiwiZW5hYmxlZCIsInNldCIsImZhbGxiYWNrUmVjb2duaXplcnMiLCJvdGhlclJlY29nbml6ZXIiLCJyZXF1aXJlRmFpbHVyZSIsImRyb3BSZXF1aXJlRmFpbHVyZSIsImVuYWJsZUV2ZW50VHlwZSIsIndyYXBwZWRIYW5kbGVyIiwiX3dyYXBFdmVudEhhbmRsZXIiLCJldmVudEFsaWFzIiwicmVjb2duaXplck5hbWUiLCJfdG9nZ2xlUmVjb2duaXplciIsImFuY2VzdG9yRXZlbnRIYW5kbGVycyIsImZpbHRlciIsImVudHJ5IiwiY29udGFpbnMiLCJwdXNoIiwib2ZmIiwiZXZlbnRIYW5kbGVyUmVtb3ZlZCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJpc1JlY29nbml6ZXJVc2VkIiwiZmluZCIsInR5cGUiLCJtam9sbmlyRXZlbnQiLCJfbm9ybWFsaXplRXZlbnQiLCJpc1N0b3BwZWQiLCJoYW5kbGVkIiwiaXNGcm9tRGVjZW5kYW50Iiwic3JjRXZlbnQiLCJ0YXJnZXQiLCJzdG9wUHJvcGFnYXRpb24iLCJyb290RWxlbWVudCIsImFsaWFzIiwiZW1pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFTQTs7OztBQW5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFtQkEsU0FBU0EsY0FBVCxDQUF3QkMsR0FBeEIsRUFBNkIsQ0FBRTs7QUFFL0I7QUFDQTtBQUNBO0FBQ0E7O0lBQ3FCQyxZO0FBQ25CLHdCQUFZQyxPQUFaLEVBQW1DO0FBQUE7O0FBQUEsUUFBZEMsT0FBYyx1RUFBSixFQUFJO0FBQUE7O0FBQ2pDLFNBQUtELE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtDLE9BQUwsR0FBZUEsT0FBZjtBQUNBLFNBQUtDLGFBQUwsR0FBcUIsS0FBS0EsYUFBTCxDQUFtQkMsSUFBbkIsQ0FBd0IsSUFBeEIsQ0FBckI7O0FBRUEsUUFBTUMsZUFBZUgsUUFBUUksT0FBUixtQkFBckI7O0FBRUEsU0FBS0MsT0FBTCxHQUFlLElBQUlGLFlBQUosQ0FBaUJKLE9BQWpCLEVBQTBCO0FBQ3ZDTyxtQkFBYU4sUUFBUU0sV0FBUjtBQUQwQixLQUExQixFQUVaQyxFQUZZLENBRVQsY0FGUyxFQUVPLEtBQUtOLGFBRlosQ0FBZjs7QUFJQSxRQUFJLENBQUNELFFBQVFNLFdBQWIsRUFBMEI7QUFDeEI7QUFDQTtBQUNBLGdFQUF1Q0UsT0FBdkMsQ0FBK0MsZ0JBQVE7QUFDckQsWUFBTUMsYUFBYSxNQUFLSixPQUFMLENBQWFLLEdBQWIsQ0FBaUJDLElBQWpCLENBQW5CO0FBQ0EsWUFBSUYsVUFBSixFQUFnQjtBQUNkLCtDQUEwQkUsSUFBMUIsRUFBZ0NILE9BQWhDLENBQXdDLHFCQUFhO0FBQ25E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S0FBbEIsRUFBeUIxQixPQUF6QixDQUpLLEVBS0w7QUFDRTRELGlCQUFTLEtBRFg7QUFFRUsscUJBQWFqRTtBQUZmLE9BTEssQ0FBUDtBQVVEOztBQUVEOzs7Ozs7Ozs7O2tDQU9jMEIsSyxFQUFPO0FBQUEsVUFDWG9DLFFBRFcsR0FDRXBDLEtBREYsQ0FDWG9DLFFBRFc7O0FBRW5CLFVBQU1JLFFBQVEsK0JBQW9CSixTQUFTTixJQUE3QixDQUFkO0FBQ0EsVUFBSVUsS0FBSixFQUFXO0FBQ1Q7QUFDQSxhQUFLNUQsT0FBTCxDQUFhNkQsSUFBYixDQUFrQkQsS0FBbEIsRUFBeUJ4QyxLQUF6QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7a0NBSWNBLEssRUFBTztBQUNuQixXQUFLcEIsT0FBTCxDQUFhNkQsSUFBYixDQUFrQnpDLE1BQU04QixJQUF4QixFQUE4QjlCLEtBQTlCO0FBQ0Q7Ozs7O2tCQTdRa0IzQixZIiwiZmlsZSI6ImV2ZW50LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgeyBNYW5hZ2VyIH0gZnJvbSAnLi91dGlscy9oYW1tZXInXG5cbmltcG9ydCBXaGVlbElucHV0IGZyb20gJy4vaW5wdXRzL3doZWVsLWlucHV0J1xuaW1wb3J0IE1vdmVJbnB1dCBmcm9tICcuL2lucHV0cy9tb3ZlLWlucHV0J1xuaW1wb3J0IEtleUlucHV0IGZyb20gJy4vaW5wdXRzL2tleS1pbnB1dCdcblxuaW1wb3J0IHtcbiAgQkFTSUNfRVZFTlRfQUxJQVNFUyxcbiAgRVZFTlRfUkVDT0dOSVpFUl9NQVAsXG4gIEdFU1RVUkVfRVZFTlRfQUxJQVNFUyxcbiAgUkVDT0dOSVpFUlMsXG4gIFJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVAsXG4gIFJFQ09HTklaRVJfRkFMTEJBQ0tfTUFQXG59IGZyb20gJy4vY29uc3RhbnRzJ1xuXG5pbXBvcnQgeyB3aGljaEJ1dHRvbnMsIGdldE9mZnNldFBvc2l0aW9uIH0gZnJvbSAnLi91dGlscy9ldmVudC11dGlscydcblxuZnVuY3Rpb24gcHJldmVudERlZmF1bHQoZXZ0KSB7fVxuXG4vLyBVbmlmaWVkIEFQSSBmb3Igc3Vic2NyaWJpbmcgdG8gZXZlbnRzIGFib3V0IGJvdGhcbi8vIGJhc2ljIGlucHV0IGV2ZW50cyAoZS5nLiAnbW91c2Vtb3ZlJywgJ3RvdWNoc3RhcnQnLCAnd2hlZWwnKVxuLy8gYW5kIGdlc3R1cmFsIGlucHV0IChlLmcuICdjbGljaycsICd0YXAnLCAncGFuc3RhcnQnKS5cbi8vIERlbGVnYXRlcyBnZXN0dXJlIHJlbGF0ZWQgZXZlbnQgcmVnaXN0cmF0aW9uIGFuZCBoYW5kbGluZyB0byBIYW1tZXIuanMuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudE1hbmFnZXIge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9uc1xuICAgIHRoaXMuX29uQmFzaWNJbnB1dCA9IHRoaXMuX29uQmFzaWNJbnB1dC5iaW5kKHRoaXMpXG5cbiAgICBjb25zdCBNYW5hZ2VyQ2xhc3MgPSBvcHRpb25zLk1hbmFnZXIgfHwgTWFuYWdlclxuXG4gICAgdGhpcy5tYW5hZ2VyID0gbmV3IE1hbmFnZXJDbGFzcyhlbGVtZW50LCB7XG4gICAgICByZWNvZ25pemVyczogb3B0aW9ucy5yZWNvZ25pemVycyB8fCBSRUNPR05JWkVSU1xuICAgIH0pLm9uKCdoYW1tZXIuaW5wdXQnLCB0aGlzLl9vbkJhc2ljSW5wdXQpXG5cbiAgICBpZiAoIW9wdGlvbnMucmVjb2duaXplcnMpIHtcbiAgICAgIC8vIFNldCBkZWZhdWx0IHJlY29nbml6ZSB3aXRoc1xuICAgICAgLy8gaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9yZWNvZ25pemUtd2l0aC9cbiAgICAgIE9iamVjdC5rZXlzKFJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVApLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY29nbml6ZXIgPSB0aGlzLm1hbmFnZXIuZ2V0KG5hbWUpXG4gICAgICAgIGlmIChyZWNvZ25pemVyKSB7XG4gICAgICAgICAgUkVDT0dOSVpFUl9DT01QQVRJQkxFX01BUFtuYW1lXS5mb3JFYWNoKG90aGVyTmFtZSA9PiB7XG4gICAgICAgICAgICByZWNvZ25pemVyLnJlY29nbml6ZVdpdGgob3RoZXJOYW1lKVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5ldmVudEhhbmRsZXJzID0gW11cblxuICAgIC8vIEhhbmRsZSBldmVudHMgbm90IGhhbmRsZWQgYnkgSGFtbWVyLmpzOlxuICAgIC8vIC0gbW91c2Ugd2hlZWxcbiAgICAvLyAtIHBvaW50ZXIvdG91Y2gvbW91c2UgbW92ZVxuICAgIHRoaXMuX29uT3RoZXJFdmVudCA9IHRoaXMuX29uT3RoZXJFdmVudC5iaW5kKHRoaXMpXG4gICAgdGhpcy53aGVlbElucHV0ID0gbmV3IFdoZWVsSW5wdXQoZWxlbWVudCwgdGhpcy5fb25PdGhlckV2ZW50LCB7XG4gICAgICBlbmFibGU6IGZhbHNlXG4gICAgfSlcbiAgICB0aGlzLm1vdmVJbnB1dCA9IG5ldyBNb3ZlSW5wdXQoZWxlbWVudCwgdGhpcy5fb25PdGhlckV2ZW50LCB7XG4gICAgICBlbmFibGU6IGZhbHNlXG4gICAgfSlcbiAgICB0aGlzLmtleUlucHV0ID0gbmV3IEtleUlucHV0KGVsZW1lbnQsIHRoaXMuX29uT3RoZXJFdmVudCwgeyBlbmFibGU6IGZhbHNlIH0pXG5cbiAgICBpZiAob3B0aW9ucy5yaWdodEJ1dHRvbikge1xuICAgICAgLy8gQmxvY2sgcmlnaHQgY2xpY2tcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBwcmV2ZW50RGVmYXVsdClcbiAgICB9XG5cbiAgICAvLyBSZWdpc3RlciBhbGwgcGFzc2VkIGV2ZW50cy5cbiAgICBjb25zdCB7IGV2ZW50cyB9ID0gb3B0aW9uc1xuICAgIGlmIChldmVudHMpIHtcbiAgICAgIHRoaXMub24oZXZlbnRzKVxuICAgIH1cbiAgfVxuXG4gIC8vIFRlYXIgZG93biBpbnRlcm5hbCBldmVudCBtYW5hZ2VtZW50IGltcGxlbWVudGF0aW9ucy5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBwcmV2ZW50RGVmYXVsdClcblxuICAgIHRoaXMud2hlZWxJbnB1dC5kZXN0cm95KClcbiAgICB0aGlzLm1vdmVJbnB1dC5kZXN0cm95KClcbiAgICB0aGlzLmtleUlucHV0LmRlc3Ryb3koKVxuICAgIHRoaXMubWFuYWdlci5kZXN0cm95KClcbiAgfVxuXG4gIC8vIFJlZ2lzdGVyIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGBldmVudGAuXG4gIG9uKGV2ZW50LCBoYW5kbGVyLCBzcmNFbGVtZW50KSB7XG4gICAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX2FkZEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudClcbiAgICB9IGVsc2Uge1xuICAgICAgc3JjRWxlbWVudCA9IGhhbmRsZXJcbiAgICAgIC8vIElmIGBldmVudGAgaXMgYSBtYXAsIGNhbGwgYG9uKClgIGZvciBlYWNoIGVudHJ5LlxuICAgICAgZm9yIChjb25zdCBldmVudE5hbWUgaW4gZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fYWRkRXZlbnRIYW5kbGVyKGV2ZW50TmFtZSwgZXZlbnRbZXZlbnROYW1lXSwgc3JjRWxlbWVudClcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVyZWdpc3RlciBhIHByZXZpb3VzbHktcmVnaXN0ZXJlZCBldmVudCBoYW5kbGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IGV2ZW50ICAgQW4gZXZlbnQgbmFtZSAoU3RyaW5nKSBvciBtYXAgb2YgZXZlbnQgbmFtZXMgdG8gaGFuZGxlcnNcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdICAgIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYGV2ZW50YC5cbiAgICovXG4gIG9mZihldmVudCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGBldmVudGAgaXMgYSBtYXAsIGNhbGwgYG9mZigpYCBmb3IgZWFjaCBlbnRyeS5cbiAgICAgIGZvciAoY29uc3QgZXZlbnROYW1lIGluIGV2ZW50KSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZUV2ZW50SGFuZGxlcihldmVudE5hbWUsIGV2ZW50W2V2ZW50TmFtZV0pXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogRW5hYmxlL2Rpc2FibGUgcmVjb2duaXplciBmb3IgdGhlIGdpdmVuIGV2ZW50XG4gICAqL1xuICBfdG9nZ2xlUmVjb2duaXplcihuYW1lLCBlbmFibGVkKSB7XG4gICAgY29uc3QgcmVjb2duaXplciA9IHRoaXMubWFuYWdlci5nZXQobmFtZSlcbiAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgcmVjb2duaXplci5zZXQoeyBlbmFibGU6IGVuYWJsZWQgfSlcblxuICAgICAgY29uc3QgZmFsbGJhY2tSZWNvZ25pemVycyA9IFJFQ09HTklaRVJfRkFMTEJBQ0tfTUFQW25hbWVdXG4gICAgICBpZiAoZmFsbGJhY2tSZWNvZ25pemVycyAmJiAhdGhpcy5vcHRpb25zLnJlY29nbml6ZXJzKSB7XG4gICAgICAgIC8vIFNldCBkZWZhdWx0IHJlcXVpcmUgZmFpbHVyZXNcbiAgICAgICAgLy8gaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9yZXF1aXJlLWZhaWx1cmUvXG4gICAgICAgIGZhbGxiYWNrUmVjb2duaXplcnMuZm9yRWFjaChvdGhlck5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG90aGVyUmVjb2duaXplciA9IHRoaXMubWFuYWdlci5nZXQob3RoZXJOYW1lKVxuICAgICAgICAgIGlmIChlbmFibGVkKSB7XG4gICAgICAgICAgICAvLyBXYWl0IGZvciB0aGlzIHJlY29nbml6ZXIgdG8gZmFpbFxuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKG5hbWUpXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCB3YWl0IGZvciB0aGlzIHJlY29nbml6ZXIgdG8gZmFpbFxuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLmRyb3BSZXF1aXJlRmFpbHVyZShuYW1lKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy53aGVlbElucHV0LmVuYWJsZUV2ZW50VHlwZShuYW1lLCBlbmFibGVkKVxuICAgIHRoaXMubW92ZUlucHV0LmVuYWJsZUV2ZW50VHlwZShuYW1lLCBlbmFibGVkKVxuICAgIHRoaXMua2V5SW5wdXQuZW5hYmxlRXZlbnRUeXBlKG5hbWUsIGVuYWJsZWQpXG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyB0aGUgZXZlbnQgcmVnaXN0cmF0aW9uIGZvciBhIHNpbmdsZSBldmVudCArIGhhbmRsZXIuXG4gICAqL1xuICBfYWRkRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyLCBzcmNFbGVtZW50ID0gbnVsbCkge1xuICAgIGNvbnN0IHdyYXBwZWRIYW5kbGVyID0gdGhpcy5fd3JhcEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudClcbiAgICAvLyBBbGlhcyB0byBhIHJlY29nbml6ZWQgZ2VzdHVyZSBhcyBuZWNlc3NhcnkuXG4gICAgY29uc3QgZXZlbnRBbGlhcyA9IEdFU1RVUkVfRVZFTlRfQUxJQVNFU1tldmVudF0gfHwgZXZlbnRcbiAgICAvLyBHZXQgcmVjb2duaXplciBmb3IgdGhpcyBldmVudFxuICAgIGNvbnN0IHJlY29nbml6ZXJOYW1lID0gRVZFTlRfUkVDT0dOSVpFUl9NQVBbZXZlbnRBbGlhc10gfHwgZXZlbnRBbGlhc1xuICAgIC8vIEVuYWJsZSByZWNvZ25pemVyIGZvciB0aGlzIGV2ZW50LlxuICAgIHRoaXMuX3RvZ2dsZVJlY29nbml6ZXIocmVjb2duaXplck5hbWUsIHRydWUpXG5cbiAgICAvLyBGaW5kIGFuY2VzdG9yc1xuICAgIGNvbnN0IGFuY2VzdG9yRXZlbnRIYW5kbGVycyA9IHRoaXMuZXZlbnRIYW5kbGVycy5maWx0ZXIoZW50cnkgPT4ge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZW50cnkuZXZlbnRBbGlhcyA9PT0gZXZlbnRBbGlhcyAmJlxuICAgICAgICBlbnRyeS5zcmNFbGVtZW50ICE9PSBzcmNFbGVtZW50ICYmXG4gICAgICAgICghZW50cnkuc3JjRWxlbWVudCB8fCBlbnRyeS5zcmNFbGVtZW50LmNvbnRhaW5zKHNyY0VsZW1lbnQpKVxuICAgICAgKVxuICAgIH0pXG5cbiAgICAvLyBTYXZlIHdyYXBwZWQgaGFuZGxlclxuICAgIHRoaXMuZXZlbnRIYW5kbGVycy5wdXNoKHtcbiAgICAgIGV2ZW50LFxuICAgICAgZXZlbnRBbGlhcyxcbiAgICAgIHJlY29nbml6ZXJOYW1lLFxuICAgICAgc3JjRWxlbWVudCxcbiAgICAgIGhhbmRsZXIsXG4gICAgICB3cmFwcGVkSGFuZGxlclxuICAgIH0pXG5cbiAgICAvLyBTb3J0IGhhbmRsZXJzIGJ5IERPTSBoaWVyYXJjaHlcbiAgICAvLyBTbyB0aGUgZXZlbnQgd2lsbCBhbHdheXMgZmlyZSBmaXJzdCBvbiBjaGlsZCBub2Rlc1xuICAgIGFuY2VzdG9yRXZlbnRIYW5kbGVycy5mb3JFYWNoKGVudHJ5ID0+XG4gICAgICB0aGlzLm1hbmFnZXIub2ZmKGV2ZW50QWxpYXMsIGVudHJ5LndyYXBwZWRIYW5kbGVyKVxuICAgIClcbiAgICB0aGlzLm1hbmFnZXIub24oZXZlbnRBbGlhcywgd3JhcHBlZEhhbmRsZXIpXG4gICAgYW5jZXN0b3JFdmVudEhhbmRsZXJzLmZvckVhY2goZW50cnkgPT5cbiAgICAgIHRoaXMubWFuYWdlci5vbihldmVudEFsaWFzLCBlbnRyeS53cmFwcGVkSGFuZGxlcilcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyB0aGUgZXZlbnQgZGVyZWdpc3RyYXRpb24gZm9yIGEgc2luZ2xlIGV2ZW50ICsgaGFuZGxlci5cbiAgICovXG4gIF9yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBsZXQgZXZlbnRIYW5kbGVyUmVtb3ZlZCA9IGZhbHNlXG5cbiAgICAvLyBGaW5kIHNhdmVkIGhhbmRsZXIgaWYgYW55LlxuICAgIGZvciAobGV0IGkgPSB0aGlzLmV2ZW50SGFuZGxlcnMubGVuZ3RoOyBpLS07ICkge1xuICAgICAgY29uc3QgZW50cnkgPSB0aGlzLmV2ZW50SGFuZGxlcnNbaV1cbiAgICAgIGlmIChlbnRyeS5ldmVudCA9PT0gZXZlbnQgJiYgZW50cnkuaGFuZGxlciA9PT0gaGFuZGxlcikge1xuICAgICAgICAvLyBEZXJlZ2lzdGVyIGV2ZW50IGhhbmRsZXIuXG4gICAgICAgIHRoaXMubWFuYWdlci5vZmYoZW50cnkuZXZlbnRBbGlhcywgZW50cnkud3JhcHBlZEhhbmRsZXIpXG4gICAgICAgIC8vIERlbGV0ZSBzYXZlZCBoYW5kbGVyXG4gICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zcGxpY2UoaSwgMSlcbiAgICAgICAgZXZlbnRIYW5kbGVyUmVtb3ZlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXZlbnRIYW5kbGVyUmVtb3ZlZCkge1xuICAgICAgLy8gQWxpYXMgdG8gYSByZWNvZ25pemVkIGdlc3R1cmUgYXMgbmVjZXNzYXJ5LlxuICAgICAgY29uc3QgZXZlbnRBbGlhcyA9IEdFU1RVUkVfRVZFTlRfQUxJQVNFU1tldmVudF0gfHwgZXZlbnRcbiAgICAgIC8vIEdldCByZWNvZ25pemVyIGZvciB0aGlzIGV2ZW50XG4gICAgICBjb25zdCByZWNvZ25pemVyTmFtZSA9IEVWRU5UX1JFQ09HTklaRVJfTUFQW2V2ZW50QWxpYXNdIHx8IGV2ZW50QWxpYXNcbiAgICAgIC8vIERpc2FibGUgcmVjb2duaXplciBpZiBubyBtb3JlIGhhbmRsZXJzIGFyZSBhdHRhY2hlZCB0byBpdHMgZXZlbnRzXG4gICAgICBjb25zdCBpc1JlY29nbml6ZXJVc2VkID0gdGhpcy5ldmVudEhhbmRsZXJzLmZpbmQoXG4gICAgICAgIGVudHJ5ID0+IGVudHJ5LnJlY29nbml6ZXJOYW1lID09PSByZWNvZ25pemVyTmFtZVxuICAgICAgKVxuICAgICAgaWYgKCFpc1JlY29nbml6ZXJVc2VkKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZVJlY29nbml6ZXIocmVjb2duaXplck5hbWUsIGZhbHNlKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGV2ZW50IGhhbmRsZXIgdGhhdCBhbGlhc2VzIGV2ZW50cyBhbmQgYWRkIHByb3BzIGJlZm9yZSBwYXNzaW5nXG4gICAqIHRvIHRoZSByZWFsIGhhbmRsZXIuXG4gICAqL1xuICBfd3JhcEV2ZW50SGFuZGxlcih0eXBlLCBoYW5kbGVyLCBzcmNFbGVtZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50ID0+IHtcbiAgICAgIGxldCB7IG1qb2xuaXJFdmVudCB9ID0gZXZlbnRcblxuICAgICAgaWYgKCFtam9sbmlyRXZlbnQpIHtcbiAgICAgICAgbWpvbG5pckV2ZW50ID0gdGhpcy5fbm9ybWFsaXplRXZlbnQoZXZlbnQpXG4gICAgICAgIGV2ZW50Lm1qb2xuaXJFdmVudCA9IG1qb2xuaXJFdmVudFxuICAgICAgfVxuXG4gICAgICBjb25zdCBpc1N0b3BwZWQgPVxuICAgICAgICBtam9sbmlyRXZlbnQuaGFuZGxlZCAmJiBtam9sbmlyRXZlbnQuaGFuZGxlZCAhPT0gc3JjRWxlbWVudFxuXG4gICAgICBpZiAoIWlzU3RvcHBlZCkge1xuICAgICAgICBjb25zdCBpc0Zyb21EZWNlbmRhbnQgPVxuICAgICAgICAgICFzcmNFbGVtZW50IHx8IHNyY0VsZW1lbnQuY29udGFpbnMoZXZlbnQuc3JjRXZlbnQudGFyZ2V0KVxuICAgICAgICBpZiAoaXNGcm9tRGVjZW5kYW50KSB7XG4gICAgICAgICAgaGFuZGxlcihcbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24oe30sIG1qb2xuaXJFdmVudCwge1xuICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICBzdG9wUHJvcGFnYXRpb246ICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIW1qb2xuaXJFdmVudC5oYW5kbGVkKSB7XG4gICAgICAgICAgICAgICAgICBtam9sbmlyRXZlbnQuaGFuZGxlZCA9IHNyY0VsZW1lbnRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgaGFtbWVyanMgYW5kIGN1c3RvbSBldmVudHMgdG8gaGF2ZSBwcmVkaWN0YWJsZSBmaWVsZHMuXG4gICAqL1xuICBfbm9ybWFsaXplRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCB7IGVsZW1lbnQgfSA9IHRoaXNcblxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKFxuICAgICAge30sXG4gICAgICBldmVudCxcbiAgICAgIHdoaWNoQnV0dG9ucyhldmVudCksXG4gICAgICBnZXRPZmZzZXRQb3NpdGlvbihldmVudCwgZWxlbWVudCksXG4gICAgICB7XG4gICAgICAgIGhhbmRsZWQ6IGZhbHNlLFxuICAgICAgICByb290RWxlbWVudDogZWxlbWVudFxuICAgICAgfVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYmFzaWMgZXZlbnRzIHVzaW5nIHRoZSAnaGFtbWVyLmlucHV0JyBIYW1tZXIuanMgQVBJOlxuICAgKiBCZWZvcmUgcnVubmluZyBSZWNvZ25pemVycywgSGFtbWVyIGVtaXRzIGEgJ2hhbW1lci5pbnB1dCcgZXZlbnRcbiAgICogd2l0aCB0aGUgYmFzaWMgZXZlbnQgaW5mby4gVGhpcyBmdW5jdGlvbiBlbWl0cyBhbGwgYmFzaWMgZXZlbnRzXG4gICAqIGFsaWFzZWQgdG8gdGhlIFwiY2xhc3NcIiBvZiBldmVudCByZWNlaXZlZC5cbiAgICogU2VlIGNvbnN0YW50cy5CQVNJQ19FVkVOVF9DTEFTU0VTIGJhc2ljIGV2ZW50IGNsYXNzIGRlZmluaXRpb25zLlxuICAgKi9cbiAgX29uQmFzaWNJbnB1dChldmVudCkge1xuICAgIGNvbnN0IHsgc3JjRXZlbnQgfSA9IGV2ZW50XG4gICAgY29uc3QgYWxpYXMgPSBCQVNJQ19FVkVOVF9BTElBU0VTW3NyY0V2ZW50LnR5cGVdXG4gICAgaWYgKGFsaWFzKSB7XG4gICAgICAvLyBmaXJlIGFsbCBldmVudHMgYWxpYXNlZCB0byBzcmNFdmVudC50eXBlXG4gICAgICB0aGlzLm1hbmFnZXIuZW1pdChhbGlhcywgZXZlbnQpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBldmVudHMgbm90IHN1cHBvcnRlZCBieSBIYW1tZXIuanMsXG4gICAqIGFuZCBwaXBlIGJhY2sgb3V0IHRocm91Z2ggc2FtZSAoSGFtbWVyKSBjaGFubmVsIHVzZWQgYnkgb3RoZXIgZXZlbnRzLlxuICAgKi9cbiAgX29uT3RoZXJFdmVudChldmVudCkge1xuICAgIHRoaXMubWFuYWdlci5lbWl0KGV2ZW50LnR5cGUsIGV2ZW50KVxuICB9XG59XG4iXX0=