'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})

var _assign = require('babel-runtime/core-js/object/assign')

var _assign2 = _interopRequireDefault(_assign)

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck')

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2)

var _createClass2 = require('babel-runtime/helpers/createClass')

var _createClass3 = _interopRequireDefault(_createClass2)

var _constants = require('../constants')

var _globals = require('../utils/globals')

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

var firefox = _globals.userAgent.indexOf('firefox') !== -1

var WHEEL_EVENTS = _constants.INPUT_EVENT_TYPES.WHEEL_EVENTS

var EVENT_TYPE = 'wheel'

// Constants for normalizing input delta
var WHEEL_DELTA_MAGIC_SCALER = 4.000244140625
var WHEEL_DELTA_PER_LINE = 40
var TRACKPAD_MAX_DELTA = 4
var TRACKPAD_MAX_DELTA_PER_TIME = 200
// Slow down zoom if shift key is held for more precise zooming
var SHIFT_MULTIPLIER = 0.25

var WheelInput = (function() {
  function WheelInput(element, callback) {
    var _this = this

    var options =
      arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {}
    ;(0, _classCallCheck3.default)(this, WheelInput)

    this.element = element
    this.callback = callback

    this.options = (0, _assign2.default)({ enable: true }, options)

    this.time = 0
    this.wheelPosition = null
    this.type = null
    this.timeout = null
    this.lastValue = 0

    this.events = WHEEL_EVENTS.concat(options.events || [])

    this.handleEvent = this.handleEvent.bind(this)
    this.events.forEach(function(event) {
      return element.addEventListener(event, _this.handleEvent)
    })
  }

  ;(0, _createClass3.default)(WheelInput, [
    {
      key: 'destroy',
      value: function destroy() {
        var _this2 = this

        this.events.forEach(function(event) {
          return _this2.element.removeEventListener(event, _this2.handleEvent)
        })
      }

      /**
       * Enable this input (begin processing events)
       * if the specified event type is among those handled by this input.
       */
    },
    {
      key: 'enableEventType',
      value: function enableEventType(eventType, enabled) {
        if (eventType === EVENT_TYPE) {
          this.options.enable = enabled
        }
      }

      /* eslint-disable complexity, max-statements */
    },
    {
      key: 'handleEvent',
      value: function handleEvent(event) {
        if (!this.options.enable) {
          return
        }

        var value = event.deltaY
        if (_globals.window.WheelEvent) {
          // Firefox doubles the values on retina screens...
          if (
            firefox &&
            event.deltaMode === _globals.window.WheelEvent.DOM_DELTA_PIXEL
          ) {
            value /= _globals.window.devicePixelRatio
          }
          if (event.deltaMode === _globals.window.WheelEvent.DOM_DELTA_LINE) {
            value *= WHEEL_DELTA_PER_LINE
          }
        }

        var type = this.type,
          timeout = this.timeout,
          lastValue = this.lastValue,
          time = this.time

        var now = (
          (_globals.window && _globals.window.performance) ||
          Date
        ).now()
        var timeDelta = now - (time || 0)

        this.wheelPosition = {
          x: event.clientX,
          y: event.clientY
        }
        time = now

        if (value !== 0 && value % WHEEL_DELTA_MAGIC_SCALER === 0) {
          // This one is definitely a mouse wheel event.
          type = 'wheel'
          // Normalize this value to match trackpad.
          value = Math.floor(value / WHEEL_DELTA_MAGIC_SCALER)
        } else if (value !== 0 && Math.abs(value) < TRACKPAD_MAX_DELTA) {
          // This one is definitely a trackpad event because it is so small.
          type = 'trackpad'
        } else if (timeDelta > 400) {
          // This is likely a new scroll action.
          type = null
          lastValue = value
          // Start a timeout in case this was a singular event,
          // and delay it by up to 40ms.
          timeout = _globals.window.setTimeout(
            function setTimeout() {
              this._onWheel(event, -lastValue, this.wheelPosition)
              type = 'wheel'
            }.bind(this),
            40
          )
        } else if (!type) {
          // This is a repeating event, but we don't know the type of event just yet.
          // If the delta per time is small, we assume it's a fast trackpad;
          // otherwise we switch into wheel mode.
          type =
            Math.abs(timeDelta * value) < TRACKPAD_MAX_DELTA_PER_TIME
              ? 'trackpad'
              : 'wheel'

          // Make sure our delayed event isn't fired again, because we accumulate
          // the previous event (which was less than 40ms ago) into this event.
          if (timeout) {
            _globals.window.clearTimeout(timeout)
            timeout = null
            value += lastValue
          }
        }

        if (event.shiftKey && value) {
          value = value * SHIFT_MULTIPLIER
        }

        // Only fire the callback if we actually know
        // what type of scrolling device the user uses.
        if (type) {
          this._onWheel(event, -value, this.wheelPosition)
        }
      }
    },
    {
      key: '_onWheel',
      value: function _onWheel(srcEvent, delta, position) {
        this.callback({
          type: EVENT_TYPE,
          center: position,
          delta: delta,
          srcEvent: srcEvent,
          pointerType: 'mouse',
          target: srcEvent.target
        })
      }
    }
  ])
  return WheelInput
})()

