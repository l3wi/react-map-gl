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

import { INPUT_EVENT_TYPES } from '../constants';
import { window, userAgent } from '../utils/globals';

var firefox = userAgent.indexOf('firefox') !== -1;

var WHEEL_EVENTS = INPUT_EVENT_TYPES.WHEEL_EVENTS;

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

    _classCallCheck(this, WheelInput);

    this.element = element;
    this.callback = callback;

    this.options = Object.assign({ enable: true }, options);

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

  _createClass(WheelInput, [{
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
      if (window.WheelEvent) {
        // Firefox doubles the values on retina screens...
        if (firefox && event.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL) {
          value /= window.devicePixelRatio;
        }
        if (event.deltaMode === window.WheelEvent.DOM_DELTA_LINE) {
          value *= WHEEL_DELTA_PER_LINE;
        }
      }

      var type = this.type,
          timeout = this.timeout,
          lastValue = this.lastValue,
          time = this.time;


      var now = (window && window.performance || Date).now();
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
        timeout = window.setTimeout(function setTimeout() {
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
          window.clearTimeout(timeout);
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

export default WheelInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9pbnB1dHMvd2hlZWwtaW5wdXQuanMiXSwibmFtZXMiOlsiSU5QVVRfRVZFTlRfVFlQRVMiLCJ3aW5kb3ciLCJ1c2VyQWdlbnQiLCJmaXJlZm94IiwiaW5kZXhPZiIsIldIRUVMX0VWRU5UUyIsIkVWRU5UX1RZUEUiLCJXSEVFTF9ERUxUQV9NQUdJQ19TQ0FMRVIiLCJXSEVFTF9ERUxUQV9QRVJfTElORSIsIlRSQUNLUEFEX01BWF9ERUxUQSIsIlRSQUNLUEFEX01BWF9ERUxUQV9QRVJfVElNRSIsIlNISUZUX01VTFRJUExJRVIiLCJXaGVlbElucHV0IiwiZWxlbWVudCIsImNhbGxiYWNrIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsImVuYWJsZSIsInRpbWUiLCJ3aGVlbFBvc2l0aW9uIiwidHlwZSIsInRpbWVvdXQiLCJsYXN0VmFsdWUiLCJldmVudHMiLCJjb25jYXQiLCJoYW5kbGVFdmVudCIsImJpbmQiLCJmb3JFYWNoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImV2ZW50VHlwZSIsImVuYWJsZWQiLCJ2YWx1ZSIsImRlbHRhWSIsIldoZWVsRXZlbnQiLCJkZWx0YU1vZGUiLCJET01fREVMVEFfUElYRUwiLCJkZXZpY2VQaXhlbFJhdGlvIiwiRE9NX0RFTFRBX0xJTkUiLCJub3ciLCJwZXJmb3JtYW5jZSIsIkRhdGUiLCJ0aW1lRGVsdGEiLCJ4IiwiY2xpZW50WCIsInkiLCJjbGllbnRZIiwiTWF0aCIsImZsb29yIiwiYWJzIiwic2V0VGltZW91dCIsIl9vbldoZWVsIiwiY2xlYXJUaW1lb3V0Iiwic2hpZnRLZXkiLCJzcmNFdmVudCIsImRlbHRhIiwicG9zaXRpb24iLCJjZW50ZXIiLCJwb2ludGVyVHlwZSIsInRhcmdldCJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFDRDtBQUNGOztBQUVELFVBQUlPLE1BQU15QixRQUFOLElBQWtCckIsS0FBdEIsRUFBNkI7QUFDM0JBLGdCQUFRQSxRQUFRdkIsZ0JBQWhCO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBLFVBQUlVLElBQUosRUFBVTtBQUNSLGFBQUtnQyxRQUFMLENBQWN2QixLQUFkLEVBQXFCLENBQUNJLEtBQXRCLEVBQTZCLEtBQUtkLGFBQWxDO0FBQ0Q7QUFDRjs7OzZCQUVRb0MsUSxFQUFVQyxLLEVBQU9DLFEsRUFBVTtBQUNsQyxXQUFLNUMsUUFBTCxDQUFjO0FBQ1pPLGNBQU1mLFVBRE07QUFFWnFELGdCQUFRRCxRQUZJO0FBR1pELG9CQUhZO0FBSVpELDBCQUpZO0FBS1pJLHFCQUFhLE9BTEQ7QUFNWkMsZ0JBQVFMLFNBQVNLO0FBTkwsT0FBZDtBQVFEOzs7Ozs7ZUE1SGtCakQsVSIsImZpbGUiOiJ3aGVlbC1pbnB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7IElOUFVUX0VWRU5UX1RZUEVTIH0gZnJvbSAnLi4vY29uc3RhbnRzJ1xuaW1wb3J0IHsgd2luZG93LCB1c2VyQWdlbnQgfSBmcm9tICcuLi91dGlscy9nbG9iYWxzJ1xuXG5jb25zdCBmaXJlZm94ID0gdXNlckFnZW50LmluZGV4T2YoJ2ZpcmVmb3gnKSAhPT0gLTFcblxuY29uc3QgeyBXSEVFTF9FVkVOVFMgfSA9IElOUFVUX0VWRU5UX1RZUEVTXG5jb25zdCBFVkVOVF9UWVBFID0gJ3doZWVsJ1xuXG4vLyBDb25zdGFudHMgZm9yIG5vcm1hbGl6aW5nIGlucHV0IGRlbHRhXG5jb25zdCBXSEVFTF9ERUxUQV9NQUdJQ19TQ0FMRVIgPSA0LjAwMDI0NDE0MDYyNVxuY29uc3QgV0hFRUxfREVMVEFfUEVSX0xJTkUgPSA0MFxuY29uc3QgVFJBQ0tQQURfTUFYX0RFTFRBID0gNFxuY29uc3QgVFJBQ0tQQURfTUFYX0RFTFRBX1BFUl9USU1FID0gMjAwXG4vLyBTbG93IGRvd24gem9vbSBpZiBzaGlmdCBrZXkgaXMgaGVsZCBmb3IgbW9yZSBwcmVjaXNlIHpvb21pbmdcbmNvbnN0IFNISUZUX01VTFRJUExJRVIgPSAwLjI1XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdoZWVsSW5wdXQge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjYWxsYmFjaywgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudFxuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFja1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7IGVuYWJsZTogdHJ1ZSB9LCBvcHRpb25zKVxuXG4gICAgdGhpcy50aW1lID0gMFxuICAgIHRoaXMud2hlZWxQb3NpdGlvbiA9IG51bGxcbiAgICB0aGlzLnR5cGUgPSBudWxsXG4gICAgdGhpcy50aW1lb3V0ID0gbnVsbFxuICAgIHRoaXMubGFzdFZhbHVlID0gMFxuXG4gICAgdGhpcy5ldmVudHMgPSBXSEVFTF9FVkVOVFMuY29uY2F0KG9wdGlvbnMuZXZlbnRzIHx8IFtdKVxuXG4gICAgdGhpcy5oYW5kbGVFdmVudCA9IHRoaXMuaGFuZGxlRXZlbnQuYmluZCh0aGlzKVxuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudClcbiAgICApXG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT5cbiAgICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLmhhbmRsZUV2ZW50KVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgdGhpcyBpbnB1dCAoYmVnaW4gcHJvY2Vzc2luZyBldmVudHMpXG4gICAqIGlmIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBpcyBhbW9uZyB0aG9zZSBoYW5kbGVkIGJ5IHRoaXMgaW5wdXQuXG4gICAqL1xuICBlbmFibGVFdmVudFR5cGUoZXZlbnRUeXBlLCBlbmFibGVkKSB7XG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gRVZFTlRfVFlQRSkge1xuICAgICAgdGhpcy5vcHRpb25zLmVuYWJsZSA9IGVuYWJsZWRcbiAgICB9XG4gIH1cblxuICAvKiBlc2xpbnQtZGlzYWJsZSBjb21wbGV4aXR5LCBtYXgtc3RhdGVtZW50cyAqL1xuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIGlmICghdGhpcy5vcHRpb25zLmVuYWJsZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgbGV0IHZhbHVlID0gZXZlbnQuZGVsdGFZXG4gICAgaWYgKHdpbmRvdy5XaGVlbEV2ZW50KSB7XG4gICAgICAvLyBGaXJlZm94IGRvdWJsZXMgdGhlIHZhbHVlcyBvbiByZXRpbmEgc2NyZWVucy4uLlxuICAgICAgaWYgKGZpcmVmb3ggJiYgZXZlbnQuZGVsdGFNb2RlID09PSB3aW5kb3cuV2hlZWxFdmVudC5ET01fREVMVEFfUElYRUwpIHtcbiAgICAgICAgdmFsdWUgLz0gd2luZG93LmRldmljZVBpeGVsUmF0aW9cbiAgICAgIH1cbiAgICAgIGlmIChldmVudC5kZWx0YU1vZGUgPT09IHdpbmRvdy5XaGVlbEV2ZW50LkRPTV9ERUxUQV9MSU5FKSB7XG4gICAgICAgIHZhbHVlICo9IFdIRUVMX0RFTFRBX1BFUl9MSU5FXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHsgdHlwZSwgdGltZW91dCwgbGFzdFZhbHVlLCB0aW1lIH0gPSB0aGlzXG5cbiAgICBjb25zdCBub3cgPSAoKHdpbmRvdyAmJiB3aW5kb3cucGVyZm9ybWFuY2UpIHx8IERhdGUpLm5vdygpXG4gICAgY29uc3QgdGltZURlbHRhID0gbm93IC0gKHRpbWUgfHwgMClcblxuICAgIHRoaXMud2hlZWxQb3NpdGlvbiA9IHtcbiAgICAgIHg6IGV2ZW50LmNsaWVudFgsXG4gICAgICB5OiBldmVudC5jbGllbnRZXG4gICAgfVxuICAgIHRpbWUgPSBub3dcblxuICAgIGlmICh2YWx1ZSAhPT0gMCAmJiB2YWx1ZSAlIFdIRUVMX0RFTFRBX01BR0lDX1NDQUxFUiA9PT0gMCkge1xuICAgICAgLy8gVGhpcyBvbmUgaXMgZGVmaW5pdGVseSBhIG1vdXNlIHdoZWVsIGV2ZW50LlxuICAgICAgdHlwZSA9ICd3aGVlbCdcbiAgICAgIC8vIE5vcm1hbGl6ZSB0aGlzIHZhbHVlIHRvIG1hdGNoIHRyYWNrcGFkLlxuICAgICAgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlIC8gV0hFRUxfREVMVEFfTUFHSUNfU0NBTEVSKVxuICAgIH0gZWxzZSBpZiAodmFsdWUgIT09IDAgJiYgTWF0aC5hYnModmFsdWUpIDwgVFJBQ0tQQURfTUFYX0RFTFRBKSB7XG4gICAgICAvLyBUaGlzIG9uZSBpcyBkZWZpbml0ZWx5IGEgdHJhY2twYWQgZXZlbnQgYmVjYXVzZSBpdCBpcyBzbyBzbWFsbC5cbiAgICAgIHR5cGUgPSAndHJhY2twYWQnXG4gICAgfSBlbHNlIGlmICh0aW1lRGVsdGEgPiA0MDApIHtcbiAgICAgIC8vIFRoaXMgaXMgbGlrZWx5IGEgbmV3IHNjcm9sbCBhY3Rpb24uXG4gICAgICB0eXBlID0gbnVsbFxuICAgICAgbGFzdFZhbHVlID0gdmFsdWVcbiAgICAgIC8vIFN0YXJ0IGEgdGltZW91dCBpbiBjYXNlIHRoaXMgd2FzIGEgc2luZ3VsYXIgZXZlbnQsXG4gICAgICAvLyBhbmQgZGVsYXkgaXQgYnkgdXAgdG8gNDBtcy5cbiAgICAgIHRpbWVvdXQgPSB3aW5kb3cuc2V0VGltZW91dChcbiAgICAgICAgZnVuY3Rpb24gc2V0VGltZW91dCgpIHtcbiAgICAgICAgICB0aGlzLl9vbldoZWVsKGV2ZW50LCAtbGFzdFZhbHVlLCB0aGlzLndoZWVsUG9zaXRpb24pXG4gICAgICAgICAgdHlwZSA9ICd3aGVlbCdcbiAgICAgICAgfS5iaW5kKHRoaXMpLFxuICAgICAgICA0MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoIXR5cGUpIHtcbiAgICAgIC8vIFRoaXMgaXMgYSByZXBlYXRpbmcgZXZlbnQsIGJ1dCB3ZSBkb24ndCBrbm93IHRoZSB0eXBlIG9mIGV2ZW50IGp1c3QgeWV0LlxuICAgICAgLy8gSWYgdGhlIGRlbHRhIHBlciB0aW1lIGlzIHNtYWxsLCB3ZSBhc3N1bWUgaXQncyBhIGZhc3QgdHJhY2twYWQ7XG4gICAgICAvLyBvdGhlcndpc2Ugd2Ugc3dpdGNoIGludG8gd2hlZWwgbW9kZS5cbiAgICAgIHR5cGUgPVxuICAgICAgICBNYXRoLmFicyh0aW1lRGVsdGEgKiB2YWx1ZSkgPCBUUkFDS1BBRF9NQVhfREVMVEFfUEVSX1RJTUVcbiAgICAgICAgICA/ICd0cmFja3BhZCdcbiAgICAgICAgICA6ICd3aGVlbCdcblxuICAgICAgLy8gTWFrZSBzdXJlIG91ciBkZWxheWVkIGV2ZW50IGlzbid0IGZpcmVkIGFnYWluLCBiZWNhdXNlIHdlIGFjY3VtdWxhdGVcbiAgICAgIC8vIHRoZSBwcmV2aW91cyBldmVudCAod2hpY2ggd2FzIGxlc3MgdGhhbiA0MG1zIGFnbykgaW50byB0aGlzIGV2ZW50LlxuICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgd2luZG93LmNsZWFyVGltZW91dCh0aW1lb3V0KVxuICAgICAgICB0aW1lb3V0ID0gbnVsbFxuICAgICAgICB2YWx1ZSArPSBsYXN0VmFsdWVcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXZlbnQuc2hpZnRLZXkgJiYgdmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUgKiBTSElGVF9NVUxUSVBMSUVSXG4gICAgfVxuXG4gICAgLy8gT25seSBmaXJlIHRoZSBjYWxsYmFjayBpZiB3ZSBhY3R1YWxseSBrbm93XG4gICAgLy8gd2hhdCB0eXBlIG9mIHNjcm9sbGluZyBkZXZpY2UgdGhlIHVzZXIgdXNlcy5cbiAgICBpZiAodHlwZSkge1xuICAgICAgdGhpcy5fb25XaGVlbChldmVudCwgLXZhbHVlLCB0aGlzLndoZWVsUG9zaXRpb24pXG4gICAgfVxuICB9XG5cbiAgX29uV2hlZWwoc3JjRXZlbnQsIGRlbHRhLCBwb3NpdGlvbikge1xuICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgdHlwZTogRVZFTlRfVFlQRSxcbiAgICAgIGNlbnRlcjogcG9zaXRpb24sXG4gICAgICBkZWx0YSxcbiAgICAgIHNyY0V2ZW50LFxuICAgICAgcG9pbnRlclR5cGU6ICdtb3VzZScsXG4gICAgICB0YXJnZXQ6IHNyY0V2ZW50LnRhcmdldFxuICAgIH0pXG4gIH1cbn1cbiJdfQ==