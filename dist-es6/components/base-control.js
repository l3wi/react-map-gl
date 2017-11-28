var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// Copyright (c) 2015 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
import { Component } from 'react';
import PropTypes from 'prop-types';
import WebMercatorViewport from 'viewport-mercator-project';

var propTypes = {
  /** Event handling */
  captureScroll: PropTypes.bool,
  // Stop map pan & rotate
  captureDrag: PropTypes.bool,
  // Stop map click
  captureClick: PropTypes.bool,
  // Stop map double click
  captureDoubleClick: PropTypes.bool
};

var defaultProps = {
  captureScroll: false,
  captureDrag: true,
  captureClick: true,
  captureDoubleClick: true
};

var contextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

/*
 * PureComponent doesn't update when context changes.
 * The only way is to implement our own shouldComponentUpdate here. Considering
 * the parent component (StaticMap or InteractiveMap) is pure, and map re-render
 * is almost always triggered by a viewport change, we almost definitely need to
 * recalculate the marker's position when the parent re-renders.
 */

var BaseControl = function (_Component) {
  _inherits(BaseControl, _Component);

  function BaseControl(props) {
    _classCallCheck(this, BaseControl);

    var _this = _possibleConstructorReturn(this, (BaseControl.__proto__ || Object.getPrototypeOf(BaseControl)).call(this, props));

    _this._onContainerLoad = _this._onContainerLoad.bind(_this);
    _this._onEvent = _this._onEvent.bind(_this);
    return _this;
  }

  _createClass(BaseControl, [{
    key: '_onContainerLoad',
    value: function _onContainerLoad(ref) {
      var events = {
        wheel: this._onEvent,
        panstart: this._onEvent,
        click: this._onEvent,
        dblclick: this._onEvent
      };

      if (ref) {
        this.context.eventManager.on(events, ref);
      } else {
        this.context.eventManager.off(events);
      }
    }
  }, {
    key: '_onEvent',
    value: function _onEvent(event) {
      var stopPropagation = void 0;
      switch (event.type) {
        case 'wheel':
          stopPropagation = this.props.captureScroll;
          break;
        case 'panstart':
          stopPropagation = this.props.captureDrag;
          break;
        case 'click':
          stopPropagation = this.props.captureClick;
          break;
        case 'dblclick':
          stopPropagation = this.props.captureDoubleClick;
          break;
        default:
      }

      if (stopPropagation) {
        event.stopPropagation();
      }
    }
  }, {
    key: 'render',
    value: function render() {
      return null;
    }
  }]);

  return BaseControl;
}(Component);

export default BaseControl;


