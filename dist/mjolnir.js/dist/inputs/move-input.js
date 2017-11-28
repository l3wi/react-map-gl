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

var MOUSE_EVENTS = _constants.INPUT_EVENT_TYPES.MOUSE_EVENTS; // Copyright (c) 2017 Uber Technologies, Inc.
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

var MOVE_EVENT_TYPE = 'pointermove';
var LEAVE_EVENT_TYPE = 'pointerleave';

/**
 * Hammer.js swallows 'move' events (for pointer/touch/mouse)
 * when the pointer is not down. This class sets up a handler
 * specifically for these events to work around this limitation.
 * Note that this could be extended to more intelligently handle
 * move events across input types, e.g. storing multiple simultaneous
 * pointer/touch events, calculating speed/direction, etc.
 */

var MoveInput = function () {
  function MoveInput(element, callback) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    (0, _classCallCheck3.default)(this, MoveInput);

    this.element = element;
    this.callback = callback;
    this.pressed = false;

    this.options = (0, _assign2.default)({ enable: true }, options);
    this.enableMoveEvent = this.options.enable;
    this.enableLeaveEvent = this.options.enable;

    this.events = MOUSE_EVENTS.concat(options.events || []);

    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  (0, _createClass3.default)(MoveInput, [{
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
      if (eventType === MOVE_EVENT_TYPE) {
        this.enableMoveEvent = enabled;
      }
      if (eventType === LEAVE_EVENT_TYPE) {
        this.enableLeaveEvent = enabled;
      }
    }
  }, {
    key: 'handleEvent',
    value: function handleEvent(event) {
      if (this.enableLeaveEvent) {
        if (event.type === 'mouseleave') {
          this.callback({
            type: LEAVE_EVENT_TYPE,
            srcEvent: event,
            pointerType: 'mouse',
            target: event.target
          });
        }
      }

      if (this.enableMoveEvent) {
        switch (event.type) {
          case 'mousedown':
            if (event.button >= 0) {
              // Button is down
              this.pressed = true;
            }
            break;
          case 'mousemove':
            // Move events use `which` to track the button being pressed
            if (event.which === 0) {
              // Button is not down
              this.pressed = false;
            }
            if (!this.pressed) {
              // Drag events are emitted by hammer already
              // we just need to emit the move event on hover
              this.callback({
                type: MOVE_EVENT_TYPE,
                srcEvent: event,
                pointerType: 'mouse',
                target: event.target
              });
            }
            break;
          case 'mouseup':
            this.pressed = false;
            break;
          default:
        }
      }
    }
  }]);
  return MoveInput;
}();

