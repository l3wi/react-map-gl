'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.enhancePointerEventInput = enhancePointerEventInput;
exports.enhanceMouseInput = enhanceMouseInput;
/**
 * This file contains overrides the default
 * hammer.js functions to add our own utility
 */

/* Hammer.js constants */
var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var MOUSE_INPUT_MAP = {
  mousedown: INPUT_START,
  mousemove: INPUT_MOVE,
  mouseup: INPUT_END
};

/**
 * Helper function that returns true if any element in an array meets given criteria.
 * Because older browsers do not support `Array.prototype.some`
 * @params array {Array}
 * @params predict {Function}
 */
function some(array, predict) {
  for (var i = 0; i < array.length; i++) {
    if (predict(array[i])) {
      return true;
    }
  }
  return false;
}

/* eslint-disable no-invalid-this */
function enhancePointerEventInput(PointerEventInput) {
  var oldHandler = PointerEventInput.prototype.handler;

  // overrides PointerEventInput.handler to accept right mouse button
  PointerEventInput.prototype.handler = function handler(ev) {
    var store = this.store;

    // Allow non-left mouse buttons through
    if (ev.button > 0) {
      if (!some(store, function (e) {
        return e.pointerId === ev.pointerId;
      })) {
        store.push(ev);
      }
    }

    oldHandler.call(this, ev);
  };
}

