'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _constants = require('../constants');

var _globals = require('../utils/globals');

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

var firefox = _globals.userAgent.indexOf('firefox') !== -1;

var WHEEL_EVENTS = _constants.INPUT_EVENT_TYPES.WHEEL_EVENTS;

var EVENT_TYPE = 'wheel';

// Constants for normalizing input delta
var WHEEL_DELTA_MAGIC_SCALER = 4.000244140625;
var WHEEL_DELTA_PER_LINE = 40;
var TRACKPAD_MAX_DELTA = 4;
var TRACKPAD_MAX_DELTA_PER_TIME = 200;
// Slow down zoom if shift key is held for more precise zooming
var SHIFT_MULTIPLIER = 0.25;

var WheelInput = function () {
  function WheelInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck3.default)(this, WheelInput);

    this.element = element;
    this.callback = callback;

    this.options = (0, _assign2.default)({ enable: true }, options);

    this.time = 0;
    this.wheelPosition = null;
    this.type = null;
    this.timeout = null;
    this.lastValue = 0;

    this.events = WHEEL_EVENTS.concat(options.events || []);

    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  (0, _createClass3.default)(WheelInput, [{
    key: 'destroy',
    value: function destroy() {
      var _this2 = this;

      this.events.forEach(function (event) {
        return _this2.element.removeEventListener(event, _this2.handleEvent);
      });
    }

    /**
     * Enable this input (begin processing events)
     * if the specified event type is among those handled by this input.
     */

  }, {
    key: 'enableEventType',
    value: function enableEventType(eventType, enabled) {
      if (eventType === EVENT_TYPE) {
        this.options.enable = enabled;
      }
    }

    /* eslint-disable complexity, max-statements */

  }, {
    key: 'handleEvent',
    value: function handleEvent(event) {
      if (!this.options.enable) {
        return;
      }

      var value = event.deltaY;
      if (_globals.window.WheelEvent) {
        // Firefox doubles the values on retina screens...
        if (firefox && event.deltaMode === _globals.window.WheelEvent.DOM_DELTA_PIXEL) {
          value /= _globals.window.devicePixelRatio;
        }
        if (event.deltaMode === _globals.window.WheelEvent.DOM_DELTA_LINE) {
          value *= WHEEL_DELTA_PER_LINE;
        }
      }

      var type = this.type,
          timeout = this.timeout,
          lastValue = this.lastValue,
          time = this.time;


      var now = (_globals.window && _globals.window.performance || Date).now();
      var timeDelta = now - (time || 0);

      this.wheelPosition = {
        x: event.clientX,
        y: event.clientY
      };
      time = now;

      if (value !== 0 && value % WHEEL_DELTA_MAGIC_SCALER === 0) {
        // This one is definitely a mouse wheel event.
        type = 'wheel';
        // Normalize this value to match trackpad.
        value = Math.floor(value / WHEEL_DELTA_MAGIC_SCALER);
      } else if (value !== 0 && Math.abs(value) < TRACKPAD_MAX_DELTA) {
        // This one is definitely a trackpad event because it is so small.
        type = 'trackpad';
      } else if (timeDelta > 400) {
        // This is likely a new scroll action.
        type = null;
        lastValue = value;
        // Start a timeout in case this was a singular event,
        // and delay it by up to 40ms.
        timeout = _globals.window.setTimeout(function setTimeout() {
          this._onWheel(event, -lastValue, this.wheelPosition);
          type = 'wheel';
        }.bind(this), 40);
      } else if (!type) {
        // This is a repeating event, but we don't know the type of event just yet.
        // If the delta per time is small, we assume it's a fast trackpad;
        // otherwise we switch into wheel mode.
        type = Math.abs(timeDelta * value) < TRACKPAD_MAX_DELTA_PER_TIME ? 'trackpad' : 'wheel';

        // Make sure our delayed event isn't fired again, because we accumulate
        // the previous event (which was less than 40ms ago) into this event.
        if (timeout) {
          _globals.window.clearTimeout(timeout);
          timeout = null;
          value += lastValue;
        }
      }

      if (event.shiftKey && value) {
        value = value * SHIFT_MULTIPLIER;
      }

      // Only fire the callback if we actually know
      // what type of scrolling device the user uses.
      if (type) {
        this._onWheel(event, -value, this.wheelPosition);
      }
    }
  }, {
    key: '_onWheel',
    value: function _onWheel(srcEvent, delta, position) {
      this.callback({
        type: EVENT_TYPE,
        center: position,
        delta: delta,
        srcEvent: srcEvent,
        pointerType: 'mouse',
        target: srcEvent.target
      });
    }
  }]);
  return WheelInput;
}();