BaseControl.propTypes = propTypes;
BaseControl.defaultProps = defaultProps;
BaseControl.contextTypes = contextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2Jhc2UtY29udHJvbC5qcyJdLCJuYW1lcyI6WyJDb21wb25lbnQiLCJQcm9wVHlwZXMiLCJXZWJNZXJjYXRvclZpZXdwb3J0IiwicHJvcFR5cGVzIiwiY2FwdHVyZVNjcm9sbCIsImJvb2wiLCJjYXB0dXJlRHJhZyIsImNhcHR1cmVDbGljayIsImNhcHR1cmVEb3VibGVDbGljayIsImRlZmF1bHRQcm9wcyIsImNvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiaW5zdGFuY2VPZiIsImlzRHJhZ2dpbmciLCJldmVudE1hbmFnZXIiLCJvYmplY3QiLCJCYXNlQ29udHJvbCIsInByb3BzIiwiX29uQ29udGFpbmVyTG9hZCIsImJpbmQiLCJfb25FdmVudCIsInJlZiIsImV2ZW50cyIsIndoZWVsIiwicGFuc3RhcnQiLCJjbGljayIsImRibGNsaWNrIiwiY29udGV4dCIsIm9uIiwib2ZmIiwiZXZlbnQiLCJzdG9wUHJvcGFnYXRpb24iLCJ0eXBlIl0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUUEsU0FBUixRQUF3QixPQUF4QjtBQUNBLE9BQU9DLFNBQVAsTUFBc0IsWUFBdEI7QUFDQSxPQUFPQyxtQkFBUCxNQUFnQywyQkFBaEM7O0FBRUEsSUFBTUMsWUFBWTtBQUNoQjtBQUNBQyxpQkFBZUgsVUFBVUksSUFGVDtBQUdoQjtBQUNBQyxlQUFhTCxVQUFVSSxJQUpQO0FBS2hCO0FBQ0FFLGdCQUFjTixVQUFVSSxJQU5SO0FBT2hCO0FBQ0FHLHNCQUFvQlAsVUFBVUk7QUFSZCxDQUFsQjs7QUFXQSxJQUFNSSxlQUFlO0FBQ25CTCxpQkFBZSxLQURJO0FBRW5CRSxlQUFhLElBRk07QUFHbkJDLGdCQUFjLElBSEs7QUFJbkJDLHNCQUFvQjtBQUpELENBQXJCOztBQU9BLElBQU1FLGVBQWU7QUFDbkJDLFlBQVVWLFVBQVVXLFVBQVYsQ0FBcUJWLG1CQUFyQixDQURTO0FBRW5CVyxjQUFZWixVQUFVSSxJQUZIO0FBR25CUyxnQkFBY2IsVUFBVWM7QUFITCxDQUFyQjs7QUFNQTs7Ozs7Ozs7SUFPcUJDLFc7OztBQUVuQix1QkFBWUMsS0FBWixFQUFtQjtBQUFBOztBQUFBLDBIQUNYQSxLQURXOztBQUdqQixVQUFLQyxnQkFBTCxHQUF3QixNQUFLQSxnQkFBTCxDQUFzQkMsSUFBdEIsT0FBeEI7QUFDQSxVQUFLQyxRQUFMLEdBQWdCLE1BQUtBLFFBQUwsQ0FBY0QsSUFBZCxPQUFoQjtBQUppQjtBQUtsQjs7OztxQ0FFZ0JFLEcsRUFBSztBQUNwQixVQUFNQyxTQUFTO0FBQ2JDLGVBQU8sS0FBS0gsUUFEQztBQUViSSxrQkFBVSxLQUFLSixRQUZGO0FBR2JLLGVBQU8sS0FBS0wsUUFIQztBQUliTSxrQkFBVSxLQUFLTjtBQUpGLE9BQWY7O0FBT0EsVUFBSUMsR0FBSixFQUFTO0FBQ1AsYUFBS00sT0FBTCxDQUFhYixZQUFiLENBQTBCYyxFQUExQixDQUE2Qk4sTUFBN0IsRUFBcUNELEdBQXJDO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsYUFBS00sT0FBTCxDQUFhYixZQUFiLENBQTBCZSxHQUExQixDQUE4QlAsTUFBOUI7QUFDRDtBQUNGOzs7NkJBRVFRLEssRUFBTztBQUNkLFVBQUlDLHdCQUFKO0FBQ0EsY0FBUUQsTUFBTUUsSUFBZDtBQUNBLGFBQUssT0FBTDtBQUNFRCw0QkFBa0IsS0FBS2QsS0FBTCxDQUFXYixhQUE3QjtBQUNBO0FBQ0YsYUFBSyxVQUFMO0FBQ0UyQiw0QkFBa0IsS0FBS2QsS0FBTCxDQUFXWCxXQUE3QjtBQUNBO0FBQ0YsYUFBSyxPQUFMO0FBQ0V5Qiw0QkFBa0IsS0FBS2QsS0FBTCxDQUFXVixZQUE3QjtBQUNBO0FBQ0YsYUFBSyxVQUFMO0FBQ0V3Qiw0QkFBa0IsS0FBS2QsS0FBTCxDQUFXVCxrQkFBN0I7QUFDQTtBQUNGO0FBYkE7O0FBZ0JBLFVBQUl1QixlQUFKLEVBQXFCO0FBQ25CRCxjQUFNQyxlQUFOO0FBQ0Q7QUFDRjs7OzZCQUVRO0FBQ1AsYUFBTyxJQUFQO0FBQ0Q7Ozs7RUFqRHNDL0IsUzs7ZUFBcEJnQixXOzs7QUFxRHJCQSxZQUFZYixTQUFaLEdBQXdCQSxTQUF4QjtBQUNBYSxZQUFZUCxZQUFaLEdBQTJCQSxZQUEzQjtBQUNBTyxZQUFZTixZQUFaLEdBQTJCQSxZQUEzQiIsImZpbGUiOiJiYXNlLWNvbnRyb2wuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvKiogRXZlbnQgaGFuZGxpbmcgKi9cbiAgY2FwdHVyZVNjcm9sbDogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIHBhbiAmIHJvdGF0ZVxuICBjYXB0dXJlRHJhZzogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGNsaWNrXG4gIGNhcHR1cmVDbGljazogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFN0b3AgbWFwIGRvdWJsZSBjbGlja1xuICBjYXB0dXJlRG91YmxlQ2xpY2s6IFByb3BUeXBlcy5ib29sXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNhcHR1cmVTY3JvbGw6IGZhbHNlLFxuICBjYXB0dXJlRHJhZzogdHJ1ZSxcbiAgY2FwdHVyZUNsaWNrOiB0cnVlLFxuICBjYXB0dXJlRG91YmxlQ2xpY2s6IHRydWVcbn07XG5cbmNvbnN0IGNvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59O1xuXG4vKlxuICogUHVyZUNvbXBvbmVudCBkb2Vzbid0IHVwZGF0ZSB3aGVuIGNvbnRleHQgY2hhbmdlcy5cbiAqIFRoZSBvbmx5IHdheSBpcyB0byBpbXBsZW1lbnQgb3VyIG93biBzaG91bGRDb21wb25lbnRVcGRhdGUgaGVyZS4gQ29uc2lkZXJpbmdcbiAqIHRoZSBwYXJlbnQgY29tcG9uZW50IChTdGF0aWNNYXAgb3IgSW50ZXJhY3RpdmVNYXApIGlzIHB1cmUsIGFuZCBtYXAgcmUtcmVuZGVyXG4gKiBpcyBhbG1vc3QgYWx3YXlzIHRyaWdnZXJlZCBieSBhIHZpZXdwb3J0IGNoYW5nZSwgd2UgYWxtb3N0IGRlZmluaXRlbHkgbmVlZCB0b1xuICogcmVjYWxjdWxhdGUgdGhlIG1hcmtlcidzIHBvc2l0aW9uIHdoZW4gdGhlIHBhcmVudCByZS1yZW5kZXJzLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCYXNlQ29udHJvbCBleHRlbmRzIENvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG5cbiAgICB0aGlzLl9vbkNvbnRhaW5lckxvYWQgPSB0aGlzLl9vbkNvbnRhaW5lckxvYWQuYmluZCh0aGlzKTtcbiAgICB0aGlzLl9vbkV2ZW50ID0gdGhpcy5fb25FdmVudC5iaW5kKHRoaXMpO1xuICB9XG5cbiAgX29uQ29udGFpbmVyTG9hZChyZWYpIHtcbiAgICBjb25zdCBldmVudHMgPSB7XG4gICAgICB3aGVlbDogdGhpcy5fb25FdmVudCxcbiAgICAgIHBhbnN0YXJ0OiB0aGlzLl9vbkV2ZW50LFxuICAgICAgY2xpY2s6IHRoaXMuX29uRXZlbnQsXG4gICAgICBkYmxjbGljazogdGhpcy5fb25FdmVudFxuICAgIH07XG5cbiAgICBpZiAocmVmKSB7XG4gICAgICB0aGlzLmNvbnRleHQuZXZlbnRNYW5hZ2VyLm9uKGV2ZW50cywgcmVmKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jb250ZXh0LmV2ZW50TWFuYWdlci5vZmYoZXZlbnRzKTtcbiAgICB9XG4gIH1cblxuICBfb25FdmVudChldmVudCkge1xuICAgIGxldCBzdG9wUHJvcGFnYXRpb247XG4gICAgc3dpdGNoIChldmVudC50eXBlKSB7XG4gICAgY2FzZSAnd2hlZWwnOlxuICAgICAgc3RvcFByb3BhZ2F0aW9uID0gdGhpcy5wcm9wcy5jYXB0dXJlU2Nyb2xsO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncGFuc3RhcnQnOlxuICAgICAgc3RvcFByb3BhZ2F0aW9uID0gdGhpcy5wcm9wcy5jYXB0dXJlRHJhZztcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NsaWNrJzpcbiAgICAgIHN0b3BQcm9wYWdhdGlvbiA9IHRoaXMucHJvcHMuY2FwdHVyZUNsaWNrO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZGJsY2xpY2snOlxuICAgICAgc3RvcFByb3BhZ2F0aW9uID0gdGhpcy5wcm9wcy5jYXB0dXJlRG91YmxlQ2xpY2s7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgIH1cblxuICAgIGlmIChzdG9wUHJvcGFnYXRpb24pIHtcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgIH1cbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG59XG5cbkJhc2VDb250cm9sLnByb3BUeXBlcyA9IHByb3BUeXBlcztcbkJhc2VDb250cm9sLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbkJhc2VDb250cm9sLmNvbnRleHRUeXBlcyA9IGNvbnRleHRUeXBlcztcbiJdfQ==