// overrides MouseInput.handler to accept right mouse button
function enhanceMouseInput(MouseInput) {
  MouseInput.prototype.handler = function handler(ev) {
    var eventType = MOUSE_INPUT_MAP[ev.type];

    // on start we want to have the mouse button down
    if (eventType & INPUT_START && ev.button >= 0) {
      this.pressed = true;
    }

    if (eventType & INPUT_MOVE && ev.which === 0) {
      eventType = INPUT_END;
    }

    // mouse must be down
    if (!this.pressed) {
      return;
    }

    if (eventType & INPUT_END) {
      this.pressed = false;
    }

    this.callback(this.manager, eventType, {
      pointers: [ev],
      changedPointers: [ev],
      pointerType: 'mouse',
      srcEvent: ev
    });
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9oYW1tZXItb3ZlcnJpZGVzLmpzIl0sIm5hbWVzIjpbImVuaGFuY2VQb2ludGVyRXZlbnRJbnB1dCIsImVuaGFuY2VNb3VzZUlucHV0IiwiSU5QVVRfU1RBUlQiLCJJTlBVVF9NT1ZFIiwiSU5QVVRfRU5EIiwiTU9VU0VfSU5QVVRfTUFQIiwibW91c2Vkb3duIiwibW91c2Vtb3ZlIiwibW91c2V1cCIsInNvbWUiLCJhcnJheSIsInByZWRpY3QiLCJpIiwibGVuZ3RoIiwiUG9pbnRlckV2ZW50SW5wdXQiLCJvbGRIYW5kbGVyIiwicHJvdG90eXBlIiwiaGFuZGxlciIsImV2Iiwic3RvcmUiLCJidXR0b24iLCJlIiwicG9pbnRlcklkIiwicHVzaCIsImNhbGwiLCJNb3VzZUlucHV0IiwiZXZlbnRUeXBlIiwidHlwZSIsInByZXNzZWQiLCJ3aGljaCIsImNhbGxiYWNrIiwibWFuYWdlciIsInBvaW50ZXJzIiwiY2hhbmdlZFBvaW50ZXJzIiwicG9pbnRlclR5cGUiLCJzcmNFdmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7UUErQmdCLEEsMkIsQUFBQTtRLEFBbUJBLG9CLEFBQUE7QUFsRGhCOzs7OztBQUtBO0FBQ0EsSUFBTSxjQUFOLEFBQW9CO0FBQ3BCLElBQU0sYUFBTixBQUFtQjtBQUNuQixJQUFNLFlBQU4sQUFBa0I7QUFDbEIsSUFBTTthQUFrQixBQUNYLEFBQ1g7YUFGc0IsQUFFWCxBQUNYO1dBSEYsQUFBd0IsQUFHYjtBQUhhLEFBQ3RCOztBQUtGOzs7Ozs7QUFNQSxTQUFBLEFBQVMsS0FBVCxBQUFjLE9BQWQsQUFBcUIsU0FBUyxBQUM1QjtPQUFLLElBQUksSUFBVCxBQUFhLEdBQUcsSUFBSSxNQUFwQixBQUEwQixRQUExQixBQUFrQyxLQUFLLEFBQ3JDO1FBQUksUUFBUSxNQUFaLEFBQUksQUFBUSxBQUFNLEtBQUssQUFDckI7YUFBQSxBQUFPLEFBQ1I7QUFDRjtBQUNEO1NBQUEsQUFBTyxBQUNSOzs7QUFFRDtBQUNPLFNBQUEsQUFBUyx5QkFBVCxBQUFrQyxtQkFBbUIsQUFDMUQ7TUFBTSxhQUFhLGtCQUFBLEFBQWtCLFVBQXJDLEFBQStDLEFBRS9DOztBQUNBO29CQUFBLEFBQWtCLFVBQWxCLEFBQTRCLFVBQVUsU0FBQSxBQUFTLFFBQVQsQUFBaUIsSUFBSSxBQUN6RDtRQUFNLFFBQVEsS0FBZCxBQUFtQixBQUVuQjs7QUFDQTtRQUFJLEdBQUEsQUFBRyxTQUFQLEFBQWdCLEdBQUcsQUFDakI7VUFBSSxNQUFDLEFBQUssT0FBTyxhQUFBO2VBQUssRUFBQSxBQUFFLGNBQWMsR0FBckIsQUFBd0I7QUFBekMsQUFBSyxPQUFBLEdBQWdELEFBQ25EO2NBQUEsQUFBTSxLQUFOLEFBQVcsQUFDWjtBQUNGO0FBRUQ7O2VBQUEsQUFBVyxLQUFYLEFBQWdCLE1BQWhCLEFBQXNCLEFBQ3ZCO0FBWEQsQUFZRDs7O0FBRUQ7QUFDTyxTQUFBLEFBQVMsa0JBQVQsQUFBMkIsWUFBWSxBQUM1QzthQUFBLEFBQVcsVUFBWCxBQUFxQixVQUFVLFNBQUEsQUFBUyxRQUFULEFBQWlCLElBQUksQUFDbEQ7UUFBSSxZQUFZLGdCQUFnQixHQUFoQyxBQUFnQixBQUFtQixBQUVuQzs7QUFDQTtRQUFJLFlBQUEsQUFBWSxlQUFlLEdBQUEsQUFBRyxVQUFsQyxBQUE0QyxHQUFHLEFBQzdDO1dBQUEsQUFBSyxVQUFMLEFBQWUsQUFDaEI7QUFFRDs7UUFBSSxZQUFBLEFBQVksY0FBYyxHQUFBLEFBQUcsVUFBakMsQUFBMkMsR0FBRyxBQUM1QztrQkFBQSxBQUFZLEFBQ2I7QUFFRDs7QUFDQTtRQUFJLENBQUMsS0FBTCxBQUFVLFNBQVMsQUFDakI7QUFDRDtBQUVEOztRQUFJLFlBQUosQUFBZ0IsV0FBVyxBQUN6QjtXQUFBLEFBQUssVUFBTCxBQUFlLEFBQ2hCO0FBRUQ7O1NBQUEsQUFBSyxTQUFTLEtBQWQsQUFBbUIsU0FBbkIsQUFBNEI7Z0JBQ2hCLENBRDJCLEFBQzNCLEFBQUMsQUFDWDt1QkFBaUIsQ0FGb0IsQUFFcEIsQUFBQyxBQUNsQjttQkFIcUMsQUFHeEIsQUFDYjtnQkFKRixBQUF1QyxBQUkzQixBQUViO0FBTndDLEFBQ3JDO0FBdEJKLEFBNEJEIiwiZmlsZSI6ImhhbW1lci1vdmVycmlkZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgZmlsZSBjb250YWlucyBvdmVycmlkZXMgdGhlIGRlZmF1bHRcbiAqIGhhbW1lci5qcyBmdW5jdGlvbnMgdG8gYWRkIG91ciBvd24gdXRpbGl0eVxuICovXG5cbi8qIEhhbW1lci5qcyBjb25zdGFudHMgKi9cbmNvbnN0IElOUFVUX1NUQVJUID0gMTtcbmNvbnN0IElOUFVUX01PVkUgPSAyO1xuY29uc3QgSU5QVVRfRU5EID0gNDtcbmNvbnN0IE1PVVNFX0lOUFVUX01BUCA9IHtcbiAgbW91c2Vkb3duOiBJTlBVVF9TVEFSVCxcbiAgbW91c2Vtb3ZlOiBJTlBVVF9NT1ZFLFxuICBtb3VzZXVwOiBJTlBVVF9FTkRcbn07XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0cnVlIGlmIGFueSBlbGVtZW50IGluIGFuIGFycmF5IG1lZXRzIGdpdmVuIGNyaXRlcmlhLlxuICogQmVjYXVzZSBvbGRlciBicm93c2VycyBkbyBub3Qgc3VwcG9ydCBgQXJyYXkucHJvdG90eXBlLnNvbWVgXG4gKiBAcGFyYW1zIGFycmF5IHtBcnJheX1cbiAqIEBwYXJhbXMgcHJlZGljdCB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIHNvbWUoYXJyYXksIHByZWRpY3QpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChwcmVkaWN0KGFycmF5W2ldKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyogZXNsaW50LWRpc2FibGUgbm8taW52YWxpZC10aGlzICovXG5leHBvcnQgZnVuY3Rpb24gZW5oYW5jZVBvaW50ZXJFdmVudElucHV0KFBvaW50ZXJFdmVudElucHV0KSB7XG4gIGNvbnN0IG9sZEhhbmRsZXIgPSBQb2ludGVyRXZlbnRJbnB1dC5wcm90b3R5cGUuaGFuZGxlcjtcblxuICAvLyBvdmVycmlkZXMgUG9pbnRlckV2ZW50SW5wdXQuaGFuZGxlciB0byBhY2NlcHQgcmlnaHQgbW91c2UgYnV0dG9uXG4gIFBvaW50ZXJFdmVudElucHV0LnByb3RvdHlwZS5oYW5kbGVyID0gZnVuY3Rpb24gaGFuZGxlcihldikge1xuICAgIGNvbnN0IHN0b3JlID0gdGhpcy5zdG9yZTtcblxuICAgIC8vIEFsbG93IG5vbi1sZWZ0IG1vdXNlIGJ1dHRvbnMgdGhyb3VnaFxuICAgIGlmIChldi5idXR0b24gPiAwKSB7XG4gICAgICBpZiAoIXNvbWUoc3RvcmUsIGUgPT4gZS5wb2ludGVySWQgPT09IGV2LnBvaW50ZXJJZCkpIHtcbiAgICAgICAgc3RvcmUucHVzaChldik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgb2xkSGFuZGxlci5jYWxsKHRoaXMsIGV2KTtcbiAgfTtcbn1cblxuLy8gb3ZlcnJpZGVzIE1vdXNlSW5wdXQuaGFuZGxlciB0byBhY2NlcHQgcmlnaHQgbW91c2UgYnV0dG9uXG5leHBvcnQgZnVuY3Rpb24gZW5oYW5jZU1vdXNlSW5wdXQoTW91c2VJbnB1dCkge1xuICBNb3VzZUlucHV0LnByb3RvdHlwZS5oYW5kbGVyID0gZnVuY3Rpb24gaGFuZGxlcihldikge1xuICAgIGxldCBldmVudFR5cGUgPSBNT1VTRV9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAvLyBvbiBzdGFydCB3ZSB3YW50IHRvIGhhdmUgdGhlIG1vdXNlIGJ1dHRvbiBkb3duXG4gICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIGV2LmJ1dHRvbiA+PSAwKSB7XG4gICAgICB0aGlzLnByZXNzZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9NT1ZFICYmIGV2LndoaWNoID09PSAwKSB7XG4gICAgICBldmVudFR5cGUgPSBJTlBVVF9FTkQ7XG4gICAgfVxuXG4gICAgLy8gbW91c2UgbXVzdCBiZSBkb3duXG4gICAgaWYgKCF0aGlzLnByZXNzZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgZXZlbnRUeXBlLCB7XG4gICAgICBwb2ludGVyczogW2V2XSxcbiAgICAgIGNoYW5nZWRQb2ludGVyczogW2V2XSxcbiAgICAgIHBvaW50ZXJUeXBlOiAnbW91c2UnLFxuICAgICAgc3JjRXZlbnQ6IGV2XG4gICAgfSk7XG4gIH07XG59XG4iXX0=