exports.default = WheelInput
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnB1dHMvd2hlZWwtaW5wdXQuanMiXSwibmFtZXMiOlsiZmlyZWZveCIsImluZGV4T2YiLCJXSEVFTF9FVkVOVFMiLCJFVkVOVF9UWVBFIiwiV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSIiwiV0hFRUxfREVMVEFfUEVSX0xJTkUiLCJUUkFDS1BBRF9NQVhfREVMVEEiLCJUUkFDS1BBRF9NQVhfREVMVEFfUEVSX1RJTUUiLCJTSElGVF9NVUxUSVBMSUVSIiwiV2hlZWxJbnB1dCIsImVsZW1lbnQiLCJjYWxsYmFjayIsIm9wdGlvbnMiLCJlbmFibGUiLCJ0aW1lIiwid2hlZWxQb3NpdGlvbiIsInR5cGUiLCJ0aW1lb3V0IiwibGFzdFZhbHVlIiwiZXZlbnRzIiwiY29uY2F0IiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZm9yRWFjaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJldmVudFR5cGUiLCJlbmFibGVkIiwicHJldmVudERlZmF1bHQiLCJ2YWx1ZSIsImRlbHRhWSIsIldoZWVsRXZlbnQiLCJkZWx0YU1vZGUiLCJET01fREVMVEFfUElYRUwiLCJkZXZpY2VQaXhlbFJhdGlvIiwiRE9NX0RFTFRBX0xJTkUiLCJub3ciLCJwZXJmb3JtYW5jZSIsIkRhdGUiLCJ0aW1lRGVsdGEiLCJ4IiwiY2xpZW50WCIsInkiLCJjbGllbnRZIiwiTWF0aCIsImZsb29yIiwiYWJzIiwic2V0VGltZW91dCIsIl9vbldoZWVsIiwiY2xlYXJUaW1lb3V0Iiwic2hpZnRLZXkiLCJzcmNFdmVudCIsImRlbHRhIiwicG9zaXRpb24iLCJjZW50ZXIiLCJwb2ludGVyVHlwZSIsInRhcmdldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOzs7O0FBckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFLaUMsUUFBTCxDQUFjeEIsS0FBZCxFQUFxQixDQUFDSyxLQUF0QixFQUE2QixLQUFLZixhQUFsQztBQUNEO0FBQ0Y7Ozs2QkFFUXFDLFEsRUFBVUMsSyxFQUFPQyxRLEVBQVU7QUFDbEMsV0FBSzNDLFFBQUwsQ0FBYztBQUNaSyxjQUFNYixVQURNO0FBRVpvRCxnQkFBUUQsUUFGSTtBQUdaRCxvQkFIWTtBQUlaRCwwQkFKWTtBQUtaSSxxQkFBYSxPQUxEO0FBTVpDLGdCQUFRTCxTQUFTSztBQU5MLE9BQWQ7QUFRRDs7Ozs7a0JBekhrQmhELFUiLCJmaWxlIjoid2hlZWwtaW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0lOUFVUX0VWRU5UX1RZUEVTfSBmcm9tICcuLi9jb25zdGFudHMnO1xuaW1wb3J0IHt3aW5kb3csIHVzZXJBZ2VudH0gZnJvbSAnLi4vdXRpbHMvZ2xvYmFscyc7XG5cbmNvbnN0IGZpcmVmb3ggPSB1c2VyQWdlbnQuaW5kZXhPZignZmlyZWZveCcpICE9PSAtMTtcblxuY29uc3Qge1dIRUVMX0VWRU5UU30gPSBJTlBVVF9FVkVOVF9UWVBFUztcbmNvbnN0IEVWRU5UX1RZUEUgPSAnd2hlZWwnO1xuXG4vLyBDb25zdGFudHMgZm9yIG5vcm1hbGl6aW5nIGlucHV0IGRlbHRhXG5jb25zdCBXSEVFTF9ERUxUQV9NQUdJQ19TQ0FMRVIgPSA0LjAwMDI0NDE0MDYyNTtcbmNvbnN0IFdIRUVMX0RFTFRBX1BFUl9MSU5FID0gNDA7XG5jb25zdCBUUkFDS1BBRF9NQVhfREVMVEEgPSA0O1xuY29uc3QgVFJBQ0tQQURfTUFYX0RFTFRBX1BFUl9USU1FID0gMjAwO1xuLy8gU2xvdyBkb3duIHpvb20gaWYgc2hpZnQga2V5IGlzIGhlbGQgZm9yIG1vcmUgcHJlY2lzZSB6b29taW5nXG5jb25zdCBTSElGVF9NVUxUSVBMSUVSID0gMC4yNTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2hlZWxJbnB1dCB7XG5cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZW5hYmxlOiB0cnVlfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIHRoaXMud2hlZWxQb3NpdGlvbiA9IG51bGw7XG4gICAgdGhpcy50eXBlID0gbnVsbDtcbiAgICB0aGlzLnRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMubGFzdFZhbHVlID0gMDtcblxuICAgIHRoaXMuZXZlbnRzID0gV0hFRUxfRVZFTlRTLmNvbmNhdChvcHRpb25zLmV2ZW50cyB8fCBbXSk7XG5cbiAgICB0aGlzLmhhbmRsZUV2ZW50ID0gdGhpcy5oYW5kbGVFdmVudC5iaW5kKHRoaXMpO1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLmhhbmRsZUV2ZW50KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuaGFuZGxlRXZlbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgdGhpcyBpbnB1dCAoYmVnaW4gcHJvY2Vzc2luZyBldmVudHMpXG4gICAqIGlmIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBpcyBhbW9uZyB0aG9zZSBoYW5kbGVkIGJ5IHRoaXMgaW5wdXQuXG4gICAqL1xuICBlbmFibGVFdmVudFR5cGUoZXZlbnRUeXBlLCBlbmFibGVkKSB7XG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gRVZFTlRfVFlQRSkge1xuICAgICAgdGhpcy5vcHRpb25zLmVuYWJsZSA9IGVuYWJsZWQ7XG4gICAgfVxuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSwgbWF4LXN0YXRlbWVudHMgKi9cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmFibGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIGxldCB2YWx1ZSA9IGV2ZW50LmRlbHRhWTtcbiAgICBpZiAod2luZG93LldoZWVsRXZlbnQpIHtcbiAgICAgIC8vIEZpcmVmb3ggZG91YmxlcyB0aGUgdmFsdWVzIG9uIHJldGluYSBzY3JlZW5zLi4uXG4gICAgICBpZiAoZmlyZWZveCAmJiBldmVudC5kZWx0YU1vZGUgPT09IHdpbmRvdy5XaGVlbEV2ZW50LkRPTV9ERUxUQV9QSVhFTCkge1xuICAgICAgICB2YWx1ZSAvPSB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbztcbiAgICAgIH1cbiAgICAgIGlmIChldmVudC5kZWx0YU1vZGUgPT09IHdpbmRvdy5XaGVlbEV2ZW50LkRPTV9ERUxUQV9MSU5FKSB7XG4gICAgICAgIHZhbHVlICo9IFdIRUVMX0RFTFRBX1BFUl9MSU5FO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB7XG4gICAgICB0eXBlLFxuICAgICAgdGltZW91dCxcbiAgICAgIGxhc3RWYWx1ZSxcbiAgICAgIHRpbWVcbiAgICB9ID0gdGhpcztcblxuICAgIGNvbnN0IG5vdyA9ICgod2luZG93ICYmIHdpbmRvdy5wZXJmb3JtYW5jZSkgfHwgRGF0ZSkubm93KCk7XG4gICAgY29uc3QgdGltZURlbHRhID0gbm93IC0gKHRpbWUgfHwgMCk7XG5cbiAgICB0aGlzLndoZWVsUG9zaXRpb24gPSB7XG4gICAgICB4OiBldmVudC5jbGllbnRYLFxuICAgICAgeTogZXZlbnQuY2xpZW50WVxuICAgIH07XG4gICAgdGltZSA9IG5vdztcblxuICAgIGlmICh2YWx1ZSAhPT0gMCAmJiB2YWx1ZSAlIFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUiA9PT0gMCkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIG1vdXNlIHdoZWVsIGV2ZW50LlxuICAgICAgdHlwZSA9ICd3aGVlbCc7XG4gICAgICAvLyBOb3JtYWxpemUgdGhpcyB2YWx1ZSB0byBtYXRjaCB0cmFja3BhZC5cbiAgICAgIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSAvIFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUik7XG4gICAgfSBlbHNlIGlmICh2YWx1ZSAhPT0gMCAmJiBNYXRoLmFicyh2YWx1ZSkgPCBUUkFDS1BBRF9NQVhfREVMVEEpIHtcbiAgICAgIC8vIFRoaXMgb25lIGlzIGRlZmluaXRlbHkgYSB0cmFja3BhZCBldmVudCBiZWNhdXNlIGl0IGlzIHNvIHNtYWxsLlxuICAgICAgdHlwZSA9ICd0cmFja3BhZCc7XG4gICAgfSBlbHNlIGlmICh0aW1lRGVsdGEgPiA0MDApIHtcbiAgICAgIC8vIFRoaXMgaXMgbGlrZWx5IGEgbmV3IHNjcm9sbCBhY3Rpb24uXG4gICAgICB0eXBlID0gbnVsbDtcbiAgICAgIGxhc3RWYWx1ZSA9IHZhbHVlO1xuICAgICAgLy8gU3RhcnQgYSB0aW1lb3V0IGluIGNhc2UgdGhpcyB3YXMgYSBzaW5ndWxhciBldmVudCxcbiAgICAgIC8vIGFuZCBkZWxheSBpdCBieSB1cCB0byA0MG1zLlxuICAgICAgdGltZW91dCA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uIHNldFRpbWVvdXQoKSB7XG4gICAgICAgIHRoaXMuX29uV2hlZWwoZXZlbnQsIC1sYXN0VmFsdWUsIHRoaXMud2hlZWxQb3NpdGlvbik7XG4gICAgICAgIHR5cGUgPSAnd2hlZWwnO1xuICAgICAgfS5iaW5kKHRoaXMpLCA0MCk7XG4gICAgfSBlbHNlIGlmICghdHlwZSkge1xuICAgICAgLy8gVGhpcyBpcyBhIHJlcGVhdGluZyBldmVudCwgYnV0IHdlIGRvbid0IGtub3cgdGhlIHR5cGUgb2YgZXZlbnQganVzdCB5ZXQuXG4gICAgICAvLyBJZiB0aGUgZGVsdGEgcGVyIHRpbWUgaXMgc21hbGwsIHdlIGFzc3VtZSBpdCdzIGEgZmFzdCB0cmFja3BhZDtcbiAgICAgIC8vIG90aGVyd2lzZSB3ZSBzd2l0Y2ggaW50byB3aGVlbCBtb2RlLlxuICAgICAgdHlwZSA9IE1hdGguYWJzKHRpbWVEZWx0YSAqIHZhbHVlKSA8IFRSQUNLUEFEX01BWF9ERUxUQV9QRVJfVElNRSA/ICd0cmFja3BhZCcgOiAnd2hlZWwnO1xuXG4gICAgICAvLyBNYWtlIHN1cmUgb3VyIGRlbGF5ZWQgZXZlbnQgaXNuJ3QgZmlyZWQgYWdhaW4sIGJlY2F1c2Ugd2UgYWNjdW11bGF0ZVxuICAgICAgLy8gdGhlIHByZXZpb3VzIGV2ZW50ICh3aGljaCB3YXMgbGVzcyB0aGFuIDQwbXMgYWdvKSBpbnRvIHRoaXMgZXZlbnQuXG4gICAgICBpZiAodGltZW91dCkge1xuICAgICAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdmFsdWUgKz0gbGFzdFZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChldmVudC5zaGlmdEtleSAmJiB2YWx1ZSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZSAqIFNISUZUX01VTFRJUExJRVI7XG4gICAgfVxuXG4gICAgLy8gT25seSBmaXJlIHRoZSBjYWxsYmFjayBpZiB3ZSBhY3R1YWxseSBrbm93XG4gICAgLy8gd2hhdCB0eXBlIG9mIHNjcm9sbGluZyBkZXZpY2UgdGhlIHVzZXIgdXNlcy5cbiAgICBpZiAodHlwZSkge1xuICAgICAgdGhpcy5fb25XaGVlbChldmVudCwgLXZhbHVlLCB0aGlzLndoZWVsUG9zaXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIF9vbldoZWVsKHNyY0V2ZW50LCBkZWx0YSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgIHR5cGU6IEVWRU5UX1RZUEUsXG4gICAgICBjZW50ZXI6IHBvc2l0aW9uLFxuICAgICAgZGVsdGEsXG4gICAgICBzcmNFdmVudCxcbiAgICAgIHBvaW50ZXJUeXBlOiAnbW91c2UnLFxuICAgICAgdGFyZ2V0OiBzcmNFdmVudC50YXJnZXRcbiAgICB9KTtcbiAgfVxufVxuIl19
