'use strict';

Object.defineProperty(exports, '__esModule', {
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

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};(0, _classCallCheck3.default)(this, WheelInput);

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

  ;(0, _createClass3.default)(WheelInput, [{
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnB1dHMvd2hlZWwtaW5wdXQuanMiXSwibmFtZXMiOlsiZmlyZWZveCIsImluZGV4T2YiLCJXSEVFTF9FVkVOVFMiLCJFVkVOVF9UWVBFIiwiV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSIiwiV0hFRUxfREVMVEFfUEVSX0xJTkUiLCJUUkFDS1BBRF9NQVhfREVMVEEiLCJUUkFDS1BBRF9NQVhfREVMVEFfUEVSX1RJTUUiLCJTSElGVF9NVUxUSVBMSUVSIiwiV2hlZWxJbnB1dCIsImVsZW1lbnQiLCJjYWxsYmFjayIsIm9wdGlvbnMiLCJlbmFibGUiLCJ0aW1lIiwid2hlZWxQb3NpdGlvbiIsInR5cGUiLCJ0aW1lb3V0IiwibGFzdFZhbHVlIiwiZXZlbnRzIiwiY29uY2F0IiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZm9yRWFjaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJldmVudFR5cGUiLCJlbmFibGVkIiwicHJldmVudERlZmF1bHQiLCJ2YWx1ZSIsImRlbHRhWSIsIldoZWVsRXZlbnQiLCJkZWx0YU1vZGUiLCJET01fREVMVEFfUElYRUwiLCJkZXZpY2VQaXhlbFJhdGlvIiwiRE9NX0RFTFRBX0xJTkUiLCJub3ciLCJwZXJmb3JtYW5jZSIsIkRhdGUiLCJ0aW1lRGVsdGEiLCJ4IiwiY2xpZW50WCIsInkiLCJjbGllbnRZIiwiTWF0aCIsImZsb29yIiwiYWJzIiwic2V0VGltZW91dCIsIl9vbldoZWVsIiwiY2xlYXJUaW1lb3V0Iiwic2hpZnRLZXkiLCJzcmNFdmVudCIsImRlbHRhIiwicG9zaXRpb24iLCJjZW50ZXIiLCJwb2ludGVyVHlwZSIsInRhcmdldCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOztBQUNBOzs7a0RBckJBO0FBQ0E7O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFPLEFBQ2Y7QUFBTSxlQUFBLEFBQUksQUFBQyxBQUFNLEFBQ2hCO29CQUNBO0FBQ0E7QUFDQTtBQUFPLGtCQUFBLEFBQUssQUFBSSxnQkFBaEIsQUFBTyxBQUFxQixBQUFTLEFBQThCLEFBQWEsaUNBRWhGO2dEQUNBO2lCQUNBLEFBQUk7ZUFBSixBQUFhLEFBQ1gsT0FBQSxBQUFPLEFBQWEsQUFDcEIsQUFBVSxBQUNWO09BYk8sVUFhRSxPQUFULEFBQ0Q7QUFDRjs7QUFFRDtBQUFBLEFBQUksQUFBTSxBQUFZLEFBQU8sQUFDM0IsZUFBUSxTQUFRLFlBQWhCLFNBQ0QsMkNBRUQsQUFDQTs7QUFDQTtBQUFBLEFBQUksQUFBTSxBQUNSO0FBQUssWUFBTCxBQUFjLFNBQWQsQUFBcUIsQUFBQyxBQUFPLEFBQUssQUFDbkM7dUNBQ0Y7Ozs7QSxBQUVRLEFBQVUsQUFBTyxBQUFVLEFBQ2xDLEFBQUssQUFBUyxBQUNaOztVQUFNLE1BRE0sbUJBRVo7QUFBUSxnQkFGSSxRQUdaO0FBSFksQUFJWixBQUNBOztBQUxZLEFBS0MsQUFDYjtBQU5GLEFBQWMsQUFNSixBQUFTO2dCQUVwQjs7OztBQW5GRTtTQXRDZ0IsQSIsImZpbGUiOiJ3aGVlbC1pbnB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7SU5QVVRfRVZFTlRfVFlQRVN9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQge3dpbmRvdywgdXNlckFnZW50fSBmcm9tICcuLi91dGlscy9nbG9iYWxzJztcblxuY29uc3QgZmlyZWZveCA9IHVzZXJBZ2VudC5pbmRleE9mKCdmaXJlZm94JykgIT09IC0xO1xuXG5jb25zdCB7V0hFRUxfRVZFTlRTfSA9IElOUFVUX0VWRU5UX1RZUEVTO1xuY29uc3QgRVZFTlRfVFlQRSA9ICd3aGVlbCc7XG5cbi8vIENvbnN0YW50cyBmb3Igbm9ybWFsaXppbmcgaW5wdXQgZGVsdGFcbmNvbnN0IFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUiA9IDQuMDAwMjQ0MTQwNjI1O1xuY29uc3QgV0hFRUxfREVMVEFfUEVSX0xJTkUgPSA0MDtcbmNvbnN0IFRSQUNLUEFEX01BWF9ERUxUQSA9IDQ7XG5jb25zdCBUUkFDS1BBRF9NQVhfREVMVEFfUEVSX1RJTUUgPSAyMDA7XG4vLyBTbG93IGRvd24gem9vbSBpZiBzaGlmdCBrZXkgaXMgaGVsZCBmb3IgbW9yZSBwcmVjaXNlIHpvb21pbmdcbmNvbnN0IFNISUZUX01VTFRJUExJRVIgPSAwLjI1O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaGVlbElucHV0IHtcblxuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjYWxsYmFjaywgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtlbmFibGU6IHRydWV9LCBvcHRpb25zKTtcblxuICAgIHRoaXMudGltZSA9IDA7XG4gICAgdGhpcy53aGVlbFBvc2l0aW9uID0gbnVsbDtcbiAgICB0aGlzLnR5cGUgPSBudWxsO1xuICAgIHRoaXMudGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5sYXN0VmFsdWUgPSAwO1xuXG4gICAgdGhpcy5ldmVudHMgPSBXSEVFTF9FVkVOVFMuY29uY2F0KG9wdGlvbnMuZXZlbnRzIHx8IFtdKTtcblxuICAgIHRoaXMuaGFuZGxlRXZlbnQgPSB0aGlzLmhhbmRsZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuaGFuZGxlRXZlbnQpKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaChldmVudCA9PiB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSB0aGlzIGlucHV0IChiZWdpbiBwcm9jZXNzaW5nIGV2ZW50cylcbiAgICogaWYgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlIGlzIGFtb25nIHRob3NlIGhhbmRsZWQgYnkgdGhpcyBpbnB1dC5cbiAgICovXG4gIGVuYWJsZUV2ZW50VHlwZShldmVudFR5cGUsIGVuYWJsZWQpIHtcbiAgICBpZiAoZXZlbnRUeXBlID09PSBFVkVOVF9UWVBFKSB7XG4gICAgICB0aGlzLm9wdGlvbnMuZW5hYmxlID0gZW5hYmxlZDtcbiAgICB9XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5LCBtYXgtc3RhdGVtZW50cyAqL1xuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmVuYWJsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgbGV0IHZhbHVlID0gZXZlbnQuZGVsdGFZO1xuICAgIGlmICh3aW5kb3cuV2hlZWxFdmVudCkge1xuICAgICAgLy8gRmlyZWZveCBkb3VibGVzIHRoZSB2YWx1ZXMgb24gcmV0aW5hIHNjcmVlbnMuLi5cbiAgICAgIGlmIChmaXJlZm94ICYmIGV2ZW50LmRlbHRhTW9kZSA9PT0gd2luZG93LldoZWVsRXZlbnQuRE9NX0RFTFRBX1BJWEVMKSB7XG4gICAgICAgIHZhbHVlIC89IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvO1xuICAgICAgfVxuICAgICAgaWYgKGV2ZW50LmRlbHRhTW9kZSA9PT0gd2luZG93LldoZWVsRXZlbnQuRE9NX0RFTFRBX0xJTkUpIHtcbiAgICAgICAgdmFsdWUgKj0gV0hFRUxfREVMVEFfUEVSX0xJTkU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHtcbiAgICAgIHR5cGUsXG4gICAgICB0aW1lb3V0LFxuICAgICAgbGFzdFZhbHVlLFxuICAgICAgdGltZVxuICAgIH0gPSB0aGlzO1xuXG4gICAgY29uc3Qgbm93ID0gKCh3aW5kb3cgJiYgd2luZG93LnBlcmZvcm1hbmNlKSB8fCBEYXRlKS5ub3coKTtcbiAgICBjb25zdCB0aW1lRGVsdGEgPSBub3cgLSAodGltZSB8fCAwKTtcblxuICAgIHRoaXMud2hlZWxQb3NpdGlvbiA9IHtcbiAgICAgIHg6IGV2ZW50LmNsaWVudFgsXG4gICAgICB5OiBldmVudC5jbGllbnRZXG4gICAgfTtcbiAgICB0aW1lID0gbm93O1xuXG4gICAgaWYgKHZhbHVlICE9PSAwICYmIHZhbHVlICUgV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSID09PSAwKSB7XG4gICAgICAvLyBUaGlzIG9uZSBpcyBkZWZpbml0ZWx5IGEgbW91c2Ugd2hlZWwgZXZlbnQuXG4gICAgICB0eXBlID0gJ3doZWVsJztcbiAgICAgIC8vIE5vcm1hbGl6ZSB0aGlzIHZhbHVlIHRvIG1hdGNoIHRyYWNrcGFkLlxuICAgICAgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlIC8gV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSKTtcbiAgICB9IGVsc2UgaWYgKHZhbHVlICE9PSAwICYmIE1hdGguYWJzKHZhbHVlKSA8IFRSQUNLUEFEX01BWF9ERUxUQSkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIHRyYWNrcGFkIGV2ZW50IGJlY2F1c2UgaXQgaXMgc28gc21hbGwuXG4gICAgICB0eXBlID0gJ3RyYWNrcGFkJztcbiAgICB9IGVsc2UgaWYgKHRpbWVEZWx0YSA+IDQwMCkge1xuICAgICAgLy8gVGhpcyBpcyBsaWtlbHkgYSBuZXcgc2Nyb2xsIGFjdGlvbi5cbiAgICAgIHR5cGUgPSBudWxsO1xuICAgICAgbGFzdFZhbHVlID0gdmFsdWU7XG4gICAgICAvLyBTdGFydCBhIHRpbWVvdXQgaW4gY2FzZSB0aGlzIHdhcyBhIHNpbmd1bGFyIGV2ZW50LFxuICAgICAgLy8gYW5kIGRlbGF5IGl0IGJ5IHVwIHRvIDQwbXMuXG4gICAgICB0aW1lb3V0ID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24gc2V0VGltZW91dCgpIHtcbiAgICAgICAgdGhpcy5fb25XaGVlbChldmVudCwgLWxhc3RWYWx1ZSwgdGhpcy53aGVlbFBvc2l0aW9uKTtcbiAgICAgICAgdHlwZSA9ICd3aGVlbCc7XG4gICAgICB9LmJpbmQodGhpcyksIDQwKTtcbiAgICB9IGVsc2UgaWYgKCF0eXBlKSB7XG4gICAgICAvLyBUaGlzIGlzIGEgcmVwZWF0aW5nIGV2ZW50LCBidXQgd2UgZG9uJ3Qga25vdyB0aGUgdHlwZSBvZiBldmVudCBqdXN0IHlldC5cbiAgICAgIC8vIElmIHRoZSBkZWx0YSBwZXIgdGltZSBpcyBzbWFsbCwgd2UgYXNzdW1lIGl0J3MgYSBmYXN0IHRyYWNrcGFkO1xuICAgICAgLy8gb3RoZXJ3aXNlIHdlIHN3aXRjaCBpbnRvIHdoZWVsIG1vZGUuXG4gICAgICB0eXBlID0gTWF0aC5hYnModGltZURlbHRhICogdmFsdWUpIDwgVFJBQ0tQQURfTUFYX0RFTFRBX1BFUl9USU1FID8gJ3RyYWNrcGFkJyA6ICd3aGVlbCc7XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBvdXIgZGVsYXllZCBldmVudCBpc24ndCBmaXJlZCBhZ2FpbiwgYmVjYXVzZSB3ZSBhY2N1bXVsYXRlXG4gICAgICAvLyB0aGUgcHJldmlvdXMgZXZlbnQgKHdoaWNoIHdhcyBsZXNzIHRoYW4gNDBtcyBhZ28pIGludG8gdGhpcyBldmVudC5cbiAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB2YWx1ZSArPSBsYXN0VmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5ICYmIHZhbHVlKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlICogU0hJRlRfTVVMVElQTElFUjtcbiAgICB9XG5cbiAgICAvLyBPbmx5IGZpcmUgdGhlIGNhbGxiYWNrIGlmIHdlIGFjdHVhbGx5IGtub3dcbiAgICAvLyB3aGF0IHR5cGUgb2Ygc2Nyb2xsaW5nIGRldmljZSB0aGUgdXNlciB1c2VzLlxuICAgIGlmICh0eXBlKSB7XG4gICAgICB0aGlzLl9vbldoZWVsKGV2ZW50LCAtdmFsdWUsIHRoaXMud2hlZWxQb3NpdGlvbik7XG4gICAgfVxuICB9XG5cbiAgX29uV2hlZWwoc3JjRXZlbnQsIGRlbHRhLCBwb3NpdGlvbikge1xuICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgdHlwZTogRVZFTlRfVFlQRSxcbiAgICAgIGNlbnRlcjogcG9zaXRpb24sXG4gICAgICBkZWx0YSxcbiAgICAgIHNyY0V2ZW50LFxuICAgICAgcG9pbnRlclR5cGU6ICdtb3VzZScsXG4gICAgICB0YXJnZXQ6IHNyY0V2ZW50LnRhcmdldFxuICAgIH0pO1xuICB9XG59XG4iXX0=