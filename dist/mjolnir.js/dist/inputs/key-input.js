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

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnB1dHMva2V5LWlucHV0LmpzIl0sIm5hbWVzIjpbIktFWV9FVkVOVFMiLCJET1dOX0VWRU5UX1RZUEUiLCJVUF9FVkVOVF9UWVBFIiwiS2V5SW5wdXQiLCJlbGVtZW50IiwiY2FsbGJhY2siLCJvcHRpb25zIiwiZW5hYmxlIiwiZW5hYmxlRG93bkV2ZW50IiwiZW5hYmxlVXBFdmVudCIsImV2ZW50cyIsImNvbmNhdCIsImhhbmRsZUV2ZW50IiwiYmluZCIsInRhYkluZGV4Iiwic3R5bGUiLCJvdXRsaW5lIiwiZm9yRWFjaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJldmVudFR5cGUiLCJlbmFibGVkIiwidGFyZ2V0RWxlbWVudCIsInRhcmdldCIsInNyY0VsZW1lbnQiLCJ0YWdOYW1lIiwidHlwZSIsInNyY0V2ZW50Iiwia2V5Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7OztJLEFBRU8sMENBQUEsQSxZQXRCUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFLQSxJQUFNLGtCQUFOLEFBQXdCO0FBQ3hCLElBQU0sZ0JBQU4sQUFBc0I7O0lBRUQsQSx1QkFDbkI7b0JBQUEsQUFBWSxTQUFaLEFBQXFCLFVBQXdCO2dCQUFBOztRQUFkLEFBQWMsOEVBQUosQUFBSTt3Q0FDM0M7O1NBQUEsQUFBSyxVQUFMLEFBQWUsQUFDZjtTQUFBLEFBQUssV0FBTCxBQUFnQixBQUVoQjs7U0FBQSxBQUFLLFVBQVUsc0JBQWMsRUFBQyxRQUFmLEFBQWMsQUFBUyxRQUF0QyxBQUFlLEFBQThCLEFBQzdDO1NBQUEsQUFBSyxrQkFBa0IsS0FBQSxBQUFLLFFBQTVCLEFBQW9DLEFBQ3BDO1NBQUEsQUFBSyxnQkFBZ0IsS0FBQSxBQUFLLFFBQTFCLEFBQWtDLEFBRWxDOztTQUFBLEFBQUssU0FBUyxXQUFBLEFBQVcsT0FBTyxRQUFBLEFBQVEsVUFBeEMsQUFBYyxBQUFvQyxBQUVsRDs7U0FBQSxBQUFLLGNBQWMsS0FBQSxBQUFLLFlBQUwsQUFBaUIsS0FBcEMsQUFBbUIsQUFBc0IsQUFFekM7O1lBQUEsQUFBUSxXQUFSLEFBQW1CLEFBQ25CO1lBQUEsQUFBUSxNQUFSLEFBQWMsVUFBZCxBQUF3QixBQUN4QjtTQUFBLEFBQUssT0FBTCxBQUFZLFFBQVEsaUJBQUE7YUFBUyxRQUFBLEFBQVEsaUJBQVIsQUFBeUIsT0FBTyxNQUF6QyxBQUFTLEFBQXFDO0FBQWxFLEFBQ0Q7Ozs7OzhCQUVTO21CQUNSOztXQUFBLEFBQUssT0FBTCxBQUFZLFFBQVEsaUJBQUE7ZUFBUyxPQUFBLEFBQUssUUFBTCxBQUFhLG9CQUFiLEFBQWlDLE9BQU8sT0FBakQsQUFBUyxBQUE2QztBQUExRSxBQUNEO0FBRUQ7Ozs7Ozs7OztvQyxBQUlnQixXQUFXLEEsU0FBUyxBQUNsQztVQUFJLGNBQUosQUFBa0IsaUJBQWlCLEFBQ2pDO2FBQUEsQUFBSyxrQkFBTCxBQUF1QixBQUN4QjtBQUNEO1VBQUksY0FBSixBQUFrQixlQUFlLEFBQy9CO2FBQUEsQUFBSyxnQkFBTCxBQUFxQixBQUN0QjtBQUNGOzs7O2dDQUVXLEEsT0FBTyxBQUNqQjtBQUNBO1VBQU0sZ0JBQWdCLE1BQUEsQUFBTSxVQUFVLE1BQXRDLEFBQTRDLEFBQzVDO1VBQUssY0FBQSxBQUFjLFlBQWQsQUFBMEIsV0FBVyxjQUFBLEFBQWMsU0FBcEQsQUFBNkQsVUFDL0QsY0FBQSxBQUFjLFlBRGhCLEFBQzRCLFlBQVksQUFDdEM7QUFDRDtBQUVEOztVQUFJLEtBQUEsQUFBSyxtQkFBbUIsTUFBQSxBQUFNLFNBQWxDLEFBQTJDLFdBQVcsQUFDcEQ7YUFBQSxBQUFLO2dCQUFTLEFBQ04sQUFDTjtvQkFGWSxBQUVGLEFBQ1Y7ZUFBSyxNQUhPLEFBR0QsQUFDWDtrQkFBUSxNQUpWLEFBQWMsQUFJRSxBQUVqQjtBQU5lLEFBQ1o7QUFPSjs7VUFBSSxLQUFBLEFBQUssaUJBQWlCLE1BQUEsQUFBTSxTQUFoQyxBQUF5QyxTQUFTLEFBQ2hEO2FBQUEsQUFBSztnQkFBUyxBQUNOLEFBQ047b0JBRlksQUFFRixBQUNWO2VBQUssTUFITyxBQUdELEFBQ1g7a0JBQVEsTUFKVixBQUFjLEFBSUUsQUFFakI7QUFOZSxBQUNaO0FBTUw7Ozs7OztrQkE1RGtCLEEiLCJmaWxlIjoia2V5LWlucHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtJTlBVVF9FVkVOVF9UWVBFU30gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY29uc3Qge0tFWV9FVkVOVFN9ID0gSU5QVVRfRVZFTlRfVFlQRVM7XG5jb25zdCBET1dOX0VWRU5UX1RZUEUgPSAna2V5ZG93bic7XG5jb25zdCBVUF9FVkVOVF9UWVBFID0gJ2tleXVwJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgS2V5SW5wdXQge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBjYWxsYmFjaywgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHtlbmFibGU6IHRydWV9LCBvcHRpb25zKTtcbiAgICB0aGlzLmVuYWJsZURvd25FdmVudCA9IHRoaXMub3B0aW9ucy5lbmFibGU7XG4gICAgdGhpcy5lbmFibGVVcEV2ZW50ID0gdGhpcy5vcHRpb25zLmVuYWJsZTtcblxuICAgIHRoaXMuZXZlbnRzID0gS0VZX0VWRU5UUy5jb25jYXQob3B0aW9ucy5ldmVudHMgfHwgW10pO1xuXG4gICAgdGhpcy5oYW5kbGVFdmVudCA9IHRoaXMuaGFuZGxlRXZlbnQuYmluZCh0aGlzKTtcblxuICAgIGVsZW1lbnQudGFiSW5kZXggPSAxO1xuICAgIGVsZW1lbnQuc3R5bGUub3V0bGluZSA9ICdub25lJztcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudCkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLmhhbmRsZUV2ZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHRoaXMgaW5wdXQgKGJlZ2luIHByb2Nlc3NpbmcgZXZlbnRzKVxuICAgKiBpZiB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgaXMgYW1vbmcgdGhvc2UgaGFuZGxlZCBieSB0aGlzIGlucHV0LlxuICAgKi9cbiAgZW5hYmxlRXZlbnRUeXBlKGV2ZW50VHlwZSwgZW5hYmxlZCkge1xuICAgIGlmIChldmVudFR5cGUgPT09IERPV05fRVZFTlRfVFlQRSkge1xuICAgICAgdGhpcy5lbmFibGVEb3duRXZlbnQgPSBlbmFibGVkO1xuICAgIH1cbiAgICBpZiAoZXZlbnRUeXBlID09PSBVUF9FVkVOVF9UWVBFKSB7XG4gICAgICB0aGlzLmVuYWJsZVVwRXZlbnQgPSBlbmFibGVkO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgLy8gSWdub3JlIGlmIGZvY3VzZWQgb24gdGV4dCBpbnB1dFxuICAgIGNvbnN0IHRhcmdldEVsZW1lbnQgPSBldmVudC50YXJnZXQgfHwgZXZlbnQuc3JjRWxlbWVudDtcbiAgICBpZiAoKHRhcmdldEVsZW1lbnQudGFnTmFtZSA9PT0gJ0lOUFVUJyAmJiB0YXJnZXRFbGVtZW50LnR5cGUgPT09ICd0ZXh0JykgfHxcbiAgICAgIHRhcmdldEVsZW1lbnQudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZURvd25FdmVudCAmJiBldmVudC50eXBlID09PSAna2V5ZG93bicpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICB0eXBlOiBET1dOX0VWRU5UX1RZUEUsXG4gICAgICAgIHNyY0V2ZW50OiBldmVudCxcbiAgICAgICAga2V5OiBldmVudC5rZXksXG4gICAgICAgIHRhcmdldDogZXZlbnQudGFyZ2V0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVVcEV2ZW50ICYmIGV2ZW50LnR5cGUgPT09ICdrZXl1cCcpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICB0eXBlOiBVUF9FVkVOVF9UWVBFLFxuICAgICAgICBzcmNFdmVudDogZXZlbnQsXG4gICAgICAgIGtleTogZXZlbnQua2V5LFxuICAgICAgICB0YXJnZXQ6IGV2ZW50LnRhcmdldFxuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXX0=