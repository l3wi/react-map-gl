'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _assign = require('babel-runtime/core-js/object/assign')

var _assign2 = _interopRequireDefault(_assign)

var _keys = require('babel-runtime/core-js/object/keys')

var _keys2 = _interopRequireDefault(_keys)

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck')

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2)

var _createClass2 = require('babel-runtime/helpers/createClass')

var _createClass3 = _interopRequireDefault(_createClass2)

var _hammer = require('./utils/hammer')

var _wheelInput = require('./inputs/wheel-input')

var _wheelInput2 = _interopRequireDefault(_wheelInput)

var _moveInput = require('./inputs/move-input')

var _moveInput2 = _interopRequireDefault(_moveInput)

var _keyInput = require('./inputs/key-input')

var _keyInput2 = _interopRequireDefault(_keyInput)

var _constants = require('./constants')

var _eventUtils = require('./utils/event-utils')

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
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

var EventManager = (function() {
  function EventManager(element) {
    var _this = this

    var options =
      arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
    ;(0, _classCallCheck3.default)(this, EventManager)

    this.element = element
    this.options = options
    this._onBasicInput = this._onBasicInput.bind(this)

    var ManagerClass = options.Manager || _hammer.Manager

    this.manager = new ManagerClass(element, {
      recognizers: options.recognizers || _constants.RECOGNIZERS
    }).on('hammer.input', this._onBasicInput)

    if (!options.recognizers) {
      // Set default recognize withs
      // http://hammerjs.github.io/recognize-with/
      ;(0, _keys2.default)(_constants.RECOGNIZER_COMPATIBLE_MAP).forEach(
        function(name) {
          var recognizer = _this.manager.get(name)
          if (recognizer) {
            _constants.RECOGNIZER_COMPATIBLE_MAP[name].forEach(function(
              otherName
            ) {
              recognizer.recognizeWith(otherName)
            })
          }
        }
      )
    }

    this.eventHandlers = []

    // Handle events not handled by Hammer.js:
    // - mouse wheel
    // - pointer/touch/mouse move
    this._onOtherEvent = this._onOtherEvent.bind(this)
    this.wheelInput = new _wheelInput2.default(element, this._onOtherEvent, {
      enable: false
    })
    this.moveInput = new _moveInput2.default(element, this._onOtherEvent, {
      enable: false
    })
    this.keyInput = new _keyInput2.default(element, this._onOtherEvent, {
      enable: false
    })

    if (options.rightButton) {
      // Block right click
      element.addEventListener('contextmenu', preventDefault)
    }

    // Register all passed events.
    var events = options.events

    if (events) {
      this.on(events)
    }
  }

  // Tear down internal event management implementations.

  ;(0, _createClass3.default)(EventManager, [
    {
      key: 'destroy',
      value: function destroy() {
        this.element.removeEventListener('contextmenu', preventDefault)

        this.wheelInput.destroy()
        this.moveInput.destroy()
        this.keyInput.destroy()
        this.manager.destroy()
      }

      // Register an event handler function to be called on `event`.
    },
    {
      key: 'on',
      value: function on(event, handler, srcElement) {
        if (typeof event === 'string') {
          this._addEventHandler(event, handler, srcElement)
        } else {
          srcElement = handler
          // If `event` is a map, call `on()` for each entry.
          for (var eventName in event) {
            this._addEventHandler(eventName, event[eventName], srcElement)
          }
        }
      }

      /**
       * Deregister a previously-registered event handler.
       * @param {string|Object} event   An event name (String) or map of event names to handlers
       * @param {Function} [handler]    The function to be called on `event`.
       */
    },
    {
      key: 'off',
      value: function off(event, handler) {
        if (typeof event === 'string') {
          this._removeEventHandler(event, handler)
        } else {
          // If `event` is a map, call `off()` for each entry.
          for (var eventName in event) {
            this._removeEventHandler(eventName, event[eventName])
          }
        }
      }

      /*
     * Enable/disable recognizer for the given event
     */
    },
    {
      key: '_toggleRecognizer',
      value: function _toggleRecognizer(name, enabled) {
        var _this2 = this

        var recognizer = this.manager.get(name)
        if (recognizer) {
          recognizer.set({ enable: enabled })

          var fallbackRecognizers = _constants.RECOGNIZER_FALLBACK_MAP[name]
          if (fallbackRecognizers && !this.options.recognizers) {
            // Set default require failures
            // http://hammerjs.github.io/require-failure/
            fallbackRecognizers.forEach(function(otherName) {
              var otherRecognizer = _this2.manager.get(otherName)
              if (enabled) {
                // Wait for this recognizer to fail
                otherRecognizer.requireFailure(name)
              } else {
                // Do not wait for this recognizer to fail
                otherRecognizer.dropRequireFailure(name)
              }
            })
          }
        }
        this.wheelInput.enableEventType(name, enabled)
        this.moveInput.enableEventType(name, enabled)
        this.keyInput.enableEventType(name, enabled)
      }

      /**
       * Process the event registration for a single event + handler.
       */
    },
    {
      key: '_addEventHandler',
      value: function _addEventHandler(event, handler) {
        var _this3 = this

        var srcElement =
          arguments.length > 2 && arguments[2] !== undefined
            ? arguments[2]
            : null

        var wrappedHandler = this._wrapEventHandler(event, handler, srcElement)
        // Alias to a recognized gesture as necessary.
        var eventAlias = _constants.GESTURE_EVENT_ALIASES[event] || event
        // Get recognizer for this event
        var recognizerName =
          _constants.EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias
        // Enable recognizer for this event.
        this._toggleRecognizer(recognizerName, true)

        // Find ancestors
        var ancestorEventHandlers = this.eventHandlers.filter(function(entry) {
          return (
            entry.eventAlias === eventAlias &&
            entry.srcElement !== srcElement &&
            (!entry.srcElement || entry.srcElement.contains(srcElement))
          )
        })

        // Save wrapped handler
        this.eventHandlers.push({
          event: event,
          eventAlias: eventAlias,
          recognizerName: recognizerName,
          srcElement: srcElement,
          handler: handler,
          wrappedHandler: wrappedHandler
        })

        // Sort handlers by DOM hierarchy
        // So the event will always fire first on child nodes
        ancestorEventHandlers.forEach(function(entry) {
          return _this3.manager.off(eventAlias, entry.wrappedHandler)
        })
        this.manager.on(eventAlias, wrappedHandler)
        ancestorEventHandlers.forEach(function(entry) {
          return _this3.manager.on(eventAlias, entry.wrappedHandler)
        })
      }

      /**
       * Process the event deregistration for a single event + handler.
       */
    },
    {
      key: '_removeEventHandler',
      value: function _removeEventHandler(event, handler) {
        var eventHandlerRemoved = false

        // Find saved handler if any.
        for (var i = this.eventHandlers.length; i--; ) {
          var entry = this.eventHandlers[i]
          if (entry.event === event && entry.handler === handler) {
            // Deregister event handler.
            this.manager.off(entry.eventAlias, entry.wrappedHandler)
            // Delete saved handler
            this.eventHandlers.splice(i, 1)
            eventHandlerRemoved = true
          }
        }

        if (eventHandlerRemoved) {
          // Alias to a recognized gesture as necessary.
          var eventAlias = _constants.GESTURE_EVENT_ALIASES[event] || event
          // Get recognizer for this event
          var recognizerName =
            _constants.EVENT_RECOGNIZER_MAP[eventAlias] || eventAlias
          // Disable recognizer if no more handlers are attached to its events
          var isRecognizerUsed = this.eventHandlers.find(function(entry) {
            return entry.recognizerName === recognizerName
          })
          if (!isRecognizerUsed) {
            this._toggleRecognizer(recognizerName, false)
          }
        }
      }

      /**
       * Returns an event handler that aliases events and add props before passing
       * to the real handler.
       */
    },
    {
      key: '_wrapEventHandler',
      value: function _wrapEventHandler(type, handler, srcElement) {
        var _this4 = this

        return function(event) {
          var mjolnirEvent = event.mjolnirEvent

          if (!mjolnirEvent) {
            mjolnirEvent = _this4._normalizeEvent(event)
            event.mjolnirEvent = mjolnirEvent
          }

          var isStopped =
            mjolnirEvent.handled && mjolnirEvent.handled !== srcElement

          if (!isStopped) {
            var isFromDecendant =
              !srcElement || srcElement.contains(event.srcEvent.target)
            if (isFromDecendant) {
              handler(
                (0, _assign2.default)({}, mjolnirEvent, {
                  type: type,
                  stopPropagation: function stopPropagation() {
                    if (!mjolnirEvent.handled) {
                      mjolnirEvent.handled = srcElement
                    }
                  }
                })
              )
            }
          }
        }
      }

      /**
       * Normalizes hammerjs and custom events to have predictable fields.
       */
    },
    {
      key: '_normalizeEvent',
      value: function _normalizeEvent(event) {
        var element = this.element

        return (0, _assign2.default)(
          {},
          event,
          (0, _eventUtils.whichButtons)(event),
          (0, _eventUtils.getOffsetPosition)(event, element),
          {
            handled: false,
            rootElement: element
          }
        )
      }

      /**
       * Handle basic events using the 'hammer.input' Hammer.js API:
       * Before running Recognizers, Hammer emits a 'hammer.input' event
       * with the basic event info. This function emits all basic events
       * aliased to the "class" of event received.
       * See constants.BASIC_EVENT_CLASSES basic event class definitions.
       */
    },
    {
      key: '_onBasicInput',
      value: function _onBasicInput(event) {
        var srcEvent = event.srcEvent

        var alias = _constants.BASIC_EVENT_ALIASES[srcEvent.type]
        if (alias) {
          // fire all events aliased to srcEvent.type
          this.manager.emit(alias, event)
        }
      }

      /**
       * Handle events not supported by Hammer.js,
       * and pipe back out through same (Hammer) channel used by other events.
       */
    },
    {
      key: '_onOtherEvent',
      value: function _onOtherEvent(event) {
        this.manager.emit(event.type, event)
      }
    }
  ])
  return EventManager
})()