exports.default = MoveInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9pbnB1dHMvbW92ZS1pbnB1dC5qcyJdLCJuYW1lcyI6WyJNT1VTRV9FVkVOVFMiLCJNT1ZFX0VWRU5UX1RZUEUiLCJMRUFWRV9FVkVOVF9UWVBFIiwiTW92ZUlucHV0IiwiZWxlbWVudCIsImNhbGxiYWNrIiwib3B0aW9ucyIsInByZXNzZWQiLCJlbmFibGUiLCJlbmFibGVNb3ZlRXZlbnQiLCJlbmFibGVMZWF2ZUV2ZW50IiwiZXZlbnRzIiwiY29uY2F0IiwiaGFuZGxlRXZlbnQiLCJiaW5kIiwiZm9yRWFjaCIsImFkZEV2ZW50TGlzdGVuZXIiLCJldmVudCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJldmVudFR5cGUiLCJlbmFibGVkIiwidHlwZSIsInNyY0V2ZW50IiwicG9pbnRlclR5cGUiLCJ0YXJnZXQiLCJidXR0b24iLCJ3aGljaCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBb0JBOzs7Ozs7SSxBQUVPLDRDLEFBQUEsY0F0QlA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBS0EsSUFBTSxrQkFBTixBQUF3QjtBQUN4QixJQUFNLG1CQUFOLEFBQXlCOztBQUV6Qjs7Ozs7Ozs7O0ksQUFRcUIsd0JBRW5CO3FCQUFBLEFBQVksU0FBWixBQUFxQixVQUF3QjtnQkFBQTs7UUFBZCxBQUFjLDhFQUFKLEFBQUk7d0NBQzNDOztTQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2Y7U0FBQSxBQUFLLFdBQUwsQUFBZ0IsQUFDaEI7U0FBQSxBQUFLLFVBQUwsQUFBZSxBQUVmOztTQUFBLEFBQUssVUFBVSxzQkFBYyxFQUFDLFFBQWYsQUFBYyxBQUFTLFFBQXRDLEFBQWUsQUFBOEIsQUFDN0M7U0FBQSxBQUFLLGtCQUFrQixLQUFBLEFBQUssUUFBNUIsQUFBb0MsQUFDcEM7U0FBQSxBQUFLLG1CQUFtQixLQUFBLEFBQUssUUFBN0IsQUFBcUMsQUFFckM7O1NBQUEsQUFBSyxTQUFTLGFBQUEsQUFBYSxPQUFPLFFBQUEsQUFBUSxVQUExQyxBQUFjLEFBQXNDLEFBRXBEOztTQUFBLEFBQUssY0FBYyxLQUFBLEFBQUssWUFBTCxBQUFpQixLQUFwQyxBQUFtQixBQUFzQixBQUN6QztTQUFBLEFBQUssT0FBTCxBQUFZLFFBQVEsaUJBQUE7YUFBUyxRQUFBLEFBQVEsaUJBQVIsQUFBeUIsT0FBTyxNQUF6QyxBQUFTLEFBQXFDO0FBQWxFLEFBQ0Q7Ozs7OzhCQUVTO21CQUNSOztXQUFBLEFBQUssT0FBTCxBQUFZLFFBQVEsaUJBQUE7ZUFBUyxPQUFBLEFBQUssUUFBTCxBQUFhLG9CQUFiLEFBQWlDLE9BQU8sT0FBakQsQUFBUyxBQUE2QztBQUExRSxBQUNEO0FBRUQ7Ozs7Ozs7OztvQyxBQUlnQixXLEFBQVcsU0FBUyxBQUNsQztVQUFJLGNBQUosQUFBa0IsaUJBQWlCLEFBQ2pDO2FBQUEsQUFBSyxrQkFBTCxBQUF1QixBQUN4QjtBQUNEO1VBQUksY0FBSixBQUFrQixrQkFBa0IsQUFDbEM7YUFBQSxBQUFLLG1CQUFMLEFBQXdCLEFBQ3pCO0FBQ0Y7Ozs7Z0NBRVcsQSxPQUFPLEFBQ2pCO1VBQUksS0FBSixBQUFTLGtCQUFrQixBQUN6QjtZQUFJLE1BQUEsQUFBTSxTQUFWLEFBQW1CLGNBQWMsQUFDL0I7ZUFBQSxBQUFLO2tCQUFTLEFBQ04sQUFDTjtzQkFGWSxBQUVGLEFBQ1Y7eUJBSFksQUFHQyxBQUNiO29CQUFRLE1BSlYsQUFBYyxBQUlFLEFBRWpCO0FBTmUsQUFDWjtBQU1MO0FBRUQ7O1VBQUksS0FBSixBQUFTLGlCQUFpQixBQUN4QjtnQkFBUSxNQUFSLEFBQWMsQUFDZDtlQUFBLEFBQUssQUFDSDtnQkFBSSxNQUFBLEFBQU0sVUFBVixBQUFvQixHQUFHLEFBQ3JCO0FBQ0E7bUJBQUEsQUFBSyxVQUFMLEFBQWUsQUFDaEI7QUFDRDtBQUNGO2VBQUEsQUFBSyxBQUNIO0FBQ0E7Z0JBQUksTUFBQSxBQUFNLFVBQVYsQUFBb0IsR0FBRyxBQUNyQjtBQUNBO21CQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCO0FBQ0Q7Z0JBQUksQ0FBQyxLQUFMLEFBQVUsU0FBUyxBQUNqQjtBQUNBO0FBQ0E7bUJBQUEsQUFBSztzQkFBUyxBQUNOLEFBQ047MEJBRlksQUFFRixBQUNWOzZCQUhZLEFBR0MsQUFDYjt3QkFBUSxNQUpWLEFBQWMsQUFJRSxBQUVqQjtBQU5lLEFBQ1o7QUFNSjtBQUNGO2VBQUEsQUFBSyxBQUNIO2lCQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2Y7QUFDRjtBQTNCQSxBQTZCRDs7QUFFRjs7Ozs7O2tCQTlFa0IsQSIsImZpbGUiOiJtb3ZlLWlucHV0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtJTlBVVF9FVkVOVF9UWVBFU30gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY29uc3Qge01PVVNFX0VWRU5UU30gPSBJTlBVVF9FVkVOVF9UWVBFUztcbmNvbnN0IE1PVkVfRVZFTlRfVFlQRSA9ICdwb2ludGVybW92ZSc7XG5jb25zdCBMRUFWRV9FVkVOVF9UWVBFID0gJ3BvaW50ZXJsZWF2ZSc7XG5cbi8qKlxuICogSGFtbWVyLmpzIHN3YWxsb3dzICdtb3ZlJyBldmVudHMgKGZvciBwb2ludGVyL3RvdWNoL21vdXNlKVxuICogd2hlbiB0aGUgcG9pbnRlciBpcyBub3QgZG93bi4gVGhpcyBjbGFzcyBzZXRzIHVwIGEgaGFuZGxlclxuICogc3BlY2lmaWNhbGx5IGZvciB0aGVzZSBldmVudHMgdG8gd29yayBhcm91bmQgdGhpcyBsaW1pdGF0aW9uLlxuICogTm90ZSB0aGF0IHRoaXMgY291bGQgYmUgZXh0ZW5kZWQgdG8gbW9yZSBpbnRlbGxpZ2VudGx5IGhhbmRsZVxuICogbW92ZSBldmVudHMgYWNyb3NzIGlucHV0IHR5cGVzLCBlLmcuIHN0b3JpbmcgbXVsdGlwbGUgc2ltdWx0YW5lb3VzXG4gKiBwb2ludGVyL3RvdWNoIGV2ZW50cywgY2FsY3VsYXRpbmcgc3BlZWQvZGlyZWN0aW9uLCBldGMuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmVJbnB1dCB7XG5cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgY2FsbGJhY2ssIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5jYWxsYmFjayA9IGNhbGxiYWNrO1xuICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlO1xuXG4gICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih7ZW5hYmxlOiB0cnVlfSwgb3B0aW9ucyk7XG4gICAgdGhpcy5lbmFibGVNb3ZlRXZlbnQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlO1xuICAgIHRoaXMuZW5hYmxlTGVhdmVFdmVudCA9IHRoaXMub3B0aW9ucy5lbmFibGU7XG5cbiAgICB0aGlzLmV2ZW50cyA9IE1PVVNFX0VWRU5UUy5jb25jYXQob3B0aW9ucy5ldmVudHMgfHwgW10pO1xuXG4gICAgdGhpcy5oYW5kbGVFdmVudCA9IHRoaXMuaGFuZGxlRXZlbnQuYmluZCh0aGlzKTtcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudCkpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmV2ZW50cy5mb3JFYWNoKGV2ZW50ID0+IHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50LCB0aGlzLmhhbmRsZUV2ZW50KSk7XG4gIH1cblxuICAvKipcbiAgICogRW5hYmxlIHRoaXMgaW5wdXQgKGJlZ2luIHByb2Nlc3NpbmcgZXZlbnRzKVxuICAgKiBpZiB0aGUgc3BlY2lmaWVkIGV2ZW50IHR5cGUgaXMgYW1vbmcgdGhvc2UgaGFuZGxlZCBieSB0aGlzIGlucHV0LlxuICAgKi9cbiAgZW5hYmxlRXZlbnRUeXBlKGV2ZW50VHlwZSwgZW5hYmxlZCkge1xuICAgIGlmIChldmVudFR5cGUgPT09IE1PVkVfRVZFTlRfVFlQRSkge1xuICAgICAgdGhpcy5lbmFibGVNb3ZlRXZlbnQgPSBlbmFibGVkO1xuICAgIH1cbiAgICBpZiAoZXZlbnRUeXBlID09PSBMRUFWRV9FVkVOVF9UWVBFKSB7XG4gICAgICB0aGlzLmVuYWJsZUxlYXZlRXZlbnQgPSBlbmFibGVkO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZUV2ZW50KGV2ZW50KSB7XG4gICAgaWYgKHRoaXMuZW5hYmxlTGVhdmVFdmVudCkge1xuICAgICAgaWYgKGV2ZW50LnR5cGUgPT09ICdtb3VzZWxlYXZlJykge1xuICAgICAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgICAgICB0eXBlOiBMRUFWRV9FVkVOVF9UWVBFLFxuICAgICAgICAgIHNyY0V2ZW50OiBldmVudCxcbiAgICAgICAgICBwb2ludGVyVHlwZTogJ21vdXNlJyxcbiAgICAgICAgICB0YXJnZXQ6IGV2ZW50LnRhcmdldFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVNb3ZlRXZlbnQpIHtcbiAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgY2FzZSAnbW91c2Vkb3duJzpcbiAgICAgICAgaWYgKGV2ZW50LmJ1dHRvbiA+PSAwKSB7XG4gICAgICAgICAgLy8gQnV0dG9uIGlzIGRvd25cbiAgICAgICAgICB0aGlzLnByZXNzZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbW91c2Vtb3ZlJzpcbiAgICAgICAgLy8gTW92ZSBldmVudHMgdXNlIGB3aGljaGAgdG8gdHJhY2sgdGhlIGJ1dHRvbiBiZWluZyBwcmVzc2VkXG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMCkge1xuICAgICAgICAgIC8vIEJ1dHRvbiBpcyBub3QgZG93blxuICAgICAgICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5wcmVzc2VkKSB7XG4gICAgICAgICAgLy8gRHJhZyBldmVudHMgYXJlIGVtaXR0ZWQgYnkgaGFtbWVyIGFscmVhZHlcbiAgICAgICAgICAvLyB3ZSBqdXN0IG5lZWQgdG8gZW1pdCB0aGUgbW92ZSBldmVudCBvbiBob3ZlclxuICAgICAgICAgIHRoaXMuY2FsbGJhY2soe1xuICAgICAgICAgICAgdHlwZTogTU9WRV9FVkVOVF9UWVBFLFxuICAgICAgICAgICAgc3JjRXZlbnQ6IGV2ZW50LFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6ICdtb3VzZScsXG4gICAgICAgICAgICB0YXJnZXQ6IGV2ZW50LnRhcmdldFxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbW91c2V1cCc6XG4gICAgICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICB9XG4gICAgfVxuXG4gIH1cbn1cbiJdfQ==