exports.default = WheelInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9pbnB1dHMvd2hlZWwtaW5wdXQuanMiXSwibmFtZXMiOlsiZmlyZWZveCIsImluZGV4T2YiLCJXSEVFTF9FVkVOVFMiLCJFVkVOVF9UWVBFIiwiV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSIiwiV0hFRUxfREVMVEFfUEVSX0xJTkUiLCJUUkFDS1BBRF9NQVhfREVMVEEiLCJUUkFDS1BBRF9NQVhfREVMVEFfUEVSX1RJTUUiLCJTSElGVF9NVUxUSVBMSUVSIiwiV2hlZWxJbnB1dCIsImVsZW1lbnQiLCJjYWxsYmFjayIsIm9wdGlvbnMiLCJlbmFibGUiLCJ0aW1lIiwid2hlZWxQb3NpdGlvbiIsInR5cGUiLCJ0aW1lb3V0IiwibGFzdFZhbHVlIiwiZXZlbnRzIiwiY29uY2F0IiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZm9yRWFjaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJldmVudFR5cGUiLCJlbmFibGVkIiwidmFsdWUiLCJkZWx0YVkiLCJXaGVlbEV2ZW50IiwiZGVsdGFNb2RlIiwiRE9NX0RFTFRBX1BJWEVMIiwiZGV2aWNlUGl4ZWxSYXRpbyIsIkRPTV9ERUxUQV9MSU5FIiwibm93IiwicGVyZm9ybWFuY2UiLCJEYXRlIiwidGltZURlbHRhIiwieCIsImNsaWVudFgiLCJ5IiwiY2xpZW50WSIsIk1hdGgiLCJmbG9vciIsImFicyIsInNldFRpbWVvdXQiLCJfb25XaGVlbCIsImNsZWFyVGltZW91dCIsInNoaWZ0S2V5Iiwic3JjRXZlbnQiLCJkZWx0YSIsInBvc2l0aW9uIiwiY2VudGVyIiwicG9pbnRlclR5cGUiLCJ0YXJnZXQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7QUFDQTs7OztBQXJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFjdkIsS0FBZCxFQUFxQixDQUFDSSxLQUF0QixFQUE2QixLQUFLZCxhQUFsQztBQUNEO0FBQ0Y7Ozs2QkFFUW9DLFEsRUFBVUMsSyxFQUFPQyxRLEVBQVU7QUFDbEMsV0FBSzFDLFFBQUwsQ0FBYztBQUNaSyxjQUFNYixVQURNO0FBRVptRCxnQkFBUUQsUUFGSTtBQUdaRCxvQkFIWTtBQUlaRCwwQkFKWTtBQUtaSSxxQkFBYSxPQUxEO0FBTVpDLGdCQUFRTCxTQUFTSztBQU5MLE9BQWQ7QUFRRDs7Ozs7a0JBNUhrQi9DLFUiLCJmaWxlIjoid2hlZWwtaW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgeyBJTlBVVF9FVkVOVF9UWVBFUyB9IGZyb20gJy4uL2NvbnN0YW50cydcbmltcG9ydCB7IHdpbmRvdywgdXNlckFnZW50IH0gZnJvbSAnLi4vdXRpbHMvZ2xvYmFscydcblxuY29uc3QgZmlyZWZveCA9IHVzZXJBZ2VudC5pbmRleE9mKCdmaXJlZm94JykgIT09IC0xXG5cbmNvbnN0IHsgV0hFRUxfRVZFTlRTIH0gPSBJTlBVVF9FVkVOVF9UWVBFU1xuY29uc3QgRVZFTlRfVFlQRSA9ICd3aGVlbCdcblxuLy8gQ29uc3RhbnRzIGZvciBub3JtYWxpemluZyBpbnB1dCBkZWx0YVxuY29uc3QgV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSID0gNC4wMDAyNDQxNDA2MjVcbmNvbnN0IFdIRUVMX0RFTFRBX1BFUl9MSU5FID0gNDBcbmNvbnN0IFRSQUNLUEFEX01BWF9ERUxUQSA9IDRcbmNvbnN0IFRSQUNLUEFEX01BWF9ERUxUQV9QRVJfVElNRSA9IDIwMFxuLy8gU2xvdyBkb3duIHpvb20gaWYgc2hpZnQga2V5IGlzIGhlbGQgZm9yIG1vcmUgcHJlY2lzZSB6b29taW5nXG5jb25zdCBTSElGVF9NVUxUSVBMSUVSID0gMC4yNVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGVlbElucHV0IHtcbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnRcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2tcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oeyBlbmFibGU6IHRydWUgfSwgb3B0aW9ucylcblxuICAgIHRoaXMudGltZSA9IDBcbiAgICB0aGlzLndoZWVsUG9zaXRpb24gPSBudWxsXG4gICAgdGhpcy50eXBlID0gbnVsbFxuICAgIHRoaXMudGltZW91dCA9IG51bGxcbiAgICB0aGlzLmxhc3RWYWx1ZSA9IDBcblxuICAgIHRoaXMuZXZlbnRzID0gV0hFRUxfRVZFTlRTLmNvbmNhdChvcHRpb25zLmV2ZW50cyB8fCBbXSlcblxuICAgIHRoaXMuaGFuZGxlRXZlbnQgPSB0aGlzLmhhbmRsZUV2ZW50LmJpbmQodGhpcylcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuaGFuZGxlRXZlbnQpXG4gICAgKVxuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+XG4gICAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudClcbiAgICApXG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHRoaXMgaW5wdXQgKGJlZ2luIHByb2Nlc3NpbmcgZXZlbnRzKVxuICAgKiBpZiB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgaXMgYW1vbmcgdGhvc2UgaGFuZGxlZCBieSB0aGlzIGlucHV0LlxuICAgKi9cbiAgZW5hYmxlRXZlbnRUeXBlKGV2ZW50VHlwZSwgZW5hYmxlZCkge1xuICAgIGlmIChldmVudFR5cGUgPT09IEVWRU5UX1RZUEUpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5lbmFibGUgPSBlbmFibGVkXG4gICAgfVxuICB9XG5cbiAgLyogZXNsaW50LWRpc2FibGUgY29tcGxleGl0eSwgbWF4LXN0YXRlbWVudHMgKi9cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICBpZiAoIXRoaXMub3B0aW9ucy5lbmFibGUpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIGxldCB2YWx1ZSA9IGV2ZW50LmRlbHRhWVxuICAgIGlmICh3aW5kb3cuV2hlZWxFdmVudCkge1xuICAgICAgLy8gRmlyZWZveCBkb3VibGVzIHRoZSB2YWx1ZXMgb24gcmV0aW5hIHNjcmVlbnMuLi5cbiAgICAgIGlmIChmaXJlZm94ICYmIGV2ZW50LmRlbHRhTW9kZSA9PT0gd2luZG93LldoZWVsRXZlbnQuRE9NX0RFTFRBX1BJWEVMKSB7XG4gICAgICAgIHZhbHVlIC89IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvXG4gICAgICB9XG4gICAgICBpZiAoZXZlbnQuZGVsdGFNb2RlID09PSB3aW5kb3cuV2hlZWxFdmVudC5ET01fREVMVEFfTElORSkge1xuICAgICAgICB2YWx1ZSAqPSBXSEVFTF9ERUxUQV9QRVJfTElORVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB7IHR5cGUsIHRpbWVvdXQsIGxhc3RWYWx1ZSwgdGltZSB9ID0gdGhpc1xuXG4gICAgY29uc3Qgbm93ID0gKCh3aW5kb3cgJiYgd2luZG93LnBlcmZvcm1hbmNlKSB8fCBEYXRlKS5ub3coKVxuICAgIGNvbnN0IHRpbWVEZWx0YSA9IG5vdyAtICh0aW1lIHx8IDApXG5cbiAgICB0aGlzLndoZWVsUG9zaXRpb24gPSB7XG4gICAgICB4OiBldmVudC5jbGllbnRYLFxuICAgICAgeTogZXZlbnQuY2xpZW50WVxuICAgIH1cbiAgICB0aW1lID0gbm93XG5cbiAgICBpZiAodmFsdWUgIT09IDAgJiYgdmFsdWUgJSBXSEVFTF9ERUxUQV9NQUdJQ19TQ0FMRVIgPT09IDApIHtcbiAgICAgIC8vIFRoaXMgb25lIGlzIGRlZmluaXRlbHkgYSBtb3VzZSB3aGVlbCBldmVudC5cbiAgICAgIHR5cGUgPSAnd2hlZWwnXG4gICAgICAvLyBOb3JtYWxpemUgdGhpcyB2YWx1ZSB0byBtYXRjaCB0cmFja3BhZC5cbiAgICAgIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSAvIFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUilcbiAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSAwICYmIE1hdGguYWJzKHZhbHVlKSA8IFRSQUNLUEFEX01BWF9ERUxUQSkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIHRyYWNrcGFkIGV2ZW50IGJlY2F1c2UgaXQgaXMgc28gc21hbGwuXG4gICAgICB0eXBlID0gJ3RyYWNrcGFkJ1xuICAgIH0gZWxzZSBpZiAodGltZURlbHRhID4gNDAwKSB7XG4gICAgICAvLyBUaGlzIGlzIGxpa2VseSBhIG5ldyBzY3JvbGwgYWN0aW9uLlxuICAgICAgdHlwZSA9IG51bGxcbiAgICAgIGxhc3RWYWx1ZSA9IHZhbHVlXG4gICAgICAvLyBTdGFydCBhIHRpbWVvdXQgaW4gY2FzZSB0aGlzIHdhcyBhIHNpbmd1bGFyIGV2ZW50LFxuICAgICAgLy8gYW5kIGRlbGF5IGl0IGJ5IHVwIHRvIDQwbXMuXG4gICAgICB0aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoXG4gICAgICAgIGZ1bmN0aW9uIHNldFRpbWVvdXQoKSB7XG4gICAgICAgICAgdGhpcy5fb25XaGVlbChldmVudCwgLWxhc3RWYWx1ZSwgdGhpcy53aGVlbFBvc2l0aW9uKVxuICAgICAgICAgIHR5cGUgPSAnd2hlZWwnXG4gICAgICAgIH0uYmluZCh0aGlzKSxcbiAgICAgICAgNDBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKCF0eXBlKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgcmVwZWF0aW5nIGV2ZW50LCBidXQgd2UgZG9uJ3Qga25vdyB0aGUgdHlwZSBvZiBldmVudCBqdXN0IHlldC5cbiAgICAgIC8vIElmIHRoZSBkZWx0YSBwZXIgdGltZSBpcyBzbWFsbCwgd2UgYXNzdW1lIGl0J3MgYSBmYXN0IHRyYWNrcGFkO1xuICAgICAgLy8gb3RoZXJ3aXNlIHdlIHN3aXRjaCBpbnRvIHdoZWVsIG1vZGUuXG4gICAgICB0eXBlID1cbiAgICAgICAgTWF0aC5hYnModGltZURlbHRhICogdmFsdWUpIDwgVFJBQ0tQQURfTUFYX0RFTFRBX1BFUl9USU1FXG4gICAgICAgICAgPyAndHJhY2twYWQnXG4gICAgICAgICAgOiAnd2hlZWwnXG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBvdXIgZGVsYXllZCBldmVudCBpc24ndCBmaXJlZCBhZ2FpbiwgYmVjYXVzZSB3ZSBhY2N1bXVsYXRlXG4gICAgICAvLyB0aGUgcHJldmlvdXMgZXZlbnQgKHdoaWNoIHdhcyBsZXNzIHRoYW4gNDBtcyBhZ28pIGludG8gdGhpcyBldmVudC5cbiAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dClcbiAgICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgICAgdmFsdWUgKz0gbGFzdFZhbHVlXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlICogU0hJRlRfTVVMVElQTElFUlxuICAgIH1cblxuICAgIC8vIE9ubHkgZmlyZSB0aGUgY2FsbGJhY2sgaWYgd2UgYWN0dWFsbHkga25vd1xuICAgIC8vIHdoYXQgdHlwZSBvZiBzY3JvbGxpbmcgZGV2aWNlIHRoZSB1c2VyIHVzZXMuXG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIHRoaXMuX29uV2hlZWwoZXZlbnQsIC12YWx1ZSwgdGhpcy53aGVlbFBvc2l0aW9uKVxuICAgIH1cbiAgfVxuXG4gIF9vbldoZWVsKHNyY0V2ZW50LCBkZWx0YSwgcG9zaXRpb24pIHtcbiAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgIHR5cGU6IEVWRU5UX1RZUEUsXG4gICAgICBjZW50ZXI6IHBvc2l0aW9uLFxuICAgICAgZGVsdGEsXG4gICAgICBzcmNFdmVudCxcbiAgICAgIHBvaW50ZXJUeXBlOiAnbW91c2UnLFxuICAgICAgdGFyZ2V0OiBzcmNFdmVudC50YXJnZXRcbiAgICB9KVxuICB9XG59XG4iXX0=