exports.default = EventManager
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ldmVudC1tYW5hZ2VyLmpzIl0sIm5hbWVzIjpbInByZXZlbnREZWZhdWx0IiwiZXZ0IiwiRXZlbnRNYW5hZ2VyIiwiZWxlbWVudCIsIm9wdGlvbnMiLCJfb25CYXNpY0lucHV0IiwiYmluZCIsIk1hbmFnZXJDbGFzcyIsIk1hbmFnZXIiLCJtYW5hZ2VyIiwicmVjb2duaXplcnMiLCJvbiIsImZvckVhY2giLCJyZWNvZ25pemVyIiwiZ2V0IiwibmFtZSIsInJlY29nbml6ZVdpdGgiLCJvdGhlck5hbWUiLCJldmVudEhhbmRsZXJzIiwiX29uT3RoZXJFdmVudCIsIndoZWVsSW5wdXQiLCJlbmFibGUiLCJtb3ZlSW5wdXQiLCJrZXlJbnB1dCIsInJpZ2h0QnV0dG9uIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50cyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJkZXN0cm95IiwiZXZlbnQiLCJoYW5kbGVyIiwic3JjRWxlbWVudCIsIl9hZGRFdmVudEhhbmRsZXIiLCJldmVudE5hbWUiLCJfcmVtb3ZlRXZlbnRIYW5kbGVyIiwiZW5hYmxlZCIsInNldCIsImZhbGxiYWNrUmVjb2duaXplcnMiLCJvdGhlclJlY29nbml6ZXIiLCJyZXF1aXJlRmFpbHVyZSIsImRyb3BSZXF1aXJlRmFpbHVyZSIsImVuYWJsZUV2ZW50VHlwZSIsIndyYXBwZWRIYW5kbGVyIiwiX3dyYXBFdmVudEhhbmRsZXIiLCJldmVudEFsaWFzIiwicmVjb2duaXplck5hbWUiLCJfdG9nZ2xlUmVjb2duaXplciIsImFuY2VzdG9yRXZlbnRIYW5kbGVycyIsImZpbHRlciIsImVudHJ5IiwiY29udGFpbnMiLCJwdXNoIiwib2ZmIiwiZXZlbnRIYW5kbGVyUmVtb3ZlZCIsImkiLCJsZW5ndGgiLCJzcGxpY2UiLCJpc1JlY29nbml6ZXJVc2VkIiwiZmluZCIsInR5cGUiLCJtam9sbmlyRXZlbnQiLCJfbm9ybWFsaXplRXZlbnQiLCJpc1N0b3BwZWQiLCJoYW5kbGVkIiwiaXNGcm9tRGVjZW5kYW50Iiwic3JjRXZlbnQiLCJ0YXJnZXQiLCJzdG9wUHJvcGFnYXRpb24iLCJyb290RWxlbWVudCIsImFsaWFzIiwiZW1pdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFFQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFTQTs7OztBQW5DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFtQkEsU0FBU0EsY0FBVCxDQUF3QkMsR0FBeEIsRUFBNkI7QUFDM0JBLE1BQUlELGNBQUo7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTs7SUFDcUJFLFk7QUFDbkIsd0JBQVlDLE9BQVosRUFBbUM7QUFBQTs7QUFBQSxRQUFkQyxPQUFjLHVFQUFKLEVBQUk7QUFBQTs7QUFDakMsU0FBS0QsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsYUFBTCxHQUFxQixLQUFLQSxhQUFMLENBQW1CQyxJQUFuQixDQUF3QixJQUF4QixDQUFyQjs7QUFFQSxRQUFNQyxlQUFlSCxRQUFRSSxPQUFSLG1CQUFyQjs7QUFFQSxTQUFLQyxPQUFMLEdBQWUsSUFBSUYsWUFBSixDQUFpQkosT0FBakIsRUFBMEIsRUFBQ08sYUFBYU4sUUFBUU0sV0FBUiwwQkFBZCxFQUExQixFQUNaQyxFQURZLENBQ1QsY0FEUyxFQUNPLEtBQUtOLGFBRFosQ0FBZjs7QUFHQSxRQUFJLENBQUNELFFBQVFNLFdBQWIsRUFBMEI7QUFDeEI7QUFDQTtBQUNBLGdFQUF1Q0UsT0FBdkMsQ0FBK0MsZ0JBQVE7QUFDckQsWUFBTUMsYUFBYSxNQUFLSixPQUFMLENBQWFLLEdBQWIsQ0FBaUJDLElBQWpCLENBQW5CO0FBQ0EsWUFBSUYsVUFBSixFQUFnQjtBQUNkLCtDQUEwQkUsSUFBMUIsRUFBZ0NILE9BQWhDLENBQXdDLHFCQUFhO0FBQ25EQyx1QkFB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QUF6QixDQUZLLEVBR0w7QUFDRTRELGlCQUFTLEtBRFg7QUFFRUsscUJBQWFqRTtBQUZmLE9BSEssQ0FBUDtBQU9EOztBQUVEOzs7Ozs7Ozs7O2tDQU9jMEIsSyxFQUFPO0FBQUEsVUFDWm9DLFFBRFksR0FDQXBDLEtBREEsQ0FDWm9DLFFBRFk7O0FBRW5CLFVBQU1JLFFBQVEsK0JBQW9CSixTQUFTTixJQUE3QixDQUFkO0FBQ0EsVUFBSVUsS0FBSixFQUFXO0FBQ1Q7QUFDQSxhQUFLNUQsT0FBTCxDQUFhNkQsSUFBYixDQUFrQkQsS0FBbEIsRUFBeUJ4QyxLQUF6QjtBQUNEO0FBQ0Y7O0FBRUQ7Ozs7Ozs7a0NBSWNBLEssRUFBTztBQUNuQixXQUFLcEIsT0FBTCxDQUFhNkQsSUFBYixDQUFrQnpDLE1BQU04QixJQUF4QixFQUE4QjlCLEtBQTlCO0FBQ0Q7Ozs7O2tCQXJQa0IzQixZIiwiZmlsZSI6ImV2ZW50LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge01hbmFnZXJ9IGZyb20gJy4vdXRpbHMvaGFtbWVyJztcblxuaW1wb3J0IFdoZWVsSW5wdXQgZnJvbSAnLi9pbnB1dHMvd2hlZWwtaW5wdXQnO1xuaW1wb3J0IE1vdmVJbnB1dCBmcm9tICcuL2lucHV0cy9tb3ZlLWlucHV0JztcbmltcG9ydCBLZXlJbnB1dCBmcm9tICcuL2lucHV0cy9rZXktaW5wdXQnO1xuXG5pbXBvcnQge1xuICBCQVNJQ19FVkVOVF9BTElBU0VTLFxuICBFVkVOVF9SRUNPR05JWkVSX01BUCxcbiAgR0VTVFVSRV9FVkVOVF9BTElBU0VTLFxuICBSRUNPR05JWkVSUyxcbiAgUkVDT0dOSVpFUl9DT01QQVRJQkxFX01BUCxcbiAgUkVDT0dOSVpFUl9GQUxMQkFDS19NQVBcbn0gZnJvbSAnLi9jb25zdGFudHMnO1xuXG5pbXBvcnQge3doaWNoQnV0dG9ucywgZ2V0T2Zmc2V0UG9zaXRpb259IGZyb20gJy4vdXRpbHMvZXZlbnQtdXRpbHMnO1xuXG5mdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChldnQpIHtcbiAgZXZ0LnByZXZlbnREZWZhdWx0KCk7XG59XG5cbi8vIFVuaWZpZWQgQVBJIGZvciBzdWJzY3JpYmluZyB0byBldmVudHMgYWJvdXQgYm90aFxuLy8gYmFzaWMgaW5wdXQgZXZlbnRzIChlLmcuICdtb3VzZW1vdmUnLCAndG91Y2hzdGFydCcsICd3aGVlbCcpXG4vLyBhbmQgZ2VzdHVyYWwgaW5wdXQgKGUuZy4gJ2NsaWNrJywgJ3RhcCcsICdwYW5zdGFydCcpLlxuLy8gRGVsZWdhdGVzIGdlc3R1cmUgcmVsYXRlZCBldmVudCByZWdpc3RyYXRpb24gYW5kIGhhbmRsaW5nIHRvIEhhbW1lci5qcy5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50TWFuYWdlciB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLl9vbkJhc2ljSW5wdXQgPSB0aGlzLl9vbkJhc2ljSW5wdXQuYmluZCh0aGlzKTtcblxuICAgIGNvbnN0IE1hbmFnZXJDbGFzcyA9IG9wdGlvbnMuTWFuYWdlciB8fCBNYW5hZ2VyO1xuXG4gICAgdGhpcy5tYW5hZ2VyID0gbmV3IE1hbmFnZXJDbGFzcyhlbGVtZW50LCB7cmVjb2duaXplcnM6IG9wdGlvbnMucmVjb2duaXplcnMgfHwgUkVDT0dOSVpFUlN9KVxuICAgICAgLm9uKCdoYW1tZXIuaW5wdXQnLCB0aGlzLl9vbkJhc2ljSW5wdXQpO1xuXG4gICAgaWYgKCFvcHRpb25zLnJlY29nbml6ZXJzKSB7XG4gICAgICAvLyBTZXQgZGVmYXVsdCByZWNvZ25pemUgd2l0aHNcbiAgICAgIC8vIGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vcmVjb2duaXplLXdpdGgvXG4gICAgICBPYmplY3Qua2V5cyhSRUNPR05JWkVSX0NPTVBBVElCTEVfTUFQKS5mb3JFYWNoKG5hbWUgPT4ge1xuICAgICAgICBjb25zdCByZWNvZ25pemVyID0gdGhpcy5tYW5hZ2VyLmdldChuYW1lKTtcbiAgICAgICAgaWYgKHJlY29nbml6ZXIpIHtcbiAgICAgICAgICBSRUNPR05JWkVSX0NPTVBBVElCTEVfTUFQW25hbWVdLmZvckVhY2gob3RoZXJOYW1lID0+IHtcbiAgICAgICAgICAgIHJlY29nbml6ZXIucmVjb2duaXplV2l0aChvdGhlck5hbWUpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmV2ZW50SGFuZGxlcnMgPSBbXTtcblxuICAgIC8vIEhhbmRsZSBldmVudHMgbm90IGhhbmRsZWQgYnkgSGFtbWVyLmpzOlxuICAgIC8vIC0gbW91c2Ugd2hlZWxcbiAgICAvLyAtIHBvaW50ZXIvdG91Y2gvbW91c2UgbW92ZVxuICAgIHRoaXMuX29uT3RoZXJFdmVudCA9IHRoaXMuX29uT3RoZXJFdmVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMud2hlZWxJbnB1dCA9IG5ldyBXaGVlbElucHV0KGVsZW1lbnQsIHRoaXMuX29uT3RoZXJFdmVudCwge2VuYWJsZTogZmFsc2V9KTtcbiAgICB0aGlzLm1vdmVJbnB1dCA9IG5ldyBNb3ZlSW5wdXQoZWxlbWVudCwgdGhpcy5fb25PdGhlckV2ZW50LCB7ZW5hYmxlOiBmYWxzZX0pO1xuICAgIHRoaXMua2V5SW5wdXQgPSBuZXcgS2V5SW5wdXQoZWxlbWVudCwgdGhpcy5fb25PdGhlckV2ZW50LCB7ZW5hYmxlOiBmYWxzZX0pO1xuXG4gICAgaWYgKG9wdGlvbnMucmlnaHRCdXR0b24pIHtcbiAgICAgIC8vIEJsb2NrIHJpZ2h0IGNsaWNrXG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2NvbnRleHRtZW51JywgcHJldmVudERlZmF1bHQpO1xuICAgIH1cblxuICAgIC8vIFJlZ2lzdGVyIGFsbCBwYXNzZWQgZXZlbnRzLlxuICAgIGNvbnN0IHtldmVudHN9ID0gb3B0aW9ucztcbiAgICBpZiAoZXZlbnRzKSB7XG4gICAgICB0aGlzLm9uKGV2ZW50cyk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGVhciBkb3duIGludGVybmFsIGV2ZW50IG1hbmFnZW1lbnQgaW1wbGVtZW50YXRpb25zLlxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIHByZXZlbnREZWZhdWx0KTtcblxuICAgIHRoaXMud2hlZWxJbnB1dC5kZXN0cm95KCk7XG4gICAgdGhpcy5tb3ZlSW5wdXQuZGVzdHJveSgpO1xuICAgIHRoaXMua2V5SW5wdXQuZGVzdHJveSgpO1xuICAgIHRoaXMubWFuYWdlci5kZXN0cm95KCk7XG4gIH1cblxuICAvLyBSZWdpc3RlciBhbiBldmVudCBoYW5kbGVyIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBvbiBgZXZlbnRgLlxuICBvbihldmVudCwgaGFuZGxlciwgc3JjRWxlbWVudCkge1xuICAgIGlmICh0eXBlb2YgZXZlbnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aGlzLl9hZGRFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIsIHNyY0VsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzcmNFbGVtZW50ID0gaGFuZGxlcjtcbiAgICAgIC8vIElmIGBldmVudGAgaXMgYSBtYXAsIGNhbGwgYG9uKClgIGZvciBlYWNoIGVudHJ5LlxuICAgICAgZm9yIChjb25zdCBldmVudE5hbWUgaW4gZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fYWRkRXZlbnRIYW5kbGVyKGV2ZW50TmFtZSwgZXZlbnRbZXZlbnROYW1lXSwgc3JjRWxlbWVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIERlcmVnaXN0ZXIgYSBwcmV2aW91c2x5LXJlZ2lzdGVyZWQgZXZlbnQgaGFuZGxlci5cbiAgICogQHBhcmFtIHtzdHJpbmd8T2JqZWN0fSBldmVudCAgIEFuIGV2ZW50IG5hbWUgKFN0cmluZykgb3IgbWFwIG9mIGV2ZW50IG5hbWVzIHRvIGhhbmRsZXJzXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXSAgICBUaGUgZnVuY3Rpb24gdG8gYmUgY2FsbGVkIG9uIGBldmVudGAuXG4gICAqL1xuICBvZmYoZXZlbnQsIGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIGV2ZW50ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgYGV2ZW50YCBpcyBhIG1hcCwgY2FsbCBgb2ZmKClgIGZvciBlYWNoIGVudHJ5LlxuICAgICAgZm9yIChjb25zdCBldmVudE5hbWUgaW4gZXZlbnQpIHtcbiAgICAgICAgdGhpcy5fcmVtb3ZlRXZlbnRIYW5kbGVyKGV2ZW50TmFtZSwgZXZlbnRbZXZlbnROYW1lXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLypcbiAgICogRW5hYmxlL2Rpc2FibGUgcmVjb2duaXplciBmb3IgdGhlIGdpdmVuIGV2ZW50XG4gICAqL1xuICBfdG9nZ2xlUmVjb2duaXplcihuYW1lLCBlbmFibGVkKSB7XG4gICAgY29uc3QgcmVjb2duaXplciA9IHRoaXMubWFuYWdlci5nZXQobmFtZSk7XG4gICAgaWYgKHJlY29nbml6ZXIpIHtcbiAgICAgIHJlY29nbml6ZXIuc2V0KHtlbmFibGU6IGVuYWJsZWR9KTtcblxuICAgICAgY29uc3QgZmFsbGJhY2tSZWNvZ25pemVycyA9IFJFQ09HTklaRVJfRkFMTEJBQ0tfTUFQW25hbWVdO1xuICAgICAgaWYgKGZhbGxiYWNrUmVjb2duaXplcnMgJiYgIXRoaXMub3B0aW9ucy5yZWNvZ25pemVycykge1xuICAgICAgICAvLyBTZXQgZGVmYXVsdCByZXF1aXJlIGZhaWx1cmVzXG4gICAgICAgIC8vIGh0dHA6Ly9oYW1tZXJqcy5naXRodWIuaW8vcmVxdWlyZS1mYWlsdXJlL1xuICAgICAgICBmYWxsYmFja1JlY29nbml6ZXJzLmZvckVhY2gob3RoZXJOYW1lID0+IHtcbiAgICAgICAgICBjb25zdCBvdGhlclJlY29nbml6ZXIgPSB0aGlzLm1hbmFnZXIuZ2V0KG90aGVyTmFtZSk7XG4gICAgICAgICAgaWYgKGVuYWJsZWQpIHtcbiAgICAgICAgICAgIC8vIFdhaXQgZm9yIHRoaXMgcmVjb2duaXplciB0byBmYWlsXG4gICAgICAgICAgICBvdGhlclJlY29nbml6ZXIucmVxdWlyZUZhaWx1cmUobmFtZSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIERvIG5vdCB3YWl0IGZvciB0aGlzIHJlY29nbml6ZXIgdG8gZmFpbFxuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLmRyb3BSZXF1aXJlRmFpbHVyZShuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLndoZWVsSW5wdXQuZW5hYmxlRXZlbnRUeXBlKG5hbWUsIGVuYWJsZWQpO1xuICAgIHRoaXMubW92ZUlucHV0LmVuYWJsZUV2ZW50VHlwZShuYW1lLCBlbmFibGVkKTtcbiAgICB0aGlzLmtleUlucHV0LmVuYWJsZUV2ZW50VHlwZShuYW1lLCBlbmFibGVkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHRoZSBldmVudCByZWdpc3RyYXRpb24gZm9yIGEgc2luZ2xlIGV2ZW50ICsgaGFuZGxlci5cbiAgICovXG4gIF9hZGRFdmVudEhhbmRsZXIoZXZlbnQsIGhhbmRsZXIsIHNyY0VsZW1lbnQgPSBudWxsKSB7XG4gICAgY29uc3Qgd3JhcHBlZEhhbmRsZXIgPSB0aGlzLl93cmFwRXZlbnRIYW5kbGVyKGV2ZW50LCBoYW5kbGVyLCBzcmNFbGVtZW50KTtcbiAgICAvLyBBbGlhcyB0byBhIHJlY29nbml6ZWQgZ2VzdHVyZSBhcyBuZWNlc3NhcnkuXG4gICAgY29uc3QgZXZlbnRBbGlhcyA9IEdFU1RVUkVfRVZFTlRfQUxJQVNFU1tldmVudF0gfHwgZXZlbnQ7XG4gICAgLy8gR2V0IHJlY29nbml6ZXIgZm9yIHRoaXMgZXZlbnRcbiAgICBjb25zdCByZWNvZ25pemVyTmFtZSA9IEVWRU5UX1JFQ09HTklaRVJfTUFQW2V2ZW50QWxpYXNdIHx8IGV2ZW50QWxpYXM7XG4gICAgLy8gRW5hYmxlIHJlY29nbml6ZXIgZm9yIHRoaXMgZXZlbnQuXG4gICAgdGhpcy5fdG9nZ2xlUmVjb2duaXplcihyZWNvZ25pemVyTmFtZSwgdHJ1ZSk7XG5cbiAgICAvLyBGaW5kIGFuY2VzdG9yc1xuICAgIGNvbnN0IGFuY2VzdG9yRXZlbnRIYW5kbGVycyA9IHRoaXMuZXZlbnRIYW5kbGVycy5maWx0ZXIoZW50cnkgPT4ge1xuICAgICAgcmV0dXJuIGVudHJ5LmV2ZW50QWxpYXMgPT09IGV2ZW50QWxpYXMgJiZcbiAgICAgICAgZW50cnkuc3JjRWxlbWVudCAhPT0gc3JjRWxlbWVudCAmJlxuICAgICAgICAoIWVudHJ5LnNyY0VsZW1lbnQgfHwgZW50cnkuc3JjRWxlbWVudC5jb250YWlucyhzcmNFbGVtZW50KSk7XG4gICAgfSk7XG5cbiAgICAvLyBTYXZlIHdyYXBwZWQgaGFuZGxlclxuICAgIHRoaXMuZXZlbnRIYW5kbGVycy5wdXNoKHtldmVudCwgZXZlbnRBbGlhcywgcmVjb2duaXplck5hbWUsIHNyY0VsZW1lbnQsXG4gICAgICBoYW5kbGVyLCB3cmFwcGVkSGFuZGxlcn0pO1xuXG4gICAgLy8gU29ydCBoYW5kbGVycyBieSBET00gaGllcmFyY2h5XG4gICAgLy8gU28gdGhlIGV2ZW50IHdpbGwgYWx3YXlzIGZpcmUgZmlyc3Qgb24gY2hpbGQgbm9kZXNcbiAgICBhbmNlc3RvckV2ZW50SGFuZGxlcnMuZm9yRWFjaChlbnRyeSA9PiB0aGlzLm1hbmFnZXIub2ZmKGV2ZW50QWxpYXMsIGVudHJ5LndyYXBwZWRIYW5kbGVyKSk7XG4gICAgdGhpcy5tYW5hZ2VyLm9uKGV2ZW50QWxpYXMsIHdyYXBwZWRIYW5kbGVyKTtcbiAgICBhbmNlc3RvckV2ZW50SGFuZGxlcnMuZm9yRWFjaChlbnRyeSA9PiB0aGlzLm1hbmFnZXIub24oZXZlbnRBbGlhcywgZW50cnkud3JhcHBlZEhhbmRsZXIpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIHRoZSBldmVudCBkZXJlZ2lzdHJhdGlvbiBmb3IgYSBzaW5nbGUgZXZlbnQgKyBoYW5kbGVyLlxuICAgKi9cbiAgX3JlbW92ZUV2ZW50SGFuZGxlcihldmVudCwgaGFuZGxlcikge1xuICAgIGxldCBldmVudEhhbmRsZXJSZW1vdmVkID0gZmFsc2U7XG5cbiAgICAvLyBGaW5kIHNhdmVkIGhhbmRsZXIgaWYgYW55LlxuICAgIGZvciAobGV0IGkgPSB0aGlzLmV2ZW50SGFuZGxlcnMubGVuZ3RoOyBpLS07KSB7XG4gICAgICBjb25zdCBlbnRyeSA9IHRoaXMuZXZlbnRIYW5kbGVyc1tpXTtcbiAgICAgIGlmIChlbnRyeS5ldmVudCA9PT0gZXZlbnQgJiYgZW50cnkuaGFuZGxlciA9PT0gaGFuZGxlcikge1xuICAgICAgICAvLyBEZXJlZ2lzdGVyIGV2ZW50IGhhbmRsZXIuXG4gICAgICAgIHRoaXMubWFuYWdlci5vZmYoZW50cnkuZXZlbnRBbGlhcywgZW50cnkud3JhcHBlZEhhbmRsZXIpO1xuICAgICAgICAvLyBEZWxldGUgc2F2ZWQgaGFuZGxlclxuICAgICAgICB0aGlzLmV2ZW50SGFuZGxlcnMuc3BsaWNlKGksIDEpO1xuICAgICAgICBldmVudEhhbmRsZXJSZW1vdmVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXZlbnRIYW5kbGVyUmVtb3ZlZCkge1xuICAgICAgLy8gQWxpYXMgdG8gYSByZWNvZ25pemVkIGdlc3R1cmUgYXMgbmVjZXNzYXJ5LlxuICAgICAgY29uc3QgZXZlbnRBbGlhcyA9IEdFU1RVUkVfRVZFTlRfQUxJQVNFU1tldmVudF0gfHwgZXZlbnQ7XG4gICAgICAvLyBHZXQgcmVjb2duaXplciBmb3IgdGhpcyBldmVudFxuICAgICAgY29uc3QgcmVjb2duaXplck5hbWUgPSBFVkVOVF9SRUNPR05JWkVSX01BUFtldmVudEFsaWFzXSB8fCBldmVudEFsaWFzO1xuICAgICAgLy8gRGlzYWJsZSByZWNvZ25pemVyIGlmIG5vIG1vcmUgaGFuZGxlcnMgYXJlIGF0dGFjaGVkIHRvIGl0cyBldmVudHNcbiAgICAgIGNvbnN0IGlzUmVjb2duaXplclVzZWQgPSB0aGlzLmV2ZW50SGFuZGxlcnMuZmluZChcbiAgICAgICAgZW50cnkgPT4gZW50cnkucmVjb2duaXplck5hbWUgPT09IHJlY29nbml6ZXJOYW1lXG4gICAgICApO1xuICAgICAgaWYgKCFpc1JlY29nbml6ZXJVc2VkKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZVJlY29nbml6ZXIocmVjb2duaXplck5hbWUsIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhbiBldmVudCBoYW5kbGVyIHRoYXQgYWxpYXNlcyBldmVudHMgYW5kIGFkZCBwcm9wcyBiZWZvcmUgcGFzc2luZ1xuICAgKiB0byB0aGUgcmVhbCBoYW5kbGVyLlxuICAgKi9cbiAgX3dyYXBFdmVudEhhbmRsZXIodHlwZSwgaGFuZGxlciwgc3JjRWxlbWVudCkge1xuICAgIHJldHVybiBldmVudCA9PiB7XG4gICAgICBsZXQge21qb2xuaXJFdmVudH0gPSBldmVudDtcblxuICAgICAgaWYgKCFtam9sbmlyRXZlbnQpIHtcbiAgICAgICAgbWpvbG5pckV2ZW50ID0gdGhpcy5fbm9ybWFsaXplRXZlbnQoZXZlbnQpO1xuICAgICAgICBldmVudC5tam9sbmlyRXZlbnQgPSBtam9sbmlyRXZlbnQ7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlzU3RvcHBlZCA9IG1qb2xuaXJFdmVudC5oYW5kbGVkICYmIG1qb2xuaXJFdmVudC5oYW5kbGVkICE9PSBzcmNFbGVtZW50O1xuXG4gICAgICBpZiAoIWlzU3RvcHBlZCkge1xuICAgICAgICBjb25zdCBpc0Zyb21EZWNlbmRhbnQgPSAhc3JjRWxlbWVudCB8fCBzcmNFbGVtZW50LmNvbnRhaW5zKGV2ZW50LnNyY0V2ZW50LnRhcmdldCk7XG4gICAgICAgIGlmIChpc0Zyb21EZWNlbmRhbnQpIHtcbiAgICAgICAgICBoYW5kbGVyKE9iamVjdC5hc3NpZ24oe30sIG1qb2xuaXJFdmVudCwge1xuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIHN0b3BQcm9wYWdhdGlvbjogKCkgPT4ge1xuICAgICAgICAgICAgICBpZiAoIW1qb2xuaXJFdmVudC5oYW5kbGVkKSB7XG4gICAgICAgICAgICAgICAgbWpvbG5pckV2ZW50LmhhbmRsZWQgPSBzcmNFbGVtZW50O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGhhbW1lcmpzIGFuZCBjdXN0b20gZXZlbnRzIHRvIGhhdmUgcHJlZGljdGFibGUgZmllbGRzLlxuICAgKi9cbiAgX25vcm1hbGl6ZUV2ZW50KGV2ZW50KSB7XG4gICAgY29uc3Qge2VsZW1lbnR9ID0gdGhpcztcblxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBldmVudCxcbiAgICAgIHdoaWNoQnV0dG9ucyhldmVudCksXG4gICAgICBnZXRPZmZzZXRQb3NpdGlvbihldmVudCwgZWxlbWVudCksXG4gICAgICB7XG4gICAgICAgIGhhbmRsZWQ6IGZhbHNlLFxuICAgICAgICByb290RWxlbWVudDogZWxlbWVudFxuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGJhc2ljIGV2ZW50cyB1c2luZyB0aGUgJ2hhbW1lci5pbnB1dCcgSGFtbWVyLmpzIEFQSTpcbiAgICogQmVmb3JlIHJ1bm5pbmcgUmVjb2duaXplcnMsIEhhbW1lciBlbWl0cyBhICdoYW1tZXIuaW5wdXQnIGV2ZW50XG4gICAqIHdpdGggdGhlIGJhc2ljIGV2ZW50IGluZm8uIFRoaXMgZnVuY3Rpb24gZW1pdHMgYWxsIGJhc2ljIGV2ZW50c1xuICAgKiBhbGlhc2VkIHRvIHRoZSBcImNsYXNzXCIgb2YgZXZlbnQgcmVjZWl2ZWQuXG4gICAqIFNlZSBjb25zdGFudHMuQkFTSUNfRVZFTlRfQ0xBU1NFUyBiYXNpYyBldmVudCBjbGFzcyBkZWZpbml0aW9ucy5cbiAgICovXG4gIF9vbkJhc2ljSW5wdXQoZXZlbnQpIHtcbiAgICBjb25zdCB7c3JjRXZlbnR9ID0gZXZlbnQ7XG4gICAgY29uc3QgYWxpYXMgPSBCQVNJQ19FVkVOVF9BTElBU0VTW3NyY0V2ZW50LnR5cGVdO1xuICAgIGlmIChhbGlhcykge1xuICAgICAgLy8gZmlyZSBhbGwgZXZlbnRzIGFsaWFzZWQgdG8gc3JjRXZlbnQudHlwZVxuICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQoYWxpYXMsIGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGV2ZW50cyBub3Qgc3VwcG9ydGVkIGJ5IEhhbW1lci5qcyxcbiAgICogYW5kIHBpcGUgYmFjayBvdXQgdGhyb3VnaCBzYW1lIChIYW1tZXIpIGNoYW5uZWwgdXNlZCBieSBvdGhlciBldmVudHMuXG4gICAqL1xuICBfb25PdGhlckV2ZW50KGV2ZW50KSB7XG4gICAgdGhpcy5tYW5hZ2VyLmVtaXQoZXZlbnQudHlwZSwgZXZlbnQpO1xuICB9XG59XG4iXX0=
