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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var KEY_EVENTS = _constants.INPUT_EVENT_TYPES.KEY_EVENTS; // Copyright (c) 2017 Uber Technologies, Inc.
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

var DOWN_EVENT_TYPE = 'keydown';
var UP_EVENT_TYPE = 'keyup';

var KeyInput = function () {
  function KeyInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck3.default)(this, KeyInput);

    this.element = element;
    this.callback = callback;

    this.options = (0, _assign2.default)({ enable: true }, options);
    this.enableDownEvent = this.options.enable;
    this.enableUpEvent = this.options.enable;

    this.events = KEY_EVENTS.concat(options.events || []);

    this.handleEvent = this.handleEvent.bind(this);

    element.tabIndex = 1;
    element.style.outline = 'none';
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  (0, _createClass3.default)(KeyInput, [{
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
      if (eventType === DOWN_EVENT_TYPE) {
        this.enableDownEvent = enabled;
      }
      if (eventType === UP_EVENT_TYPE) {
        this.enableUpEvent = enabled;
      }
    }
  }, {
    key: 'handleEvent',
    value: function handleEvent(event) {
      // Ignore if focused on text input
      var targetElement = event.target || event.srcElement;
      if (targetElement.tagName === 'INPUT' && targetElement.type === 'text' || targetElement.tagName === 'TEXTAREA') {
        return;
      }

      if (this.enableDownEvent && event.type === 'keydown') {
        this.callback({
          type: DOWN_EVENT_TYPE,
          srcEvent: event,
          key: event.key,
          target: event.target
        });
      }

      if (this.enableUpEvent && event.type === 'keyup') {
        this.callback({
          type: UP_EVENT_TYPE,
          srcEvent: event,
          key: event.key,
          target: event.target
        });
      }
    }
  }]);
  return KeyInput;
}();

