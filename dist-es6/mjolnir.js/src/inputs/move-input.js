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

var MOUSE_EVENTS = INPUT_EVENT_TYPES.MOUSE_EVENTS;

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

    _classCallCheck(this, MoveInput);

    this.element = element;
    this.callback = callback;
    this.pressed = false;

    this.options = Object.assign({ enable: true }, options);
    this.enableMoveEvent = this.options.enable;
    this.enableLeaveEvent = this.options.enable;

    this.events = MOUSE_EVENTS.concat(options.events || []);

    this.handleEvent = this.handleEvent.bind(this);
    this.events.forEach(function (event) {
      return element.addEventListener(event, _this.handleEvent);
    });
  }

  _createClass(MoveInput, [{
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

export default MoveInput;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9pbnB1dHMvbW92ZS1pbnB1dC5qcyJdLCJuYW1lcyI6WyJJTlBVVF9FVkVOVF9UWVBFUyIsIk1PVVNFX0VWRU5UUyIsIk1PVkVfRVZFTlRfVFlQRSIsIkxFQVZFX0VWRU5UX1RZUEUiLCJNb3ZlSW5wdXQiLCJlbGVtZW50IiwiY2FsbGJhY2siLCJvcHRpb25zIiwicHJlc3NlZCIsIk9iamVjdCIsImFzc2lnbiIsImVuYWJsZSIsImVuYWJsZU1vdmVFdmVudCIsImVuYWJsZUxlYXZlRXZlbnQiLCJldmVudHMiLCJjb25jYXQiLCJoYW5kbGVFdmVudCIsImJpbmQiLCJmb3JFYWNoIiwiYWRkRXZlbnRMaXN0ZW5lciIsImV2ZW50IiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsImV2ZW50VHlwZSIsImVuYWJsZWQiLCJ0eXBlIiwic3JjRXZlbnQiLCJwb2ludGVyVHlwZSIsInRhcmdldCIsImJ1dHRvbiIsIndoaWNoIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsaUJBQVIsUUFBZ0MsY0FBaEM7O0lBRU9DLFksR0FBZ0JELGlCLENBQWhCQyxZOztBQUNQLElBQU1DLGtCQUFrQixhQUF4QjtBQUNBLElBQU1DLG1CQUFtQixjQUF6Qjs7QUFFQTs7Ozs7Ozs7O0lBUXFCQyxTO0FBRW5CLHFCQUFZQyxPQUFaLEVBQXFCQyxRQUFyQixFQUE2QztBQUFBOztBQUFBLFFBQWRDLE9BQWMsdUVBQUosRUFBSTs7QUFBQTs7QUFDM0MsU0FBS0YsT0FBTCxHQUFlQSxPQUFmO0FBQ0EsU0FBS0MsUUFBTCxHQUFnQkEsUUFBaEI7QUFDQSxTQUFLRSxPQUFMLEdBQWUsS0FBZjs7QUFFQSxTQUFLRCxPQUFMLEdBQWVFLE9BQU9DLE1BQVAsQ0FBYyxFQUFDQyxRQUFRLElBQVQsRUFBZCxFQUE4QkosT0FBOUIsQ0FBZjtBQUNBLFNBQUtLLGVBQUwsR0FBdUIsS0FBS0wsT0FBTCxDQUFhSSxNQUFwQztBQUNBLFNBQUtFLGdCQUFMLEdBQXdCLEtBQUtOLE9BQUwsQ0FBYUksTUFBckM7O0FBRUEsU0FBS0csTUFBTCxHQUFjYixhQUFhYyxNQUFiLENBQW9CUixRQUFRTyxNQUFSLElBQWtCLEVBQXRDLENBQWQ7O0FBRUEsU0FBS0UsV0FBTCxHQUFtQixLQUFLQSxXQUFMLENBQWlCQyxJQUFqQixDQUFzQixJQUF0QixDQUFuQjtBQUNBLFNBQUtILE1BQUwsQ0FBWUksT0FBWixDQUFvQjtBQUFBLGFBQVNiLFFBQVFjLGdCQUFSLENBQXlCQyxLQUF6QixFQUFnQyxNQUFLSixXQUFyQyxDQUFUO0FBQUEsS0FBcEI7QUFDRDs7Ozs4QkFFUztBQUFBOztBQUNSLFdBQUtGLE1BQUwsQ0FBWUksT0FBWixDQUFvQjtBQUFBLGVBQVMsT0FBS2IsT0FBTCxDQUFhZ0IsbUJBQWIsQ0FBaUNELEtBQWpDLEVBQXdDLE9BQUtKLFdBQTdDLENBQVQ7QUFBQSxPQUFwQjtBQUNEOztBQUVEOzs7Ozs7O29DQUlnQk0sUyxFQUFXQyxPLEVBQVM7QUFDbEMsVUFBSUQsY0FBY3BCLGVBQWxCLEVBQW1DO0FBQ2pDLGFBQUtVLGVBQUwsR0FBdUJXLE9BQXZCO0FBQ0Q7QUFDRCxVQUFJRCxjQUFjbkIsZ0JBQWxCLEVBQW9DO0FBQ2xDLGFBQUtVLGdCQUFMLEdBQXdCVSxPQUF4QjtBQUNEO0FBQ0Y7OztnQ0FFV0gsSyxFQUFPO0FBQ2pCLFVBQUksS0FBS1AsZ0JBQVQsRUFBMkI7QUFDekIsWUFBSU8sTUFBTUksSUFBTixLQUFlLFlBQW5CLEVBQWlDO0FBQy9CLGVBQUtsQixRQUFMLENBQWM7QUFDWmtCLGtCQUFNckIsZ0JBRE07QUFFWnNCLHNCQUFVTCxLQUZFO0FBR1pNLHlCQUFhLE9BSEQ7QUFJWkMsb0JBQVFQLE1BQU1PO0FBSkYsV0FBZDtBQU1EO0FBQ0Y7O0FBRUQsVUFBSSxLQUFLZixlQUFULEVBQTBCO0FBQ3hCLGdCQUFRUSxNQUFNSSxJQUFkO0FBQ0EsZUFBSyxXQUFMO0FBQ0UsZ0JBQUlKLE1BQU1RLE1BQU4sSUFBZ0IsQ0FBcEIsRUFBdUI7QUFDckI7QUFDQSxtQkFBS3BCLE9BQUwsR0FBZSxJQUFmO0FBQ0Q7QUFDRDtBQUNGLGVBQUssV0FBTDtBQUNFO0FBQ0EsZ0JBQUlZLE1BQU1TLEtBQU4sS0FBZ0IsQ0FBcEIsRUFBdUI7QUFDckI7QUFDQSxtQkFBS3JCLE9BQUwsR0FBZSxLQUFmO0FBQ0Q7QUFDRCxnQkFBSSxDQUFDLEtBQUtBLE9BQVYsRUFBbUI7QUFDakI7QUFDQTtBQUNBLG1CQUFLRixRQUFMLENBQWM7QUFDWmtCLHNCQUFNdEIsZUFETTtBQUVadUIsMEJBQVVMLEtBRkU7QUFHWk0sNkJBQWEsT0FIRDtBQUlaQyx3QkFBUVAsTUFBTU87QUFKRixlQUFkO0FBTUQ7QUFDRDtBQUNGLGVBQUssU0FBTDtBQUNFLGlCQUFLbkIsT0FBTCxHQUFlLEtBQWY7QUFDQTtBQUNGO0FBM0JBO0FBNkJEO0FBRUY7Ozs7OztlQTlFa0JKLFMiLCJmaWxlIjoibW92ZS1pbnB1dC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7SU5QVVRfRVZFTlRfVFlQRVN9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNvbnN0IHtNT1VTRV9FVkVOVFN9ID0gSU5QVVRfRVZFTlRfVFlQRVM7XG5jb25zdCBNT1ZFX0VWRU5UX1RZUEUgPSAncG9pbnRlcm1vdmUnO1xuY29uc3QgTEVBVkVfRVZFTlRfVFlQRSA9ICdwb2ludGVybGVhdmUnO1xuXG4vKipcbiAqIEhhbW1lci5qcyBzd2FsbG93cyAnbW92ZScgZXZlbnRzIChmb3IgcG9pbnRlci90b3VjaC9tb3VzZSlcbiAqIHdoZW4gdGhlIHBvaW50ZXIgaXMgbm90IGRvd24uIFRoaXMgY2xhc3Mgc2V0cyB1cCBhIGhhbmRsZXJcbiAqIHNwZWNpZmljYWxseSBmb3IgdGhlc2UgZXZlbnRzIHRvIHdvcmsgYXJvdW5kIHRoaXMgbGltaXRhdGlvbi5cbiAqIE5vdGUgdGhhdCB0aGlzIGNvdWxkIGJlIGV4dGVuZGVkIHRvIG1vcmUgaW50ZWxsaWdlbnRseSBoYW5kbGVcbiAqIG1vdmUgZXZlbnRzIGFjcm9zcyBpbnB1dCB0eXBlcywgZS5nLiBzdG9yaW5nIG11bHRpcGxlIHNpbXVsdGFuZW91c1xuICogcG9pbnRlci90b3VjaCBldmVudHMsIGNhbGN1bGF0aW5nIHNwZWVkL2RpcmVjdGlvbiwgZXRjLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZlSW5wdXQge1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIGNhbGxiYWNrLCBvcHRpb25zID0ge30pIHtcbiAgICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcblxuICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe2VuYWJsZTogdHJ1ZX0sIG9wdGlvbnMpO1xuICAgIHRoaXMuZW5hYmxlTW92ZUV2ZW50ID0gdGhpcy5vcHRpb25zLmVuYWJsZTtcbiAgICB0aGlzLmVuYWJsZUxlYXZlRXZlbnQgPSB0aGlzLm9wdGlvbnMuZW5hYmxlO1xuXG4gICAgdGhpcy5ldmVudHMgPSBNT1VTRV9FVkVOVFMuY29uY2F0KG9wdGlvbnMuZXZlbnRzIHx8IFtdKTtcblxuICAgIHRoaXMuaGFuZGxlRXZlbnQgPSB0aGlzLmhhbmRsZUV2ZW50LmJpbmQodGhpcyk7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaChldmVudCA9PiBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIHRoaXMuaGFuZGxlRXZlbnQpKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5ldmVudHMuZm9yRWFjaChldmVudCA9PiB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgdGhpcy5oYW5kbGVFdmVudCkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEVuYWJsZSB0aGlzIGlucHV0IChiZWdpbiBwcm9jZXNzaW5nIGV2ZW50cylcbiAgICogaWYgdGhlIHNwZWNpZmllZCBldmVudCB0eXBlIGlzIGFtb25nIHRob3NlIGhhbmRsZWQgYnkgdGhpcyBpbnB1dC5cbiAgICovXG4gIGVuYWJsZUV2ZW50VHlwZShldmVudFR5cGUsIGVuYWJsZWQpIHtcbiAgICBpZiAoZXZlbnRUeXBlID09PSBNT1ZFX0VWRU5UX1RZUEUpIHtcbiAgICAgIHRoaXMuZW5hYmxlTW92ZUV2ZW50ID0gZW5hYmxlZDtcbiAgICB9XG4gICAgaWYgKGV2ZW50VHlwZSA9PT0gTEVBVkVfRVZFTlRfVFlQRSkge1xuICAgICAgdGhpcy5lbmFibGVMZWF2ZUV2ZW50ID0gZW5hYmxlZDtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVFdmVudChldmVudCkge1xuICAgIGlmICh0aGlzLmVuYWJsZUxlYXZlRXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50eXBlID09PSAnbW91c2VsZWF2ZScpIHtcbiAgICAgICAgdGhpcy5jYWxsYmFjayh7XG4gICAgICAgICAgdHlwZTogTEVBVkVfRVZFTlRfVFlQRSxcbiAgICAgICAgICBzcmNFdmVudDogZXZlbnQsXG4gICAgICAgICAgcG9pbnRlclR5cGU6ICdtb3VzZScsXG4gICAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXRcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZW5hYmxlTW92ZUV2ZW50KSB7XG4gICAgICBzd2l0Y2ggKGV2ZW50LnR5cGUpIHtcbiAgICAgIGNhc2UgJ21vdXNlZG93bic6XG4gICAgICAgIGlmIChldmVudC5idXR0b24gPj0gMCkge1xuICAgICAgICAgIC8vIEJ1dHRvbiBpcyBkb3duXG4gICAgICAgICAgdGhpcy5wcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21vdXNlbW92ZSc6XG4gICAgICAgIC8vIE1vdmUgZXZlbnRzIHVzZSBgd2hpY2hgIHRvIHRyYWNrIHRoZSBidXR0b24gYmVpbmcgcHJlc3NlZFxuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDApIHtcbiAgICAgICAgICAvLyBCdXR0b24gaXMgbm90IGRvd25cbiAgICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMucHJlc3NlZCkge1xuICAgICAgICAgIC8vIERyYWcgZXZlbnRzIGFyZSBlbWl0dGVkIGJ5IGhhbW1lciBhbHJlYWR5XG4gICAgICAgICAgLy8gd2UganVzdCBuZWVkIHRvIGVtaXQgdGhlIG1vdmUgZXZlbnQgb24gaG92ZXJcbiAgICAgICAgICB0aGlzLmNhbGxiYWNrKHtcbiAgICAgICAgICAgIHR5cGU6IE1PVkVfRVZFTlRfVFlQRSxcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldmVudCxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiAnbW91c2UnLFxuICAgICAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ21vdXNldXAnOlxuICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgfVxuICAgIH1cblxuICB9XG59XG4iXX0=