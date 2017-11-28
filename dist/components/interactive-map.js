'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _react = require('react');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _autobind = require('../utils/autobind');

var _autobind2 = _interopRequireDefault(_autobind);

var _staticMap = require('./static-map');

var _staticMap2 = _interopRequireDefault(_staticMap);

var _mapState = require('../utils/map-state');

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _transitionManager = require('../utils/transition-manager');

var _transitionManager2 = _interopRequireDefault(_transitionManager);

var _index = require('../mjolnir.js/src/index.js');

var _mapControls = require('../utils/map-controls');

var _mapControls2 = _interopRequireDefault(_mapControls);

var _config = require('../config');

var _config2 = _interopRequireDefault(_config);

var _deprecateWarn = require('../utils/deprecate-warn');

var _deprecateWarn2 = _interopRequireDefault(_deprecateWarn);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var propTypes = (0, _assign2.default)({}, _staticMap2.default.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: _propTypes2.default.number,
  // Min zoom level
  minZoom: _propTypes2.default.number,
  // Max pitch in degrees
  maxPitch: _propTypes2.default.number,
  // Min pitch in degrees
  minPitch: _propTypes2.default.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: _propTypes2.default.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: _propTypes2.default.number,
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: _propTypes2.default.func,
  // type of interruption of current transition on update.
  transitionInterruption: _propTypes2.default.number,
  // easing function
  transitionEasing: _propTypes2.default.func,
  // transition status update functions
  onTransitionStart: _propTypes2.default.func,
  onTransitionInterrupt: _propTypes2.default.func,
  onTransitionEnd: _propTypes2.default.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: _propTypes2.default.bool,
  // Drag to pan
  dragPan: _propTypes2.default.bool,
  // Drag to rotate
  dragRotate: _propTypes2.default.bool,
  // Double click to zoom
  doubleClickZoom: _propTypes2.default.bool,
  // Pinch to zoom / rotate
  touchZoomRotate: _propTypes2.default.bool,
  // Keyboard
  keyboard: _propTypes2.default.bool,

  /**
   * Called when the map is hovered over.
   * @callback
   * @param {Object} event - The mouse event.
   * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
   * @param {Array} event.features - The features under the pointer, using Mapbox's
   * queryRenderedFeatures API:
   * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
   * To make a layer interactive, set the `interactive` property in the
   * layer style to `true`. See Mapbox's style spec
   * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
   */
  onHover: _propTypes2.default.func,
  /**
   * Called when the map is clicked.
   * @callback
   * @param {Object} event - The mouse event.
   * @param {[Number, Number]} event.lngLat - The coordinates of the pointer
   * @param {Array} event.features - The features under the pointer, using Mapbox's
   * queryRenderedFeatures API:
   * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
   * To make a layer interactive, set the `interactive` property in the
   * layer style to `true`. See Mapbox's style spec
   * https://www.mapbox.com/mapbox-gl-style-spec/#layer-interactive
   */
  onClick: _propTypes2.default.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: _propTypes2.default.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: _propTypes2.default.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: _propTypes2.default.shape({
    minZoom: _propTypes2.default.number,
    maxZoom: _propTypes2.default.number,
    minPitch: _propTypes2.default.number,
    maxPitch: _propTypes2.default.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: _propTypes2.default.shape({
    events: _propTypes2.default.arrayOf(_propTypes2.default.string),
    handleEvent: _propTypes2.default.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? _config2.default.CURSOR.GRABBING : isHovering ? _config2.default.CURSOR.POINTER : _config2.default.CURSOR.GRAB;
};

var defaultProps = (0, _assign2.default)({}, _staticMap2.default.defaultProps, _mapState.MAPBOX_LIMITS, _transitionManager2.default.defaultProps, {
  onViewportChange: null,
  onClick: null,
  onHover: null,

  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoomRotate: true,

  clickRadius: 0,
  getCursor: getDefaultCursor,

  visibilityConstraints: _mapState.MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default),
  isDragging: _propTypes2.default.bool,
  eventManager: _propTypes2.default.object
};

var InteractiveMap = function (_PureComponent) {
  (0, _inherits3.default)(InteractiveMap, _PureComponent);
  (0, _createClass3.default)(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return _staticMap2.default.supported();
    }
  }]);

  function InteractiveMap(props) {
    (0, _classCallCheck3.default)(this, InteractiveMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (InteractiveMap.__proto__ || (0, _getPrototypeOf2.default)(InteractiveMap)).call(this, props));

    (0, _autobind2.default)(_this);
    // Check for deprecated props
    (0, _deprecateWarn2.default)(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false

      // If props.mapControls is not provided, fallback to default MapControls instance
      // Cannot use defaultProps here because it needs to be per map instance
    };_this._mapControls = props.mapControls || new _mapControls2.default();

    // provide an eventManager stub until real eventManager created
    var eventManagerStub = {
      queue: [],
      on: function on(events, ref) {
        this.queue.push({ events: events, ref: ref, on: true });
      },
      off: function off(events) {
        this.queue.push({ events: events });
      },
      destroy: function destroy() {}
    };

    _this._eventManager = eventManagerStub;
    return _this;
  }

  (0, _createClass3.default)(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject2.default(this.props),
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventManager = new _index.EventManager(this._eventCanvas, {
        rightButton: true
      });

      // Register additional event handlers for click and hover
      eventManager.on('mousemove', this._onMouseMove);
      eventManager.on('click', this._onMouseClick);

      // run stub queued action
      this._eventManager.queue.forEach(function (_ref2) {
        var events = _ref2.events,
            ref = _ref2.ref,
            on = _ref2.on;

        if (on === true) {
          eventManager.on(events, ref);
        } else {
          eventManager.off(events);
        }
      });

      this._eventManager = eventManager;

      this._mapControls.setOptions((0, _assign2.default)({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new _transitionManager2.default(this.props);
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate(nextProps) {
      this._mapControls.setOptions(nextProps);
      this._transitionManager.processViewportChange(nextProps);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._eventManager) {
        // Must destroy because hammer adds event listeners to window
        this._eventManager.destroy();
      }
    }
  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map.getMap();
    }
  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, options) {
      return this._map.queryRenderedFeatures(geometry, options);
    }

    // Checks a visibilityConstraints object to see if the map should be displayed

  }, {
    key: '_checkVisibilityConstraints',
    value: function _checkVisibilityConstraints(props) {
      var capitalize = function capitalize(s) {
        return s[0].toUpperCase() + s.slice(1);
      };

      var visibilityConstraints = props.visibilityConstraints;

      for (var propName in props) {
        var capitalizedPropName = capitalize(propName);
        var minPropName = 'min' + capitalizedPropName;
        var maxPropName = 'max' + capitalizedPropName;

        if (minPropName in visibilityConstraints && props[propName] < visibilityConstraints[minPropName]) {
          return false;
        }
        if (maxPropName in visibilityConstraints && props[propName] > visibilityConstraints[maxPropName]) {
          return false;
        }
      }
      return true;
    }
  }, {
    key: '_getFeatures',
    value: function _getFeatures(_ref3) {
      var pos = _ref3.pos,
          radius = _ref3.radius;

      var features = void 0;
      if (radius) {
        // Radius enables point features, like marker symbols, to be clicked.
        var size = radius;
        var bbox = [[pos[0] - size, pos[1] + size], [pos[0] + size, pos[1] - size]];
        features = this._map.queryRenderedFeatures(bbox);
      } else {
        features = this._map.queryRenderedFeatures(pos);
      }
      return features;
    }
  }, {
    key: '_onInteractiveStateChange',
    value: function _onInteractiveStateChange(_ref4) {
      var _ref4$isDragging = _ref4.isDragging,
          isDragging = _ref4$isDragging === undefined ? false : _ref4$isDragging;

      if (isDragging !== this.state.isDragging) {
        this.setState({ isDragging: isDragging });
      }
    }

    // HOVER AND CLICK

  }, {
    key: '_getPos',
    value: function _getPos(event) {
      var _event$offsetCenter = event.offsetCenter,
          x = _event$offsetCenter.x,
          y = _event$offsetCenter.y;

      return [x, y];
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      if (!this.state.isDragging) {
        var pos = this._getPos(event);
        var features = this._getFeatures({
          pos: pos,
          radius: this.props.clickRadius
        });

        var isHovering = features && features.length > 0;
        if (isHovering !== this.state.isHovering) {
          this.setState({ isHovering: isHovering });
        }

        if (this.props.onHover) {
          var viewport = new _viewportMercatorProject2.default(this.props);
          event.lngLat = viewport.unproject(pos);
          event.features = features;

          this.props.onHover(event);
        }
      }
    }
  }, {
    key: '_onMouseClick',
    value: function _onMouseClick(event) {
      if (this.props.onClick) {
        var pos = this._getPos(event);
        var viewport = new _viewportMercatorProject2.default(this.props);
        event.lngLat = viewport.unproject(pos);
        event.features = this._getFeatures({
          pos: pos,
          radius: this.props.clickRadius
        });

        this.props.onClick(event);
      }
    }
  }, {
    key: '_eventCanvasLoaded',
    value: function _eventCanvasLoaded(ref) {
      this._eventCanvas = ref;
    }
  }, {
    key: '_staticMapLoaded',
    value: function _staticMapLoaded(ref) {
      this._map = ref;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          width = _props.width,
          height = _props.height,
          getCursor = _props.getCursor;


      var eventCanvasStyle = {
        width: width,
        height: height,
        position: 'relative',
        cursor: getCursor(this.state)
      };

      return (0, _react.createElement)('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, (0, _react.createElement)(_staticMap2.default, (0, _assign2.default)({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this.props.children
      })));
    }
  }]);
  return InteractiveMap;
}(_react.PureComponent);

