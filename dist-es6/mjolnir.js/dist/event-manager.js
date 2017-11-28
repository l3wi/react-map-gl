'use strict';

Object.defineProperty(exports, '__esModule', {
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

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};(0, _classCallCheck3.default)(this, EventManager);

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
      ;(0, _keys2.default)(_constants.RECOGNIZER_COMPATIBLE_MAP).forEach(function (name) {
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
    this.keyInput = new _keyInput2.default(element, this._onOtherEvent, {
      enable: false
    });

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

  ;(0, _createClass3.default)(EventManager, [{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ldmVudC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbInByZXZlbnREZWZhdWx0IiwiZXZ0IiwiRXZlbnRNYW5hZ2VyIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfb25CYXNpY0lucHV0IiwiYmluZCIsIk1hbmFnZXJDbGFzcyIsIk1hbmFnZXIiLCJtYW5hZ2VyIiwicmVjb2duaXplcnMiLCJvbiIsImZvckVhY2giLCJyZWNvZ25pemVyIiwiZ2V0IiwibmFtZSIsInJlY29nbml6ZVdpdGgiLCJvdGhlck5hbWUiLCJldmVudEhhbmRsZXJzIiwiX29uT3RoZXJFdmVudCIsIndoZWVsSW5wdXQiLCJlbmFibGUiLCJtb3ZlSW5wdXQiLCJrZXlJbnB1dCIsInJpZ2h0QnV0dG9uIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50cyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkZXN0cm95IiwiZXZlbnQiLCJoYW5kbGVyIiwic3JjRWxlbWVudCIsIl9hZGRFdmVudEhhbmRsZXIiLCJldmVudE5hbWUiLCJfcmVtb3ZlRXZlbnRIYW5kbGVyIiwiZW5hYmxlZCIsInNldCIsImZhbGxiYWNrUmVjb2duaXplcnMiLCJvdGhlclJlY29nbml6ZXIiLCJyZXF1aXJlRmFpbHVyZSIsImRyb3BSZXF1aXJlRmFpbHVyZSIsImVuYWJsZUV2ZW50VHlwZSIsIndyYXBwZWRIYW5kbGVyIiwiX3dyYXBFdmVudEhhbmRsZXIiLCJldmVudEFsaWFzIiwicmVjb2duaXplck5hbWUiLCJfdG9nZ2xlUmVjb2duaXplciIsImFuY2VzdG9yRXZlbnRIYW5kbGVycyIsImZpbHRlciIsImVudHJ5IiwiY29udGFpbnMiLCJwdXNoIiwib2ZmIiwiZXZlbnRIYW5kbGVyUmVtb3ZlZCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJpc1JlY29nbml6ZXJVc2VkIiwiZmluZCIsInR5cGUiLCJtam9sbmlyRXZlbnQiLCJfbm9ybWFsaXplRXZlbnQiLCJpc1N0b3BwZWQiLCJoYW5kbGVkIiwiaXNGcm9tRGVjZW5kYW50Iiwic3JjRXZlbnQiLCJ0YXJnZXQiLCJzdG9wUHJvcGFnYXRpb24iLCJyb290RWxlbWVudCIsImFsaWFzIiwiZW1pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFTQTs7O2tEQW5DQTtBQUNBOztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBbUJBLEFBQVMsQUFBZSxBQUFLLEFBQzNCLEFBQUk7O0FBQ0w7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7O0ksQUFDcUIsMkJBQ25CO3dCQUFBLEFBQVksU0FBdUI7Z0JBQUE7O1FBQWQsQUFBVSxBQUFJLHFIQUNqQyxBQUFLLEFBQVUsQUFDZjs7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUNmO1NBQUssVUFBTCxBQUFxQixBQUFLLEFBQWMsQUFBSztpREFFN0MsQUFBTSxBQUFlLEFBQVE7O2tEQUU3QixBQUFLLEFBQVUsQUFBSSxBQUFhLEFBQVMsQUFBQyxBQUFhLEFBQVEsQUFDNUQsQUFBRyxBQUFnQixBQUFLOzs7QUFFdkIsQUFBQyxBQUFRLDJCQUFiLEFBQTBCLDBCQUN4QjtBQURGLCtCQUVFLEFBQ0E7OzhCQUFBLEFBQXVDLEFBQVEsQUFBUSxBQUNyRDtBQUFBLEFBQU0sQUFBYSxBQUFLLEFBQVEsQUFBSSxBQUNwQztBQUFBLEFBQUksQUFBWSxBQUNkO3NDQUFBLEFBQTBCLEFBQU0sQUFBUSwyQkFBYSxBQUNuRCx3QkFBQSxBQUFXLEFBQWMsQUFDMUI7QUFGRCwyQ0FHRDt3QkFOSCxBQU9DOzZEQUNGLHFCQUVELEFBQUs7QUFBTCx1QkFBQSxBQUFxQjtBQUVyQjtBQUNBO0FBQ0EsQUFDQTtBQUFBLEFBQUssQUFBZ0IsQUFBSyxBQUFjLEFBQUssQUFDN0MsQUFBSyxBQUFhLEFBQWUsQUFBUyxBQUFLLEFBQWUsQUFBQyxBQUFRLEFBQ3ZFOztTQUFBLEFB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QUNkLFNBSDZCO1lBR3ZCLENBQWtCLGtCQUF4QixBQUF3QixBQUFDLEFBQWMsQUFBVyxBQUFTLEFBQU0sQUFBUyxBQUMxRTtBQUFJLGVBQUosQUFBcUIsa0NBQ25CO0FBQVEsQUFBYyxBQUFJLEFBQWMsQUFDdEM7QUFEc0MsQUFFdEM7QUFBaUIsQUFBTSxBQUNyQixBQUFJLEFBQUMsQUFBYSxBQUFTLEFBQ3pCOztBQUpOLEFBQVEsQUFBZ0MsQUFJbEMsQUFBYSxBQUFVLEFBQ3hCLEFBQ0YsQUFFSixBQUNGOzs7O0FBaENDLEFBQUssQUFBa0IsQUFBZ0IsQUFDeEM7QUFTSCxTQXdCRDs7bUJBRUQ7Ozs7Ozs7K0JBR2dCLEEsQUFBTyxBQUNkO0FBRGMsQUFDZCxBQUFXOztZQUVsQixZQUFPLGFBQWMsV0FBZCxBQUFrQixBQUN2Qix5QkFESyxBQUNMLEFBQWEsQUFDYixBQUFrQixBQUFPLEFBQ3pCLEFBQ0UsQUFBUyxBQUNUOzthQUFhLFdBTGpCLEFBQU8sQUFHTDtjQUlIOytCQUVEOzs7Ozs7Ozs7QUFPYyxBLEFBQU8sQUFDWjtBQURZLEFBQ1osQUFBWTtBQUNuQjtBQUFBLEFBQU0sQUFBUSxBQUFvQixBQUFTLEFBQzNDLEFBQUksQUFBTyxBQUNUOztBQUNBLEFBQUssQUFBUSxBQUFLLEFBQU8sQUFDMUIsQUFDRjs7O0FBaENFOzs7Ozs4RCxBQXNDVyxjQUFPLEFBQ25CLFNBQUssR0FBTCxBQUFhLEFBQUssWUFBbEIsQUFBd0IsQUFBTSwwQkFDL0I7Ozs7QUFyUGtCLEE7Ozs7Ozs7OztBQStPbkIiLCJmaWxlIjoiZXZlbnQtbWFuYWdlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7TWFuYWdlcn0gZnJvbSAnLi91dGlscy9oYW1tZXInO1xuXG5pbXBvcnQgV2hlZWxJbnB1dCBmcm9tICcuL2lucHV0cy93aGVlbC1pbnB1dCc7XG5pbXBvcnQgTW92ZUlucHV0IGZyb20gJy4vaW5wdXRzL21vdmUtaW5wdXQnO1xuaW1wb3J0IEtleUlucHV0IGZyb20gJy4vaW5wdXRzL2tleS1pbnB1dCc7XG5cbmltcG9ydCB7XG4gIEJBU0lDX0VWRU5UX0FMSUFTRVMsXG4gIEVWRU5UX1JFQ09HTklaRVJfTUFQLFxuICBHRVNUVVJFX0VWRU5UX0FMSUFTRVMsXG4gIFJFQ09HTklaRVJTLFxuICBSRUNPR05JWkVSX0NPTVBBVElCTEVfTUFQLFxuICBSRUNPR05JWkVSX0ZBTExCQUNLX01BUFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5cbmltcG9ydCB7d2hpY2hCdXR0b25zLCBnZXRPZmZzZXRQb3NpdGlvbn0gZnJvbSAnLi91dGlscy9ldmVudC11dGlscyc7XG5cbmZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGV2dCkge1xuICBldnQucHJldmVudERlZmF1bHQoKTtcbn1cblxuLy8gVW5pZmllZCBBUEkgZm9yIHN1YnNjcmliaW5nIHRvIGV2ZW50cyBhYm91dCBib3RoXG4vLyBiYXNpYyBpbnB1dCBldmVudHMgKGUuZy4gJ21vdXNlbW92ZScsICd0b3VjaHN0YXJ0JywgJ3doZWVsJylcbi8vIGFuZCBnZXN0dXJhbCBpbnB1dCAoZS5nLiAnY2xpY2snLCAndGFwJywgJ3BhbnN0YXJ0JykuXG4vLyBEZWxlZ2F0ZXMgZ2VzdHVyZSByZWxhdGVkIGV2ZW50IHJlZ2lzdHJhdGlvbiBhbmQgaGFuZGxpbmcgdG8gSGFtbWVyLmpzLlxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRNYW5hZ2VyIHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMuX29uQmFzaWNJbnB1dCA9IHRoaXMuX29uQmFzaWNJbnB1dC5iaW5kKHRoaXMpO1xuXG4gICAgY29uc3QgTWFuYWdlckNsYXNzID0gb3B0aW9ucy5NYW5hZ2VyIHx8IE1hbmFnZXI7XG5cbiAgICB0aGlzLm1hbmFnZXIgPSBuZXcgTWFuYWdlckNsYXNzKGVsZW1lbnQsIHtyZWNvZ25pemVyczogb3B0aW9ucy5yZWNvZ25pemVycyB8fCBSRUNPR05JWkVSU30pXG4gICAgICAub24oJ2hhbW1lci5pbnB1dCcsIHRoaXMuX29uQmFzaWNJbnB1dCk7XG5cbiAgICBpZiAoIW9wdGlvbnMucmVjb2duaXplcnMpIHtcbiAgICAgIC8vIFNldCBkZWZhdWx0IHJlY29nbml6ZSB3aXRoc1xuICAgICAgLy8gaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9yZWNvZ25pemUtd2l0aC9cbiAgICAgIE9iamVjdC5rZXlzKFJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVApLmZvckVhY2gobmFtZSA9PiB7XG4gICAgICAgIGNvbnN0IHJlY29nbml6ZXIgPSB0aGlzLm1hbmFnZXIuZ2V0KG5hbWUpO1xuICAgICAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgICAgIFJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVBbbmFtZV0uZm9yRWFjaChvdGhlck5hbWUgPT4ge1xuICAgICAgICAgICAgcmVjb2duaXplci5yZWNvZ25pemVXaXRoKG90aGVyTmFtZSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZXZlbnRIYW5kbGVycyA9IFtdO1xuXG4gICAgLy8gSGFuZGxlIGV2ZW50cyBub3QgaGFuZGxlZCBieSBIYW1tZXIuanM6XG4gICAgLy8gLSBtb3VzZSB3aGVlbFxuICAgIC8vIC0gcG9pbnRlci90b3VjaC9tb3VzZSBtb3ZlXG4gICAgdGhpcy5fb25PdGhlckV2ZW50ID0gdGhpcy5fb25PdGhlckV2ZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy53aGVlbElucHV0ID0gbmV3IFdoZWVsSW5wdXQoZWxlbWVudCwgdGhpcy5fb25PdGhlckV2ZW50LCB7ZW5hYmxlOiBmYWxzZX0pO1xuICAgIHRoaXMubW92ZUlucHV0ID0gbmV3IE1vdmVJbnB1dChlbGVtZW50LCB0aGlzLl9vbk90aGVyRXZlbnQsIHtlbmFibGU6IGZhbHNlfSk7XG4gICAgdGhpcy5rZXlJbnB1dCA9IG5ldyBLZXlJbnB1dChlbGVtZW50LCB0aGlzLl9vbk90aGVyRXZlbnQsIHtlbmFibGU6IGZhbHNlfSk7XG5cbiAgICBpZiAob3B0aW9ucy5yaWdodEJ1dHRvbikge1xuICAgICAgLy8gQmxvY2sgcmlnaHQgY2xpY2tcbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBwcmV2ZW50RGVmYXVsdCk7XG4gICAgfVxuXG4gICAgLy8gUmVnaXN0ZXIgYWxsIHBhc3NlZCBldmVudHMuXG4gICAgY29uc3Qge2V2ZW50c30gPSBvcHRpb25zO1xuICAgIGlmIChldmVudHMpIHtcbiAgICAgIHRoaXMub24oZXZlbnRzKTtcbiAgICB9XG4gIH1cblxuICAvLyBUZWFyIGRvd24gaW50ZXJuYWwgZXZlbnQgbWFuYWdlbWVudCBpbXBsZW1lbnRhdGlvbnMuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgcHJldmVudERlZmF1bHQpO1xuXG4gICAgdGhpcy53aGVlbElucHV0LmRlc3Ryb3koKTtcbiAgICB0aGlzLm1vdmVJbnB1dC5kZXN0cm95KCk7XG4gICAgdGhpcy5rZXlJbnB1dC5kZXN0cm95KCk7XG4gICAgdGhpcy5tYW5hZ2VyLmRlc3Ryb3koKTtcbiAgfVxuXG4gIC8vIFJlZ2lzdGVyIGFuIGV2ZW50IGhhbmRsZXIgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGBldmVudGAuXG4gIG9uKGV2ZW50LCBoYW5kbGVyLCBzcmNFbGVtZW50KSB7XG4gICAgaWYgKHR5cGVvZiBldmVudCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRoaXMuX2FkZEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNyY0VsZW1lbnQgPSBoYW5kbGVyO1xuICAgICAgLy8gSWYgYGV2ZW50YCBpcyBhIG1hcCwgY2FsbCBgb24oKWAgZm9yIGVhY2ggZW50cnkuXG4gICAgICBmb3IgKGNvbnN0IGV2ZW50TmFtZSBpbiBldmVudCkge1xuICAgICAgICB0aGlzLl9hZGRFdmVudEhhbmRsZXIoZXZlbnROYW1lLCBldmVudFtldmVudE5hbWVdLCBzcmNFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRGVyZWdpc3RlciBhIHByZXZpb3VzbHktcmVnaXN0ZXJlZCBldmVudCBoYW5kbGVyLlxuICAgKiBAcGFyYW0ge3N0cmluZ3xPYmplY3R9IGV2ZW50ICAgQW4gZXZlbnQgbmFtZSAoU3RyaW5nKSBvciBtYXAgb2YgZXZlbnQgbmFtZXMgdG8gaGFuZGxlcnNcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdICAgIFRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYGV2ZW50YC5cbiAgICovXG4gIG9mZihldmVudCwgaGFuZGxlcikge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgZXZlbnRgIGlzIGEgbWFwLCBjYWxsIGBvZmYoKWAgZm9yIGVhY2ggZW50cnkuXG4gICAgICBmb3IgKGNvbnN0IGV2ZW50TmFtZSBpbiBldmVudCkge1xuICAgICAgICB0aGlzLl9yZW1vdmVFdmVudEhhbmRsZXIoZXZlbnROYW1lLCBldmVudFtldmVudE5hbWVdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBFbmFibGUvZGlzYWJsZSByZWNvZ25pemVyIGZvciB0aGUgZ2l2ZW4gZXZlbnRcbiAgICovXG4gIF90b2dnbGVSZWNvZ25pemVyKG5hbWUsIGVuYWJsZWQpIHtcbiAgICBjb25zdCByZWNvZ25pemVyID0gdGhpcy5tYW5hZ2VyLmdldChuYW1lKTtcbiAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgcmVjb2duaXplci5zZXQoe2VuYWJsZTogZW5hYmxlZH0pO1xuXG4gICAgICBjb25zdCBmYWxsYmFja1JlY29nbml6ZXJzID0gUkVDT0dOSVpFUl9GQUxMQkFDS19NQVBbbmFtZV07XG4gICAgICBpZiAoZmFsbGJhY2tSZWNvZ25pemVycyAmJiAhdGhpcy5vcHRpb25zLnJlY29nbml6ZXJzKSB7XG4gICAgICAgIC8vIFNldCBkZWZhdWx0IHJlcXVpcmUgZmFpbHVyZXNcbiAgICAgICAgLy8gaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9yZXF1aXJlLWZhaWx1cmUvXG4gICAgICAgIGZhbGxiYWNrUmVjb2duaXplcnMuZm9yRWFjaChvdGhlck5hbWUgPT4ge1xuICAgICAgICAgIGNvbnN0IG90aGVyUmVjb2duaXplciA9IHRoaXMubWFuYWdlci5nZXQob3RoZXJOYW1lKTtcbiAgICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhpcyByZWNvZ25pemVyIHRvIGZhaWxcbiAgICAgICAgICAgIG90aGVyUmVjb2duaXplci5yZXF1aXJlRmFpbHVyZShuYW1lKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gRG8gbm90IHdhaXQgZm9yIHRoaXMgcmVjb2duaXplciB0byBmYWlsXG4gICAgICAgICAgICBvdGhlclJlY29nbml6ZXIuZHJvcFJlcXVpcmVGYWlsdXJlKG5hbWUpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMud2hlZWxJbnB1dC5lbmFibGVFdmVudFR5cGUobmFtZSwgZW5hYmxlZCk7XG4gICAgdGhpcy5tb3ZlSW5wdXQuZW5hYmxlRXZlbnRUeXBlKG5hbWUsIGVuYWJsZWQpO1xuICAgIHRoaXMua2V5SW5wdXQuZW5hYmxlRXZlbnRUeXBlKG5hbWUsIGVuYWJsZWQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgdGhlIGV2ZW50IHJlZ2lzdHJhdGlvbiBmb3IgYSBzaW5nbGUgZXZlbnQgKyBoYW5kbGVyLlxuICAgKi9cbiAgX2FkZEV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudCA9IG51bGwpIHtcbiAgICBjb25zdCB3cmFwcGVkSGFuZGxlciA9IHRoaXMuX3dyYXBFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIsIHNyY0VsZW1lbnQpO1xuICAgIC8vIEFsaWFzIHRvIGEgcmVjb2duaXplZCBnZXN0dXJlIGFzIG5lY2Vzc2FyeS5cbiAgICBjb25zdCBldmVudEFsaWFzID0gR0VTVFVSRV9FVkVOVF9BTElBU0VTW2V2ZW50XSB8fCBldmVudDtcbiAgICAvLyBHZXQgcmVjb2duaXplciBmb3IgdGhpcyBldmVudFxuICAgIGNvbnN0IHJlY29nbml6ZXJOYW1lID0gRVZFTlRfUkVDT0dOSVpFUl9NQVBbZXZlbnRBbGlhc10gfHwgZXZlbnRBbGlhcztcbiAgICAvLyBFbmFibGUgcmVjb2duaXplciBmb3IgdGhpcyBldmVudC5cbiAgICB0aGlzLl90b2dnbGVSZWNvZ25pemVyKHJlY29nbml6ZXJOYW1lLCB0cnVlKTtcblxuICAgIC8vIEZpbmQgYW5jZXN0b3JzXG4gICAgY29uc3QgYW5jZXN0b3JFdmVudEhhbmRsZXJzID0gdGhpcy5ldmVudEhhbmRsZXJzLmZpbHRlcihlbnRyeSA9PiB7XG4gICAgICByZXR1cm4gZW50cnkuZXZlbnRBbGlhcyA9PT0gZXZlbnRBbGlhcyAmJlxuICAgICAgICBlbnRyeS5zcmNFbGVtZW50ICE9PSBzcmNFbGVtZW50ICYmXG4gICAgICAgICghZW50cnkuc3JjRWxlbWVudCB8fCBlbnRyeS5zcmNFbGVtZW50LmNvbnRhaW5zKHNyY0VsZW1lbnQpKTtcbiAgICB9KTtcblxuICAgIC8vIFNhdmUgd3JhcHBlZCBoYW5kbGVyXG4gICAgdGhpcy5ldmVudEhhbmRsZXJzLnB1c2goe2V2ZW50LCBldmVudEFsaWFzLCByZWNvZ25pemVyTmFtZSwgc3JjRWxlbWVudCxcbiAgICAgIGhhbmRsZXIsIHdyYXBwZWRIYW5kbGVyfSk7XG5cbiAgICAvLyBTb3J0IGhhbmRsZXJzIGJ5IERPTSBoaWVyYXJjaHlcbiAgICAvLyBTbyB0aGUgZXZlbnQgd2lsbCBhbHdheXMgZmlyZSBmaXJzdCBvbiBjaGlsZCBub2Rlc1xuICAgIGFuY2VzdG9yRXZlbnRIYW5kbGVycy5mb3JFYWNoKGVudHJ5ID0+IHRoaXMubWFuYWdlci5vZmYoZXZlbnRBbGlhcywgZW50cnkud3JhcHBlZEhhbmRsZXIpKTtcbiAgICB0aGlzLm1hbmFnZXIub24oZXZlbnRBbGlhcywgd3JhcHBlZEhhbmRsZXIpO1xuICAgIGFuY2VzdG9yRXZlbnRIYW5kbGVycy5mb3JFYWNoKGVudHJ5ID0+IHRoaXMubWFuYWdlci5vbihldmVudEFsaWFzLCBlbnRyeS53cmFwcGVkSGFuZGxlcikpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgdGhlIGV2ZW50IGRlcmVnaXN0cmF0aW9uIGZvciBhIHNpbmdsZSBldmVudCArIGhhbmRsZXIuXG4gICAqL1xuICBfcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKSB7XG4gICAgbGV0IGV2ZW50SGFuZGxlclJlbW92ZWQgPSBmYWxzZTtcblxuICAgIC8vIEZpbmQgc2F2ZWQgaGFuZGxlciBpZiBhbnkuXG4gICAgZm9yIChsZXQgaSA9IHRoaXMuZXZlbnRIYW5kbGVycy5sZW5ndGg7IGktLTspIHtcbiAgICAgIGNvbnN0IGVudHJ5ID0gdGhpcy5ldmVudEhhbmRsZXJzW2ldO1xuICAgICAgaWYgKGVudHJ5LmV2ZW50ID09PSBldmVudCAmJiBlbnRyeS5oYW5kbGVyID09PSBoYW5kbGVyKSB7XG4gICAgICAgIC8vIERlcmVnaXN0ZXIgZXZlbnQgaGFuZGxlci5cbiAgICAgICAgdGhpcy5tYW5hZ2VyLm9mZihlbnRyeS5ldmVudEFsaWFzLCBlbnRyeS53cmFwcGVkSGFuZGxlcik7XG4gICAgICAgIC8vIERlbGV0ZSBzYXZlZCBoYW5kbGVyXG4gICAgICAgIHRoaXMuZXZlbnRIYW5kbGVycy5zcGxpY2UoaSwgMSk7XG4gICAgICAgIGV2ZW50SGFuZGxlclJlbW92ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChldmVudEhhbmRsZXJSZW1vdmVkKSB7XG4gICAgICAvLyBBbGlhcyB0byBhIHJlY29nbml6ZWQgZ2VzdHVyZSBhcyBuZWNlc3NhcnkuXG4gICAgICBjb25zdCBldmVudEFsaWFzID0gR0VTVFVSRV9FVkVOVF9BTElBU0VTW2V2ZW50XSB8fCBldmVudDtcbiAgICAgIC8vIEdldCByZWNvZ25pemVyIGZvciB0aGlzIGV2ZW50XG4gICAgICBjb25zdCByZWNvZ25pemVyTmFtZSA9IEVWRU5UX1JFQ09HTklaRVJfTUFQW2V2ZW50QWxpYXNdIHx8IGV2ZW50QWxpYXM7XG4gICAgICAvLyBEaXNhYmxlIHJlY29nbml6ZXIgaWYgbm8gbW9yZSBoYW5kbGVycyBhcmUgYXR0YWNoZWQgdG8gaXRzIGV2ZW50c1xuICAgICAgY29uc3QgaXNSZWNvZ25pemVyVXNlZCA9IHRoaXMuZXZlbnRIYW5kbGVycy5maW5kKFxuICAgICAgICBlbnRyeSA9PiBlbnRyeS5yZWNvZ25pemVyTmFtZSA9PT0gcmVjb2duaXplck5hbWVcbiAgICAgICk7XG4gICAgICBpZiAoIWlzUmVjb2duaXplclVzZWQpIHtcbiAgICAgICAgdGhpcy5fdG9nZ2xlUmVjb2duaXplcihyZWNvZ25pemVyTmFtZSwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGV2ZW50IGhhbmRsZXIgdGhhdCBhbGlhc2VzIGV2ZW50cyBhbmQgYWRkIHByb3BzIGJlZm9yZSBwYXNzaW5nXG4gICAqIHRvIHRoZSByZWFsIGhhbmRsZXIuXG4gICAqL1xuICBfd3JhcEV2ZW50SGFuZGxlcih0eXBlLCBoYW5kbGVyLCBzcmNFbGVtZW50KSB7XG4gICAgcmV0dXJuIGV2ZW50ID0+IHtcbiAgICAgIGxldCB7bWpvbG5pckV2ZW50fSA9IGV2ZW50O1xuXG4gICAgICBpZiAoIW1qb2xuaXJFdmVudCkge1xuICAgICAgICBtam9sbmlyRXZlbnQgPSB0aGlzLl9ub3JtYWxpemVFdmVudChldmVudCk7XG4gICAgICAgIGV2ZW50Lm1qb2xuaXJFdmVudCA9IG1qb2xuaXJFdmVudDtcbiAgICAgIH1cblxuICAgICAgY29uc3QgaXNTdG9wcGVkID0gbWpvbG5pckV2ZW50LmhhbmRsZWQgJiYgbWpvbG5pckV2ZW50LmhhbmRsZWQgIT09IHNyY0VsZW1lbnQ7XG5cbiAgICAgIGlmICghaXNTdG9wcGVkKSB7XG4gICAgICAgIGNvbnN0IGlzRnJvbURlY2VuZGFudCA9ICFzcmNFbGVtZW50IHx8IHNyY0VsZW1lbnQuY29udGFpbnMoZXZlbnQuc3JjRXZlbnQudGFyZ2V0KTtcbiAgICAgICAgaWYgKGlzRnJvbURlY2VuZGFudCkge1xuICAgICAgICAgIGhhbmRsZXIoT2JqZWN0LmFzc2lnbih7fSwgbWpvbG5pckV2ZW50LCB7XG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgc3RvcFByb3BhZ2F0aW9uOiAoKSA9PiB7XG4gICAgICAgICAgICAgIGlmICghbWpvbG5pckV2ZW50LmhhbmRsZWQpIHtcbiAgICAgICAgICAgICAgICBtam9sbmlyRXZlbnQuaGFuZGxlZCA9IHNyY0VsZW1lbnQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgaGFtbWVyanMgYW5kIGN1c3RvbSBldmVudHMgdG8gaGF2ZSBwcmVkaWN0YWJsZSBmaWVsZHMuXG4gICAqL1xuICBfbm9ybWFsaXplRXZlbnQoZXZlbnQpIHtcbiAgICBjb25zdCB7ZWxlbWVudH0gPSB0aGlzO1xuXG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIGV2ZW50LFxuICAgICAgd2hpY2hCdXR0b25zKGV2ZW50KSxcbiAgICAgIGdldE9mZnNldFBvc2l0aW9uKGV2ZW50LCBlbGVtZW50KSxcbiAgICAgIHtcbiAgICAgICAgaGFuZGxlZDogZmFsc2UsXG4gICAgICAgIHJvb3RFbGVtZW50OiBlbGVtZW50XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgYmFzaWMgZXZlbnRzIHVzaW5nIHRoZSAnaGFtbWVyLmlucHV0JyBIYW1tZXIuanMgQVBJOlxuICAgKiBCZWZvcmUgcnVubmluZyBSZWNvZ25pemVycywgSGFtbWVyIGVtaXRzIGEgJ2hhbW1lci5pbnB1dCcgZXZlbnRcbiAgICogd2l0aCB0aGUgYmFzaWMgZXZlbnQgaW5mby4gVGhpcyBmdW5jdGlvbiBlbWl0cyBhbGwgYmFzaWMgZXZlbnRzXG4gICAqIGFsaWFzZWQgdG8gdGhlIFwiY2xhc3NcIiBvZiBldmVudCByZWNlaXZlZC5cbiAgICogU2VlIGNvbnN0YW50cy5CQVNJQ19FVkVOVF9DTEFTU0VTIGJhc2ljIGV2ZW50IGNsYXNzIGRlZmluaXRpb25zLlxuICAgKi9cbiAgX29uQmFzaWNJbnB1dChldmVudCkge1xuICAgIGNvbnN0IHtzcmNFdmVudH0gPSBldmVudDtcbiAgICBjb25zdCBhbGlhcyA9IEJBU0lDX0VWRU5UX0FMSUFTRVNbc3JjRXZlbnQudHlwZV07XG4gICAgaWYgKGFsaWFzKSB7XG4gICAgICAvLyBmaXJlIGFsbCBldmVudHMgYWxpYXNlZCB0byBzcmNFdmVudC50eXBlXG4gICAgICB0aGlzLm1hbmFnZXIuZW1pdChhbGlhcywgZXZlbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZXZlbnRzIG5vdCBzdXBwb3J0ZWQgYnkgSGFtbWVyLmpzLFxuICAgKiBhbmQgcGlwZSBiYWNrIG91dCB0aHJvdWdoIHNhbWUgKEhhbW1lcikgY2hhbm5lbCB1c2VkIGJ5IG90aGVyIGV2ZW50cy5cbiAgICovXG4gIF9vbk90aGVyRXZlbnQoZXZlbnQpIHtcbiAgICB0aGlzLm1hbmFnZXIuZW1pdChldmVudC50eXBlLCBldmVudCk7XG4gIH1cbn1cbiJdfQ==