exports.default = KeyInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9pbnB1dHMva2V5LWlucHV0LmpzIl0sIm5hbWVzIjpbIktFWV9FVkVOVFMiLCJET1dOX0VWRU5UX1RZUEUiLCJVUF9FVkVOVF9UWVBFIiwiS2V5SW5wdXQiLCJlbGVtZW50IiwiY2FsbGJhY2siLCJvcHRpb25zIiwiZW5hYmxlIiwiZW5hYmxlRG93bkV2ZW50IiwiZW5hYmxlVXBFdmVudCIsImV2ZW50cyIsImNvbmNhdCIsImhhbmRsZUV2ZW50IiwiYmluZCIsInRhYkluZGV4Iiwic3R5bGUiLCJvdXRsaW5lIiwiZm9yRWFjaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJldmVudFR5cGUiLCJlbmFibGVkIiwidGFyZ2V0RWxlbWVudCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJ0YWdOYW1lIiwidHlwZSIsInNyY0V2ZW50Iiwia2V5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7SUFFT0EsVSxnQ0FBQUEsVSxFQXRCUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFLQSxJQUFNQyxrQkFBa0IsU0FBeEI7QUFDQSxJQUFNQyxnQkFBZ0IsT0FBdEI7O0lBRXFCQyxRO0FBQ25CLG9CQUFZQyxPQUFaLEVBQXFCQyxRQUFyQixFQUE2QztBQUFBOztBQUFBLFFBQWRDLE9BQWMsdUVBQUosRUFBSTtBQUFBOztBQUMzQyxTQUFLRixPQUFMLEdBQWVBLE9BQWY7QUFDQSxTQUFLQyxRQUFMLEdBQWdCQSxRQUFoQjs7QUFFQSxTQUFLQyxPQUFMLEdBQWUsc0JBQWMsRUFBQ0MsUUFBUSxJQUFULEVBQWQsRUFBOEJELE9BQTlCLENBQWY7QUFDQSxTQUFLRSxlQUFMLEdBQXVCLEtBQUtGLE9BQUwsQ0FBYUMsTUFBcEM7QUFDQSxTQUFLRSxhQUFMLEdBQXFCLEtBQUtILE9BQUwsQ0FBYUMsTUFBbEM7O0FBRUEsU0FBS0csTUFBTCxHQUFjVixXQUFXVyxNQUFYLENBQWtCTCxRQUFRSSxNQUFSLElBQWtCLEVBQXBDLENBQWQ7O0FBRUEsU0FBS0UsV0FBTCxHQUFtQixLQUFLQSxXQUFMLENBQWlCQyxJQUFqQixDQUFzQixJQUF0QixDQUFuQjs7QUFFQVQsWUFBUVUsUUFBUixHQUFtQixDQUFuQjtBQUNBVixZQUFRVyxLQUFSLENBQWNDLE9BQWQsR0FBd0IsTUFBeEI7QUFDQSxTQUFLTixNQUFMLENBQVlPLE9BQVosQ0FBb0I7QUFBQSxhQUFTYixRQUFRYyxnQkFBUixDQUF5QkMsS0FBekIsRUFBZ0MsTUFBS1AsV0FBckMsQ0FBVDtBQUFBLEtBQXBCO0FBQ0Q7Ozs7OEJBRVM7QUFBQTs7QUFDUixXQUFLRixNQUFMLENBQVlPLE9BQVosQ0FBb0I7QUFBQSxlQUFTLE9BQUtiLE9BQUwsQ0FBYWdCLG1CQUFiLENBQWlDRCxLQUFqQyxFQUF3QyxPQUFLUCxXQUE3QyxDQUFUO0FBQUEsT0FBcEI7QUFDRDs7QUFFRDs7Ozs7OztvQ0FJZ0JTLFMsRUFBV0MsTyxFQUFTO0FBQ2xDLFVBQUlELGNBQWNwQixlQUFsQixFQUFtQztBQUNqQyxhQUFLTyxlQUFMLEdBQXVCYyxPQUF2QjtBQUNEO0FBQ0QsVUFBSUQsY0FBY25CLGFBQWxCLEVBQWlDO0FBQy9CLGFBQUtPLGFBQUwsR0FBcUJhLE9BQXJCO0FBQ0Q7QUFDRjs7O2dDQUVXSCxLLEVBQU87QUFDakI7QUFDQSxVQUFNSSxnQkFBZ0JKLE1BQU1LLE1BQU4sSUFBZ0JMLE1BQU1NLFVBQTVDO0FBQ0EsVUFBS0YsY0FBY0csT0FBZCxLQUEwQixPQUExQixJQUFxQ0gsY0FBY0ksSUFBZCxLQUF1QixNQUE3RCxJQUNGSixjQUFjRyxPQUFkLEtBQTBCLFVBRDVCLEVBQ3dDO0FBQ3RDO0FBQ0Q7O0FBRUQsVUFBSSxLQUFLbEIsZUFBTCxJQUF3QlcsTUFBTVEsSUFBTixLQUFlLFNBQTNDLEVBQXNEO0FBQ3BELGFBQUt0QixRQUFMLENBQWM7QUFDWnNCLGdCQUFNMUIsZUFETTtBQUVaMkIsb0JBQVVULEtBRkU7QUFHWlUsZUFBS1YsTUFBTVUsR0FIQztBQUlaTCxrQkFBUUwsTUFBTUs7QUFKRixTQUFkO0FBTUQ7O0FBRUQsVUFBSSxLQUFLZixhQUFMLElBQXNCVSxNQUFNUSxJQUFOLEtBQWUsT0FBekMsRUFBa0Q7QUFDaEQsYUFBS3RCLFFBQUwsQ0FBYztBQUNac0IsZ0JBQU16QixhQURNO0FBRVowQixvQkFBVVQsS0FGRTtBQUdaVSxlQUFLVixNQUFNVSxHQUhDO0FBSVpMLGtCQUFRTCxNQUFNSztBQUpGLFNBQWQ7QUFNRDtBQUNGOzs7OztrQkE1RGtCckIsUSIsImZpbGUiOiJrZXktaW5wdXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0lOUFVUX0VWRU5UX1RZUEVTfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jb25zdCB7S0VZX0VWRU5UU30gPSBJTlBVVF9FVkVOVF9UWVBFUztcbmNvbnN0IERPV05fRVZFTlRfVFlQRSA9ICdrZXlkb3duJztcbmNvbnN0IFVQX0VWRU5UX1RZUEUgPSAna2V5dXAnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBLZXlJbnB1dCB7XG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNhbGxiYWNrLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe2VuYWJsZTogdHJ1ZX0sIG9wdGlvbnMpO1xuICAgIHRoaXMuZW5hYmxlRG93bkV2ZW50ID0gdGhpcy5vcHRpb25zLmVuYWJsZTtcbiAgICB0aGlzLmVuYWJsZVVwRXZlbnQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlO1xuXG4gICAgdGhpcy5ldmVudHMgPSBLRVlfRVZFTlRTLmNvbmNhdChvcHRpb25zLmV2ZW50cyB8fCBbXSk7XG5cbiAgICB0aGlzLmhhbmRsZUV2ZW50ID0gdGhpcy5oYW5kbGVFdmVudC5iaW5kKHRoaXMpO1xuXG4gICAgZWxlbWVudC50YWJJbmRleCA9IDE7XG4gICAgZWxlbWVudC5zdHlsZS5vdXRsaW5lID0gJ25vbmUnO1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLmhhbmRsZUV2ZW50KSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZXZlbnRzLmZvckVhY2goZXZlbnQgPT4gdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuaGFuZGxlRXZlbnQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbmFibGUgdGhpcyBpbnB1dCAoYmVnaW4gcHJvY2Vzc2luZyBldmVudHMpXG4gICAqIGlmIHRoZSBzcGVjaWZpZWQgZXZlbnQgdHlwZSBpcyBhbW9uZyB0aG9zZSBoYW5kbGVkIGJ5IHRoaXMgaW5wdXQuXG4gICAqL1xuICBlbmFibGVFdmVudFR5cGUoZXZlbnRUeXBlLCBlbmFibGVkKSB7XG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gRE9XTl9FVkVOVF9UWVBFKSB7XG4gICAgICB0aGlzLmVuYWJsZURvd25FdmVudCA9IGVuYWJsZWQ7XG4gICAgfVxuICAgIGlmIChldmVudFR5cGUgPT09IFVQX0VWRU5UX1RZUEUpIHtcbiAgICAgIHRoaXMuZW5hYmxlVXBFdmVudCA9IGVuYWJsZWQ7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlRXZlbnQoZXZlbnQpIHtcbiAgICAvLyBJZ25vcmUgaWYgZm9jdXNlZCBvbiB0ZXh0IGlucHV0XG4gICAgY29uc3QgdGFyZ2V0RWxlbWVudCA9IGV2ZW50LnRhcmdldCB8fCBldmVudC5zcmNFbGVtZW50O1xuICAgIGlmICgodGFyZ2V0RWxlbWVudC50YWdOYW1lID09PSAnSU5QVVQnICYmIHRhcmdldEVsZW1lbnQudHlwZSA9PT0gJ3RleHQnKSB8fFxuICAgICAgdGFyZ2V0RWxlbWVudC50YWdOYW1lID09PSAnVEVYVEFSRUEnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZW5hYmxlRG93bkV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXlkb3duJykge1xuICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgIHR5cGU6IERPV05fRVZFTlRfVFlQRSxcbiAgICAgICAgc3JjRXZlbnQ6IGV2ZW50LFxuICAgICAgICBrZXk6IGV2ZW50LmtleSxcbiAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVVwRXZlbnQgJiYgZXZlbnQudHlwZSA9PT0gJ2tleXVwJykge1xuICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgIHR5cGU6IFVQX0VWRU5UX1RZUEUsXG4gICAgICAgIHNyY0V2ZW50OiBldmVudCxcbiAgICAgICAga2V5OiBldmVudC5rZXksXG4gICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==