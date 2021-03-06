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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy91dGlscy9oYW1tZXItb3ZlcnJpZGVzLmpzIl0sIm5hbWVzIjpbImVuaGFuY2VQb2ludGVyRXZlbnRJbnB1dCIsImVuaGFuY2VNb3VzZUlucHV0IiwiSU5QVVRfU1RBUlQiLCJJTlBVVF9NT1ZFIiwiSU5QVVRfRU5EIiwiTU9VU0VfSU5QVVRfTUFQIiwibW91c2Vkb3duIiwibW91c2Vtb3ZlIiwibW91c2V1cCIsInNvbWUiLCJhcnJheSIsInByZWRpY3QiLCJpIiwibGVuZ3RoIiwiUG9pbnRlckV2ZW50SW5wdXQiLCJvbGRIYW5kbGVyIiwicHJvdG90eXBlIiwiaGFuZGxlciIsImV2Iiwic3RvcmUiLCJidXR0b24iLCJlIiwicG9pbnRlcklkIiwicHVzaCIsImNhbGwiLCJNb3VzZUlucHV0IiwiZXZlbnRUeXBlIiwidHlwZSIsInByZXNzZWQiLCJ3aGljaCIsImNhbGxiYWNrIiwibWFuYWdlciIsInBvaW50ZXJzIiwiY2hhbmdlZFBvaW50ZXJzIiwicG9pbnRlclR5cGUiLCJzcmNFdmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7UUErQmdCQSx3QixHQUFBQSx3QjtRQW1CQUMsaUIsR0FBQUEsaUI7QUFsRGhCOzs7OztBQUtBO0FBQ0EsSUFBTUMsY0FBYyxDQUFwQjtBQUNBLElBQU1DLGFBQWEsQ0FBbkI7QUFDQSxJQUFNQyxZQUFZLENBQWxCO0FBQ0EsSUFBTUMsa0JBQWtCO0FBQ3RCQyxhQUFXSixXQURXO0FBRXRCSyxhQUFXSixVQUZXO0FBR3RCSyxXQUFTSjtBQUhhLENBQXhCOztBQU1BOzs7Ozs7QUFNQSxTQUFTSyxJQUFULENBQWNDLEtBQWQsRUFBcUJDLE9BQXJCLEVBQThCO0FBQzVCLE9BQUssSUFBSUMsSUFBSSxDQUFiLEVBQWdCQSxJQUFJRixNQUFNRyxNQUExQixFQUFrQ0QsR0FBbEMsRUFBdUM7QUFDckMsUUFBSUQsUUFBUUQsTUFBTUUsQ0FBTixDQUFSLENBQUosRUFBdUI7QUFDckIsYUFBTyxJQUFQO0FBQ0Q7QUFDRjtBQUNELFNBQU8sS0FBUDtBQUNEOztBQUVEO0FBQ08sU0FBU1osd0JBQVQsQ0FBa0NjLGlCQUFsQyxFQUFxRDtBQUMxRCxNQUFNQyxhQUFhRCxrQkFBa0JFLFNBQWxCLENBQTRCQyxPQUEvQzs7QUFFQTtBQUNBSCxvQkFBa0JFLFNBQWxCLENBQTRCQyxPQUE1QixHQUFzQyxTQUFTQSxPQUFULENBQWlCQyxFQUFqQixFQUFxQjtBQUN6RCxRQUFNQyxRQUFRLEtBQUtBLEtBQW5COztBQUVBO0FBQ0EsUUFBSUQsR0FBR0UsTUFBSCxHQUFZLENBQWhCLEVBQW1CO0FBQ2pCLFVBQUksQ0FBQ1gsS0FBS1UsS0FBTCxFQUFZO0FBQUEsZUFBS0UsRUFBRUMsU0FBRixLQUFnQkosR0FBR0ksU0FBeEI7QUFBQSxPQUFaLENBQUwsRUFBcUQ7QUFDbkRILGNBQU1JLElBQU4sQ0FBV0wsRUFBWDtBQUNEO0FBQ0Y7O0FBRURILGVBQVdTLElBQVgsQ0FBZ0IsSUFBaEIsRUFBc0JOLEVBQXRCO0FBQ0QsR0FYRDtBQVlEOztBQUVEO0FBQ08sU0FBU2pCLGlCQUFULENBQTJCd0IsVUFBM0IsRUFBdUM7QUFDNUNBLGFBQVdULFNBQVgsQ0FBcUJDLE9BQXJCLEdBQStCLFNBQVNBLE9BQVQsQ0FBaUJDLEVBQWpCLEVBQXFCO0FBQ2xELFFBQUlRLFlBQVlyQixnQkFBZ0JhLEdBQUdTLElBQW5CLENBQWhCOztBQUVBO0FBQ0EsUUFBSUQsWUFBWXhCLFdBQVosSUFBMkJnQixHQUFHRSxNQUFILElBQWEsQ0FBNUMsRUFBK0M7QUFDN0MsV0FBS1EsT0FBTCxHQUFlLElBQWY7QUFDRDs7QUFFRCxRQUFJRixZQUFZdkIsVUFBWixJQUEwQmUsR0FBR1csS0FBSCxLQUFhLENBQTNDLEVBQThDO0FBQzVDSCxrQkFBWXRCLFNBQVo7QUFDRDs7QUFFRDtBQUNBLFFBQUksQ0FBQyxLQUFLd0IsT0FBVixFQUFtQjtBQUNqQjtBQUNEOztBQUVELFFBQUlGLFlBQVl0QixTQUFoQixFQUEyQjtBQUN6QixXQUFLd0IsT0FBTCxHQUFlLEtBQWY7QUFDRDs7QUFFRCxTQUFLRSxRQUFMLENBQWMsS0FBS0MsT0FBbkIsRUFBNEJMLFNBQTVCLEVBQXVDO0FBQ3JDTSxnQkFBVSxDQUFDZCxFQUFELENBRDJCO0FBRXJDZSx1QkFBaUIsQ0FBQ2YsRUFBRCxDQUZvQjtBQUdyQ2dCLG1CQUFhLE9BSHdCO0FBSXJDQyxnQkFBVWpCO0FBSjJCLEtBQXZDO0FBTUQsR0EzQkQ7QUE0QkQiLCJmaWxlIjoiaGFtbWVyLW92ZXJyaWRlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogVGhpcyBmaWxlIGNvbnRhaW5zIG92ZXJyaWRlcyB0aGUgZGVmYXVsdFxuICogaGFtbWVyLmpzIGZ1bmN0aW9ucyB0byBhZGQgb3VyIG93biB1dGlsaXR5XG4gKi9cblxuLyogSGFtbWVyLmpzIGNvbnN0YW50cyAqL1xuY29uc3QgSU5QVVRfU1RBUlQgPSAxO1xuY29uc3QgSU5QVVRfTU9WRSA9IDI7XG5jb25zdCBJTlBVVF9FTkQgPSA0O1xuY29uc3QgTU9VU0VfSU5QVVRfTUFQID0ge1xuICBtb3VzZWRvd246IElOUFVUX1NUQVJULFxuICBtb3VzZW1vdmU6IElOUFVUX01PVkUsXG4gIG1vdXNldXA6IElOUFVUX0VORFxufTtcblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRydWUgaWYgYW55IGVsZW1lbnQgaW4gYW4gYXJyYXkgbWVldHMgZ2l2ZW4gY3JpdGVyaWEuXG4gKiBCZWNhdXNlIG9sZGVyIGJyb3dzZXJzIGRvIG5vdCBzdXBwb3J0IGBBcnJheS5wcm90b3R5cGUuc29tZWBcbiAqIEBwYXJhbXMgYXJyYXkge0FycmF5fVxuICogQHBhcmFtcyBwcmVkaWN0IHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gc29tZShhcnJheSwgcHJlZGljdCkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHByZWRpY3QoYXJyYXlbaV0pKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1pbnZhbGlkLXRoaXMgKi9cbmV4cG9ydCBmdW5jdGlvbiBlbmhhbmNlUG9pbnRlckV2ZW50SW5wdXQoUG9pbnRlckV2ZW50SW5wdXQpIHtcbiAgY29uc3Qgb2xkSGFuZGxlciA9IFBvaW50ZXJFdmVudElucHV0LnByb3RvdHlwZS5oYW5kbGVyO1xuXG4gIC8vIG92ZXJyaWRlcyBQb2ludGVyRXZlbnRJbnB1dC5oYW5kbGVyIHRvIGFjY2VwdCByaWdodCBtb3VzZSBidXR0b25cbiAgUG9pbnRlckV2ZW50SW5wdXQucHJvdG90eXBlLmhhbmRsZXIgPSBmdW5jdGlvbiBoYW5kbGVyKGV2KSB7XG4gICAgY29uc3Qgc3RvcmUgPSB0aGlzLnN0b3JlO1xuXG4gICAgLy8gQWxsb3cgbm9uLWxlZnQgbW91c2UgYnV0dG9ucyB0aHJvdWdoXG4gICAgaWYgKGV2LmJ1dHRvbiA+IDApIHtcbiAgICAgIGlmICghc29tZShzdG9yZSwgZSA9PiBlLnBvaW50ZXJJZCA9PT0gZXYucG9pbnRlcklkKSkge1xuICAgICAgICBzdG9yZS5wdXNoKGV2KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBvbGRIYW5kbGVyLmNhbGwodGhpcywgZXYpO1xuICB9O1xufVxuXG4vLyBvdmVycmlkZXMgTW91c2VJbnB1dC5oYW5kbGVyIHRvIGFjY2VwdCByaWdodCBtb3VzZSBidXR0b25cbmV4cG9ydCBmdW5jdGlvbiBlbmhhbmNlTW91c2VJbnB1dChNb3VzZUlucHV0KSB7XG4gIE1vdXNlSW5wdXQucHJvdG90eXBlLmhhbmRsZXIgPSBmdW5jdGlvbiBoYW5kbGVyKGV2KSB7XG4gICAgbGV0IGV2ZW50VHlwZSA9IE1PVVNFX0lOUFVUX01BUFtldi50eXBlXTtcblxuICAgIC8vIG9uIHN0YXJ0IHdlIHdhbnQgdG8gaGF2ZSB0aGUgbW91c2UgYnV0dG9uIGRvd25cbiAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfU1RBUlQgJiYgZXYuYnV0dG9uID49IDApIHtcbiAgICAgIHRoaXMucHJlc3NlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX01PVkUgJiYgZXYud2hpY2ggPT09IDApIHtcbiAgICAgIGV2ZW50VHlwZSA9IElOUFVUX0VORDtcbiAgICB9XG5cbiAgICAvLyBtb3VzZSBtdXN0IGJlIGRvd25cbiAgICBpZiAoIXRoaXMucHJlc3NlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcbiAgICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgIHBvaW50ZXJzOiBbZXZdLFxuICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxuICAgICAgcG9pbnRlclR5cGU6ICdtb3VzZScsXG4gICAgICBzcmNFdmVudDogZXZcbiAgICB9KTtcbiAgfTtcbn1cbiJdfQ==