exports.default = InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJwcm9wVHlwZXMiLCJtYXhab29tIiwibnVtYmVyIiwibWluWm9vbSIsIm1heFBpdGNoIiwibWluUGl0Y2giLCJvblZpZXdwb3J0Q2hhbmdlIiwiZnVuYyIsInRyYW5zaXRpb25EdXJhdGlvbiIsInRyYW5zaXRpb25JbnRlcnBvbGF0b3IiLCJ0cmFuc2l0aW9uSW50ZXJydXB0aW9uIiwidHJhbnNpdGlvbkVhc2luZyIsIm9uVHJhbnNpdGlvblN0YXJ0Iiwib25UcmFuc2l0aW9uSW50ZXJydXB0Iiwib25UcmFuc2l0aW9uRW5kIiwic2Nyb2xsWm9vbSIsImJvb2wiLCJkcmFnUGFuIiwiZHJhZ1JvdGF0ZSIsImRvdWJsZUNsaWNrWm9vbSIsInRvdWNoWm9vbVJvdGF0ZSIsImtleWJvYXJkIiwib25Ib3ZlciIsIm9uQ2xpY2siLCJjbGlja1JhZGl1cyIsImdldEN1cnNvciIsInZpc2liaWxpdHlDb25zdHJhaW50cyIsInNoYXBlIiwibWFwQ29udHJvbHMiLCJldmVudHMiLCJhcnJheU9mIiwic3RyaW5nIiwiaGFuZGxlRXZlbnQiLCJnZXREZWZhdWx0Q3Vyc29yIiwiaXNEcmFnZ2luZyIsImlzSG92ZXJpbmciLCJDVVJTT1IiLCJHUkFCQklORyIsIlBPSU5URVIiLCJHUkFCIiwiZGVmYXVsdFByb3BzIiwiY2hpbGRDb250ZXh0VHlwZXMiLCJ2aWV3cG9ydCIsImluc3RhbmNlT2YiLCJldmVudE1hbmFnZXIiLCJvYmplY3QiLCJJbnRlcmFjdGl2ZU1hcCIsInN1cHBvcnRlZCIsInByb3BzIiwic3RhdGUiLCJfbWFwQ29udHJvbHMiLCJldmVudE1hbmFnZXJTdHViIiwicXVldWUiLCJvbiIsInJlZiIsInB1c2giLCJvZmYiLCJkZXN0cm95IiwiX2V2ZW50TWFuYWdlciIsIl9ldmVudENhbnZhcyIsInJpZ2h0QnV0dG9uIiwiX29uTW91c2VNb3ZlIiwiX29uTW91c2VDbGljayIsImZvckVhY2giLCJzZXRPcHRpb25zIiwib25TdGF0ZUNoYW5nZSIsIl9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UiLCJfdHJhbnNpdGlvbk1hbmFnZXIiLCJuZXh0UHJvcHMiLCJwcm9jZXNzVmlld3BvcnRDaGFuZ2UiLCJfbWFwIiwiZ2V0TWFwIiwiZ2VvbWV0cnkiLCJvcHRpb25zIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwiY2FwaXRhbGl6ZSIsInMiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwicHJvcE5hbWUiLCJjYXBpdGFsaXplZFByb3BOYW1lIiwibWluUHJvcE5hbWUiLCJtYXhQcm9wTmFtZSIsInBvcyIsInJhZGl1cyIsImZlYXR1cmVzIiwic2l6ZSIsImJib3giLCJzZXRTdGF0ZSIsImV2ZW50Iiwib2Zmc2V0Q2VudGVyIiwieCIsInkiLCJfZ2V0UG9zIiwiX2dldEZlYXR1cmVzIiwibGVuZ3RoIiwibG5nTGF0IiwidW5wcm9qZWN0Iiwid2lkdGgiLCJoZWlnaHQiLCJldmVudENhbnZhc1N0eWxlIiwicG9zaXRpb24iLCJjdXJzb3IiLCJrZXkiLCJfZXZlbnRDYW52YXNMb2FkZWQiLCJzdHlsZSIsImdldFZpZXdwb3J0SW5UcmFuc2l0aW9uIiwidmlzaWJsZSIsIl9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyIsIl9zdGF0aWNNYXBMb2FkZWQiLCJjaGlsZHJlbiIsImRpc3BsYXlOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7QUFDQTs7OztBQUVBOzs7O0FBRUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxJQUFNQSxZQUFZLHNCQUFjLEVBQWQsRUFBa0Isb0JBQVVBLFNBQTVCLEVBQXVDO0FBQ3ZEOztBQUVBO0FBQ0E7QUFDQUMsV0FBUyxvQkFBVUMsTUFMb0M7QUFNdkQ7QUFDQUMsV0FBUyxvQkFBVUQsTUFQb0M7QUFRdkQ7QUFDQUUsWUFBVSxvQkFBVUYs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Q0FNLGVBQWVMLGlCQUFmLEdBQW1DQSxpQkFBbkMiLCJmaWxlIjoiaW50ZXJhY3RpdmUtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudCB9IGZyb20gJ3JlYWN0J1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJ1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJy4uL3V0aWxzL2F1dG9iaW5kJ1xuXG5pbXBvcnQgU3RhdGljTWFwIGZyb20gJy4vc3RhdGljLW1hcCdcbmltcG9ydCB7IE1BUEJPWF9MSU1JVFMgfSBmcm9tICcuLi91dGlscy9tYXAtc3RhdGUnXG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0J1xuXG5pbXBvcnQgVHJhbnNpdGlvbk1hbmFnZXIgZnJvbSAnLi4vdXRpbHMvdHJhbnNpdGlvbi1tYW5hZ2VyJ1xuXG5pbXBvcnQgeyBFdmVudE1hbmFnZXIgfSBmcm9tICcuLi9tam9sbmlyLmpzL3NyYy9pbmRleC5qcydcbmltcG9ydCBNYXBDb250cm9scyBmcm9tICcuLi91dGlscy9tYXAtY29udHJvbHMnXG5pbXBvcnQgY29uZmlnIGZyb20gJy4uL2NvbmZpZydcbmltcG9ydCBkZXByZWNhdGVXYXJuIGZyb20gJy4uL3V0aWxzL2RlcHJlY2F0ZS13YXJuJ1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBTdGF0aWNNYXAucHJvcFR5cGVzLCB7XG4gIC8vIEFkZGl0aW9uYWwgcHJvcHMgb24gdG9wIG9mIFN0YXRpY01hcFxuXG4gIC8qKiBWaWV3cG9ydCBjb25zdHJhaW50cyAqL1xuICAvLyBNYXggem9vbSBsZXZlbFxuICBtYXhab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBNaW4gem9vbSBsZXZlbFxuICBtaW5ab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBNYXggcGl0Y2ggaW4gZGVncmVlc1xuICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHBpdGNoIGluIGRlZ3JlZXNcbiAgbWluUGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG5cbiAgLyoqXG4gICAqIGBvblZpZXdwb3J0Q2hhbmdlYCBjYWxsYmFjayBpcyBmaXJlZCB3aGVuIHRoZSB1c2VyIGludGVyYWN0ZWQgd2l0aCB0aGVcbiAgICogbWFwLiBUaGUgb2JqZWN0IHBhc3NlZCB0byB0aGUgY2FsbGJhY2sgY29udGFpbnMgdmlld3BvcnQgcHJvcGVydGllc1xuICAgKiBzdWNoIGFzIGBsb25naXR1ZGVgLCBgbGF0aXR1ZGVgLCBgem9vbWAgZXRjLlxuICAgKi9cbiAgb25WaWV3cG9ydENoYW5nZTogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIFZpZXdwb3J0IHRyYW5zaXRpb24gKiovXG4gIC8vIHRyYW5zaXRpb24gZHVyYXRpb24gZm9yIHZpZXdwb3J0IGNoYW5nZVxuICB0cmFuc2l0aW9uRHVyYXRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIGZ1bmN0aW9uIGNhbGxlZCBmb3IgZWFjaCB0cmFuc2l0aW9uIHN0ZXAsIGNhbiBiZSB1c2VkIHRvIHBlcmZvcm0gY3VzdG9tIHRyYW5zaXRpb25zLlxuICB0cmFuc2l0aW9uSW50ZXJwb2xhdG9yOiBQcm9wVHlwZXMuZnVuYyxcbiAgLy8gdHlwZSBvZiBpbnRlcnJ1cHRpb24gb2YgY3VycmVudCB0cmFuc2l0aW9uIG9uIHVwZGF0ZS5cbiAgdHJhbnNpdGlvbkludGVycnVwdGlvbjogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gZWFzaW5nIGZ1bmN0aW9uXG4gIHRyYW5zaXRpb25FYXNpbmc6IFByb3BUeXBlcy5mdW5jLFxuICAvLyB0cmFuc2l0aW9uIHN0YXR1cyB1cGRhdGUgZnVuY3Rpb25zXG4gIG9uVHJhbnNpdGlvblN0YXJ0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uSW50ZXJydXB0OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25UcmFuc2l0aW9uRW5kOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogRW5hYmxlcyBjb250cm9sIGV2ZW50IGhhbmRsaW5nICovXG4gIC8vIFNjcm9sbCB0byB6b29tXG4gIHNjcm9sbFpvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBEcmFnIHRvIHBhblxuICBkcmFnUGFuOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byByb3RhdGVcbiAgZHJhZ1JvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERvdWJsZSBjbGljayB0byB6b29tXG4gIGRvdWJsZUNsaWNrWm9vbTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIFBpbmNoIHRvIHpvb20gLyByb3RhdGVcbiAgdG91Y2hab29tUm90YXRlOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gS2V5Ym9hcmRcbiAga2V5Ym9hcmQ6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGhvdmVyZWQgb3Zlci5cbiAgICogQGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBldmVudCAtIFRoZSBtb3VzZSBldmVudC5cbiAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfSBldmVudC5sbmdMYXQgLSBUaGUgY29vcmRpbmF0ZXMgb2YgdGhlIHBvaW50ZXJcbiAgICogQHBhcmFtIHtBcnJheX0gZXZlbnQuZmVhdHVyZXMgLSBUaGUgZmVhdHVyZXMgdW5kZXIgdGhlIHBvaW50ZXIsIHVzaW5nIE1hcGJveCdzXG4gICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEk6XG4gICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgKiBUbyBtYWtlIGEgbGF5ZXIgaW50ZXJhY3RpdmUsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLiBTZWUgTWFwYm94J3Mgc3R5bGUgc3BlY1xuICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1zdHlsZS1zcGVjLyNsYXllci1pbnRlcmFjdGl2ZVxuICAgKi9cbiAgb25Ib3ZlcjogUHJvcFR5cGVzLmZ1bmMsXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiB0aGUgbWFwIGlzIGNsaWNrZWQuXG4gICAqIEBjYWxsYmFja1xuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBUaGUgbW91c2UgZXZlbnQuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAqIEBwYXJhbSB7QXJyYXl9IGV2ZW50LmZlYXR1cmVzIC0gVGhlIGZlYXR1cmVzIHVuZGVyIHRoZSBwb2ludGVyLCB1c2luZyBNYXBib3gnc1xuICAgKiBxdWVyeVJlbmRlcmVkRmVhdHVyZXMgQVBJOlxuICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICogVG8gbWFrZSBhIGxheWVyIGludGVyYWN0aXZlLCBzZXQgdGhlIGBpbnRlcmFjdGl2ZWAgcHJvcGVydHkgaW4gdGhlXG4gICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICovXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBSYWRpdXMgdG8gZGV0ZWN0IGZlYXR1cmVzIGFyb3VuZCBhIGNsaWNrZWQgcG9pbnQuIERlZmF1bHRzIHRvIDAuICovXG4gIGNsaWNrUmFkaXVzOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKiBBY2Nlc3NvciB0aGF0IHJldHVybnMgYSBjdXJzb3Igc3R5bGUgdG8gc2hvdyBpbnRlcmFjdGl2ZSBzdGF0ZSAqL1xuICBnZXRDdXJzb3I6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBBZHZhbmNlZCBmZWF0dXJlcyAqL1xuICAvLyBDb250cmFpbnRzIGZvciBkaXNwbGF5aW5nIHRoZSBtYXAuIElmIG5vdCBtZXQsIHRoZW4gdGhlIG1hcCBpcyBoaWRkZW4uXG4gIC8vIEV4cGVyaW1lbnRhbCEgTWF5IGJlIGNoYW5nZWQgaW4gbWlub3IgdmVyc2lvbiB1cGRhdGVzLlxuICB2aXNpYmlsaXR5Q29uc3RyYWludHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhab29tOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIG1heFBpdGNoOiBQcm9wVHlwZXMubnVtYmVyXG4gIH0pLFxuICAvLyBBIG1hcCBjb250cm9sIGluc3RhbmNlIHRvIHJlcGxhY2UgdGhlIGRlZmF1bHQgbWFwIGNvbnRyb2xzXG4gIC8vIFRoZSBvYmplY3QgbXVzdCBleHBvc2Ugb25lIHByb3BlcnR5OiBgZXZlbnRzYCBhcyBhbiBhcnJheSBvZiBzdWJzY3JpYmVkXG4gIC8vIGV2ZW50IG5hbWVzOyBhbmQgdHdvIG1ldGhvZHM6IGBzZXRTdGF0ZShzdGF0ZSlgIGFuZCBgaGFuZGxlKGV2ZW50KWBcbiAgbWFwQ29udHJvbHM6IFByb3BUeXBlcy5zaGFwZSh7XG4gICAgZXZlbnRzOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMuc3RyaW5nKSxcbiAgICBoYW5kbGVFdmVudDogUHJvcFR5cGVzLmZ1bmNcbiAgfSlcbn0pXG5cbmNvbnN0IGdldERlZmF1bHRDdXJzb3IgPSAoeyBpc0RyYWdnaW5nLCBpc0hvdmVyaW5nIH0pID0+XG4gIGlzRHJhZ2dpbmdcbiAgICA/IGNvbmZpZy5DVVJTT1IuR1JBQkJJTkdcbiAgICA6IGlzSG92ZXJpbmcgPyBjb25maWcuQ1VSU09SLlBPSU5URVIgOiBjb25maWcuQ1VSU09SLkdSQUJcblxuY29uc3QgZGVmYXVsdFByb3BzID0gT2JqZWN0LmFzc2lnbihcbiAge30sXG4gIFN0YXRpY01hcC5kZWZhdWx0UHJvcHMsXG4gIE1BUEJPWF9MSU1JVFMsXG4gIFRyYW5zaXRpb25NYW5hZ2VyLmRlZmF1bHRQcm9wcyxcbiAge1xuICAgIG9uVmlld3BvcnRDaGFuZ2U6IG51bGwsXG4gICAgb25DbGljazogbnVsbCxcbiAgICBvbkhvdmVyOiBudWxsLFxuXG4gICAgc2Nyb2xsWm9vbTogdHJ1ZSxcbiAgICBkcmFnUGFuOiB0cnVlLFxuICAgIGRyYWdSb3RhdGU6IHRydWUsXG4gICAgZG91YmxlQ2xpY2tab29tOiB0cnVlLFxuICAgIHRvdWNoWm9vbVJvdGF0ZTogdHJ1ZSxcblxuICAgIGNsaWNrUmFkaXVzOiAwLFxuICAgIGdldEN1cnNvcjogZ2V0RGVmYXVsdEN1cnNvcixcblxuICAgIHZpc2liaWxpdHlDb25zdHJhaW50czogTUFQQk9YX0xJTUlUU1xuICB9XG4pXG5cbmNvbnN0IGNoaWxkQ29udGV4dFR5cGVzID0ge1xuICB2aWV3cG9ydDogUHJvcFR5cGVzLmluc3RhbmNlT2YoV2ViTWVyY2F0b3JWaWV3cG9ydCksXG4gIGlzRHJhZ2dpbmc6IFByb3BUeXBlcy5ib29sLFxuICBldmVudE1hbmFnZXI6IFByb3BUeXBlcy5vYmplY3Rcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW50ZXJhY3RpdmVNYXAgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gU3RhdGljTWFwLnN1cHBvcnRlZCgpXG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKVxuICAgIGF1dG9iaW5kKHRoaXMpXG4gICAgLy8gQ2hlY2sgZm9yIGRlcHJlY2F0ZWQgcHJvcHNcbiAgICBkZXByZWNhdGVXYXJuKHByb3BzKVxuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIC8vIFdoZXRoZXIgdGhlIGN1cnNvciBpcyBkb3duXG4gICAgICBpc0RyYWdnaW5nOiBmYWxzZSxcbiAgICAgIC8vIFdoZXRoZXIgdGhlIGN1cnNvciBpcyBvdmVyIGEgY2xpY2thYmxlIGZlYXR1cmVcbiAgICAgIGlzSG92ZXJpbmc6IGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSWYgcHJvcHMubWFwQ29udHJvbHMgaXMgbm90IHByb3ZpZGVkLCBmYWxsYmFjayB0byBkZWZhdWx0IE1hcENvbnRyb2xzIGluc3RhbmNlXG4gICAgLy8gQ2Fubm90IHVzZSBkZWZhdWx0UHJvcHMgaGVyZSBiZWNhdXNlIGl0IG5lZWRzIHRvIGJlIHBlciBtYXAgaW5zdGFuY2VcbiAgICB0aGlzLl9tYXBDb250cm9scyA9IHByb3BzLm1hcENvbnRyb2xzIHx8IG5ldyBNYXBDb250cm9scygpXG5cbiAgICAvLyBwcm92aWRlIGFuIGV2ZW50TWFuYWdlciBzdHViIHVudGlsIHJlYWwgZXZlbnRNYW5hZ2VyIGNyZWF0ZWRcbiAgICBjb25zdCBldmVudE1hbmFnZXJTdHViID0ge1xuICAgICAgcXVldWU6IFtdLFxuICAgICAgb24oZXZlbnRzLCByZWYpIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHsgZXZlbnRzLCByZWYsIG9uOiB0cnVlIH0pXG4gICAgICB9LFxuICAgICAgb2ZmKGV2ZW50cykge1xuICAgICAgICB0aGlzLnF1ZXVlLnB1c2goeyBldmVudHMgfSlcbiAgICAgIH0sXG4gICAgICBkZXN0cm95KCkge31cbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBldmVudE1hbmFnZXJTdHViXG4gIH1cblxuICBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKSxcbiAgICAgIGlzRHJhZ2dpbmc6IHRoaXMuc3RhdGUuaXNEcmFnZ2luZyxcbiAgICAgIGV2ZW50TWFuYWdlcjogdGhpcy5fZXZlbnRNYW5hZ2VyXG4gICAgfVxuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcih0aGlzLl9ldmVudENhbnZhcywge1xuICAgICAgcmlnaHRCdXR0b246IHRydWVcbiAgICB9KVxuXG4gICAgLy8gUmVnaXN0ZXIgYWRkaXRpb25hbCBldmVudCBoYW5kbGVycyBmb3IgY2xpY2sgYW5kIGhvdmVyXG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdtb3VzZW1vdmUnLCB0aGlzLl9vbk1vdXNlTW92ZSlcbiAgICBldmVudE1hbmFnZXIub24oJ2NsaWNrJywgdGhpcy5fb25Nb3VzZUNsaWNrKVxuXG4gICAgLy8gcnVuIHN0dWIgcXVldWVkIGFjdGlvblxuICAgIHRoaXMuX2V2ZW50TWFuYWdlci5xdWV1ZS5mb3JFYWNoKCh7IGV2ZW50cywgcmVmLCBvbiB9KSA9PiB7XG4gICAgICBpZiAob24gPT09IHRydWUpIHtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9uKGV2ZW50cywgcmVmKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZXZlbnRNYW5hZ2VyLm9mZihldmVudHMpXG4gICAgICB9XG4gICAgfSlcblxuICAgIHRoaXMuX2V2ZW50TWFuYWdlciA9IGV2ZW50TWFuYWdlclxuXG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhcbiAgICAgIE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgICAgb25TdGF0ZUNoYW5nZTogdGhpcy5fb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlLFxuICAgICAgICBldmVudE1hbmFnZXJcbiAgICAgIH0pXG4gICAgKVxuXG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIgPSBuZXcgVHJhbnNpdGlvbk1hbmFnZXIodGhpcy5wcm9wcylcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVcGRhdGUobmV4dFByb3BzKSB7XG4gICAgdGhpcy5fbWFwQ29udHJvbHMuc2V0T3B0aW9ucyhuZXh0UHJvcHMpXG4gICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIucHJvY2Vzc1ZpZXdwb3J0Q2hhbmdlKG5leHRQcm9wcylcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIGlmICh0aGlzLl9ldmVudE1hbmFnZXIpIHtcbiAgICAgIC8vIE11c3QgZGVzdHJveSBiZWNhdXNlIGhhbW1lciBhZGRzIGV2ZW50IGxpc3RlbmVycyB0byB3aW5kb3dcbiAgICAgIHRoaXMuX2V2ZW50TWFuYWdlci5kZXN0cm95KClcbiAgICB9XG4gIH1cblxuICBnZXRNYXAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5nZXRNYXAoKVxuICB9XG5cbiAgcXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKSB7XG4gICAgcmV0dXJuIHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIG9wdGlvbnMpXG4gIH1cblxuICAvLyBDaGVja3MgYSB2aXNpYmlsaXR5Q29uc3RyYWludHMgb2JqZWN0IHRvIHNlZSBpZiB0aGUgbWFwIHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAgX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzKHByb3BzKSB7XG4gICAgY29uc3QgY2FwaXRhbGl6ZSA9IHMgPT4gc1swXS50b1VwcGVyQ2FzZSgpICsgcy5zbGljZSgxKVxuXG4gICAgY29uc3QgeyB2aXNpYmlsaXR5Q29uc3RyYWludHMgfSA9IHByb3BzXG4gICAgZm9yIChjb25zdCBwcm9wTmFtZSBpbiBwcm9wcykge1xuICAgICAgY29uc3QgY2FwaXRhbGl6ZWRQcm9wTmFtZSA9IGNhcGl0YWxpemUocHJvcE5hbWUpXG4gICAgICBjb25zdCBtaW5Qcm9wTmFtZSA9IGBtaW4ke2NhcGl0YWxpemVkUHJvcE5hbWV9YFxuICAgICAgY29uc3QgbWF4UHJvcE5hbWUgPSBgbWF4JHtjYXBpdGFsaXplZFByb3BOYW1lfWBcblxuICAgICAgaWYgKFxuICAgICAgICBtaW5Qcm9wTmFtZSBpbiB2aXNpYmlsaXR5Q29uc3RyYWludHMgJiZcbiAgICAgICAgcHJvcHNbcHJvcE5hbWVdIDwgdmlzaWJpbGl0eUNvbnN0cmFpbnRzW21pblByb3BOYW1lXVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgICAgaWYgKFxuICAgICAgICBtYXhQcm9wTmFtZSBpbiB2aXNpYmlsaXR5Q29uc3RyYWludHMgJiZcbiAgICAgICAgcHJvcHNbcHJvcE5hbWVdID4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzW21heFByb3BOYW1lXVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgX2dldEZlYXR1cmVzKHsgcG9zLCByYWRpdXMgfSkge1xuICAgIGxldCBmZWF0dXJlc1xuICAgIGlmIChyYWRpdXMpIHtcbiAgICAgIC8vIFJhZGl1cyBlbmFibGVzIHBvaW50IGZlYXR1cmVzLCBsaWtlIG1hcmtlciBzeW1ib2xzLCB0byBiZSBjbGlja2VkLlxuICAgICAgY29uc3Qgc2l6ZSA9IHJhZGl1c1xuICAgICAgY29uc3QgYmJveCA9IFtcbiAgICAgICAgW3Bvc1swXSAtIHNpemUsIHBvc1sxXSArIHNpemVdLFxuICAgICAgICBbcG9zWzBdICsgc2l6ZSwgcG9zWzFdIC0gc2l6ZV1cbiAgICAgIF1cbiAgICAgIGZlYXR1cmVzID0gdGhpcy5fbWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhiYm94KVxuICAgIH0gZWxzZSB7XG4gICAgICBmZWF0dXJlcyA9IHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMocG9zKVxuICAgIH1cbiAgICByZXR1cm4gZmVhdHVyZXNcbiAgfVxuXG4gIF9vbkludGVyYWN0aXZlU3RhdGVDaGFuZ2UoeyBpc0RyYWdnaW5nID0gZmFsc2UgfSkge1xuICAgIGlmIChpc0RyYWdnaW5nICE9PSB0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0RyYWdnaW5nIH0pXG4gICAgfVxuICB9XG5cbiAgLy8gSE9WRVIgQU5EIENMSUNLXG4gIF9nZXRQb3MoZXZlbnQpIHtcbiAgICBjb25zdCB7IG9mZnNldENlbnRlcjogeyB4LCB5IH0gfSA9IGV2ZW50XG4gICAgcmV0dXJuIFt4LCB5XVxuICB9XG5cbiAgX29uTW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmlzRHJhZ2dpbmcpIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFBvcyhldmVudClcbiAgICAgIGNvbnN0IGZlYXR1cmVzID0gdGhpcy5fZ2V0RmVhdHVyZXMoe1xuICAgICAgICBwb3MsXG4gICAgICAgIHJhZGl1czogdGhpcy5wcm9wcy5jbGlja1JhZGl1c1xuICAgICAgfSlcblxuICAgICAgY29uc3QgaXNIb3ZlcmluZyA9IGZlYXR1cmVzICYmIGZlYXR1cmVzLmxlbmd0aCA+IDBcbiAgICAgIGlmIChpc0hvdmVyaW5nICE9PSB0aGlzLnN0YXRlLmlzSG92ZXJpbmcpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzSG92ZXJpbmcgfSlcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMucHJvcHMub25Ib3Zlcikge1xuICAgICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpXG4gICAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpXG4gICAgICAgIGV2ZW50LmZlYXR1cmVzID0gZmVhdHVyZXNcblxuICAgICAgICB0aGlzLnByb3BzLm9uSG92ZXIoZXZlbnQpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX29uTW91c2VDbGljayhldmVudCkge1xuICAgIGlmICh0aGlzLnByb3BzLm9uQ2xpY2spIHtcbiAgICAgIGNvbnN0IHBvcyA9IHRoaXMuX2dldFBvcyhldmVudClcbiAgICAgIGNvbnN0IHZpZXdwb3J0ID0gbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcylcbiAgICAgIGV2ZW50LmxuZ0xhdCA9IHZpZXdwb3J0LnVucHJvamVjdChwb3MpXG4gICAgICBldmVudC5mZWF0dXJlcyA9IHRoaXMuX2dldEZlYXR1cmVzKHtcbiAgICAgICAgcG9zLFxuICAgICAgICByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXNcbiAgICAgIH0pXG5cbiAgICAgIHRoaXMucHJvcHMub25DbGljayhldmVudClcbiAgICB9XG4gIH1cblxuICBfZXZlbnRDYW52YXNMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fZXZlbnRDYW52YXMgPSByZWZcbiAgfVxuXG4gIF9zdGF0aWNNYXBMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fbWFwID0gcmVmXG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0LCBnZXRDdXJzb3IgfSA9IHRoaXMucHJvcHNcblxuICAgIGNvbnN0IGV2ZW50Q2FudmFzU3R5bGUgPSB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHBvc2l0aW9uOiAncmVsYXRpdmUnLFxuICAgICAgY3Vyc29yOiBnZXRDdXJzb3IodGhpcy5zdGF0ZSlcbiAgICB9XG5cbiAgICByZXR1cm4gY3JlYXRlRWxlbWVudChcbiAgICAgICdkaXYnLFxuICAgICAge1xuICAgICAgICBrZXk6ICdtYXAtY29udHJvbHMnLFxuICAgICAgICByZWY6IHRoaXMuX2V2ZW50Q2FudmFzTG9hZGVkLFxuICAgICAgICBzdHlsZTogZXZlbnRDYW52YXNTdHlsZVxuICAgICAgfSxcbiAgICAgIGNyZWF0ZUVsZW1lbnQoXG4gICAgICAgIFN0YXRpY01hcCxcbiAgICAgICAgT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB0aGlzLnByb3BzLFxuICAgICAgICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyICYmXG4gICAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlci5nZXRWaWV3cG9ydEluVHJhbnNpdGlvbigpLFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHZpc2libGU6IHRoaXMuX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzKHRoaXMucHJvcHMpLFxuICAgICAgICAgICAgcmVmOiB0aGlzLl9zdGF0aWNNYXBMb2FkZWQsXG4gICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKVxuICAgIClcbiAgfVxufVxuXG5JbnRlcmFjdGl2ZU1hcC5kaXNwbGF5TmFtZSA9ICdJbnRlcmFjdGl2ZU1hcCdcbkludGVyYWN0aXZlTWFwLnByb3BUeXBlcyA9IHByb3BUeXBlc1xuSW50ZXJhY3RpdmVNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzXG5JbnRlcmFjdGl2ZU1hcC5jaGlsZENvbnRleHRUeXBlcyA9IGNoaWxkQ29udGV4dFR5cGVzXG4iXX0=