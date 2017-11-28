var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import StaticMap from './static-map';
import { MAPBOX_LIMITS } from '../utils/map-state';
import WebMercatorViewport from 'viewport-mercator-project';

import TransitionManager from '../utils/transition-manager';

import { EventManager } from '../mjolnir.js/src/index.js';
import MapControls from '../utils/map-controls';
import config from '../config';
import deprecateWarn from '../utils/deprecate-warn';

var propTypes = Object.assign({}, StaticMap.propTypes, {
  // Additional props on top of StaticMap

  /** Viewport constraints */
  // Max zoom level
  maxZoom: PropTypes.number,
  // Min zoom level
  minZoom: PropTypes.number,
  // Max pitch in degrees
  maxPitch: PropTypes.number,
  // Min pitch in degrees
  minPitch: PropTypes.number,

  /**
   * `onViewportChange` callback is fired when the user interacted with the
   * map. The object passed to the callback contains viewport properties
   * such as `longitude`, `latitude`, `zoom` etc.
   */
  onViewportChange: PropTypes.func,

  /** Viewport transition **/
  // transition duration for viewport change
  transitionDuration: PropTypes.number,
  // function called for each transition step, can be used to perform custom transitions.
  transitionInterpolator: PropTypes.func,
  // type of interruption of current transition on update.
  transitionInterruption: PropTypes.number,
  // easing function
  transitionEasing: PropTypes.func,
  // transition status update functions
  onTransitionStart: PropTypes.func,
  onTransitionInterrupt: PropTypes.func,
  onTransitionEnd: PropTypes.func,

  /** Enables control event handling */
  // Scroll to zoom
  scrollZoom: PropTypes.bool,
  // Drag to pan
  dragPan: PropTypes.bool,
  // Drag to rotate
  dragRotate: PropTypes.bool,
  // Double click to zoom
  doubleClickZoom: PropTypes.bool,
  // Pinch to zoom / rotate
  touchZoomRotate: PropTypes.bool,
  // Keyboard
  keyboard: PropTypes.bool,

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
  onHover: PropTypes.func,
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
  onClick: PropTypes.func,

  /** Radius to detect features around a clicked point. Defaults to 0. */
  clickRadius: PropTypes.number,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  /** Advanced features */
  // Contraints for displaying the map. If not met, then the map is hidden.
  // Experimental! May be changed in minor version updates.
  visibilityConstraints: PropTypes.shape({
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    minPitch: PropTypes.number,
    maxPitch: PropTypes.number
  }),
  // A map control instance to replace the default map controls
  // The object must expose one property: `events` as an array of subscribed
  // event names; and two methods: `setState(state)` and `handle(event)`
  mapControls: PropTypes.shape({
    events: PropTypes.arrayOf(PropTypes.string),
    handleEvent: PropTypes.func
  })
});

var getDefaultCursor = function getDefaultCursor(_ref) {
  var isDragging = _ref.isDragging,
      isHovering = _ref.isHovering;
  return isDragging ? config.CURSOR.GRABBING : isHovering ? config.CURSOR.POINTER : config.CURSOR.GRAB;
};

var defaultProps = Object.assign({}, StaticMap.defaultProps, MAPBOX_LIMITS, TransitionManager.defaultProps, {
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

  visibilityConstraints: MAPBOX_LIMITS
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport),
  isDragging: PropTypes.bool,
  eventManager: PropTypes.object
};

var InteractiveMap = function (_PureComponent) {
  _inherits(InteractiveMap, _PureComponent);

  _createClass(InteractiveMap, null, [{
    key: 'supported',
    value: function supported() {
      return StaticMap.supported();
    }
  }]);

  function InteractiveMap(props) {
    _classCallCheck(this, InteractiveMap);

    var _this = _possibleConstructorReturn(this, (InteractiveMap.__proto__ || Object.getPrototypeOf(InteractiveMap)).call(this, props));

    autobind(_this);
    // Check for deprecated props
    deprecateWarn(props);

    _this.state = {
      // Whether the cursor is down
      isDragging: false,
      // Whether the cursor is over a clickable feature
      isHovering: false

      // If props.mapControls is not provided, fallback to default MapControls instance
      // Cannot use defaultProps here because it needs to be per map instance
    };_this._mapControls = props.mapControls || new MapControls();

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

  _createClass(InteractiveMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new WebMercatorViewport(this.props),
        isDragging: this.state.isDragging,
        eventManager: this._eventManager
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var eventManager = new EventManager(this._eventCanvas, {
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

      this._mapControls.setOptions(Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange,
        eventManager: eventManager
      }));

      this._transitionManager = new TransitionManager(this.props);
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
          var viewport = new WebMercatorViewport(this.props);
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
        var viewport = new WebMercatorViewport(this.props);
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

      return createElement('div', {
        key: 'map-controls',
        ref: this._eventCanvasLoaded,
        style: eventCanvasStyle
      }, createElement(StaticMap, Object.assign({}, this.props, this._transitionManager && this._transitionManager.getViewportInTransition(), {
        visible: this._checkVisibilityConstraints(this.props),
        ref: this._staticMapLoaded,
        children: this.props.children
      })));
    }
  }]);

  return InteractiveMap;
}(PureComponent);

export default InteractiveMap;


InteractiveMap.displayName = 'InteractiveMap';
InteractiveMap.propTypes = propTypes;
InteractiveMap.defaultProps = defaultProps;
InteractiveMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL2ludGVyYWN0aXZlLW1hcC5qcyJdLCJuYW1lcyI6WyJQdXJlQ29tcG9uZW50IiwiY3JlYXRlRWxlbWVudCIsIlByb3BUeXBlcyIsImF1dG9iaW5kIiwiU3RhdGljTWFwIiwiTUFQQk9YX0xJTUlUUyIsIldlYk1lcmNhdG9yVmlld3BvcnQiLCJUcmFuc2l0aW9uTWFuYWdlciIsIkV2ZW50TWFuYWdlciIsIk1hcENvbnRyb2xzIiwiY29uZmlnIiwiZGVwcmVjYXRlV2FybiIsInByb3BUeXBlcyIsIk9iamVjdCIsImFzc2lnbiIsIm1heFpvb20iLCJudW1iZXIiLCJtaW5ab29tIiwibWF4UGl0Y2giLCJtaW5QaXRjaCIsIm9uVmlld3BvcnRDaGFuZ2UiLCJmdW5jIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwidHJhbnNpdGlvbkludGVycG9sYXRvciIsInRyYW5zaXRpb25JbnRlcnJ1cHRpb24iLCJ0cmFuc2l0aW9uRWFzaW5nIiwib25UcmFuc2l0aW9uU3RhcnQiLCJvblRyYW5zaXRpb25JbnRlcnJ1cHQiLCJvblRyYW5zaXRpb25FbmQiLCJzY3JvbGxab29tIiwiYm9vbCIsImRyYWdQYW4iLCJkcmFnUm90YXRlIiwiZG91YmxlQ2xpY2tab29tIiwidG91Y2hab29tUm90YXRlIiwia2V5Ym9hcmQiLCJvbkhvdmVyIiwib25DbGljayIsImNsaWNrUmFkaXVzIiwiZ2V0Q3Vyc29yIiwidmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwic2hhcGUiLCJtYXBDb250cm9scyIsImV2ZW50cyIsImFycmF5T2YiLCJzdHJpbmciLCJoYW5kbGVFdmVudCIsImdldERlZmF1bHRDdXJzb3IiLCJpc0RyYWdnaW5nIiwiaXNIb3ZlcmluZyIsIkNVUlNPUiIsIkdSQUJCSU5HIiwiUE9JTlRFUiIsIkdSQUIiLCJkZWZhdWx0UHJvcHMiLCJjaGlsZENvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiaW5zdGFuY2VPZiIsImV2ZW50TWFuYWdlciIsIm9iamVjdCIsIkludGVyYWN0aXZlTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJzdGF0ZSIsIl9tYXBDb250cm9scyIsImV2ZW50TWFuYWdlclN0dWIiLCJxdWV1ZSIsIm9uIiwicmVmIiwicHVzaCIsIm9mZiIsImRlc3Ryb3kiLCJfZXZlbnRNYW5hZ2VyIiwiX2V2ZW50Q2FudmFzIiwicmlnaHRCdXR0b24iLCJfb25Nb3VzZU1vdmUiLCJfb25Nb3VzZUNsaWNrIiwiZm9yRWFjaCIsInNldE9wdGlvbnMiLCJvblN0YXRlQ2hhbmdlIiwiX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSIsIl90cmFuc2l0aW9uTWFuYWdlciIsIm5leHRQcm9wcyIsInByb2Nlc3NWaWV3cG9ydENoYW5nZSIsIl9tYXAiLCJnZXRNYXAiLCJnZW9tZXRyeSIsIm9wdGlvbnMiLCJxdWVyeVJlbmRlcmVkRmVhdHVyZXMiLCJjYXBpdGFsaXplIiwicyIsInRvVXBwZXJDYXNlIiwic2xpY2UiLCJwcm9wTmFtZSIsImNhcGl0YWxpemVkUHJvcE5hbWUiLCJtaW5Qcm9wTmFtZSIsIm1heFByb3BOYW1lIiwicG9zIiwicmFkaXVzIiwiZmVhdHVyZXMiLCJzaXplIiwiYmJveCIsInNldFN0YXRlIiwiZXZlbnQiLCJvZmZzZXRDZW50ZXIiLCJ4IiwieSIsIl9nZXRQb3MiLCJfZ2V0RmVhdHVyZXMiLCJsZW5ndGgiLCJsbmdMYXQiLCJ1bnByb2plY3QiLCJ3aWR0aCIsImhlaWdodCIsImV2ZW50Q2FudmFzU3R5bGUiLCJwb3NpdGlvbiIsImN1cnNvciIsImtleSIsIl9ldmVudENhbnZhc0xvYWRlZCIsInN0eWxlIiwiZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24iLCJ2aXNpYmxlIiwiX2NoZWNrVmlzaWJpbGl0eUNvbnN0cmFpbnRzIiwiX3N0YXRpY01hcExvYWRlZCIsImNoaWxkcmVuIiwiZGlzcGxheU5hbWUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsU0FBU0EsYUFBVCxFQUF3QkMsYUFBeEIsUUFBNkMsT0FBN0M7QUFDQSxPQUFPQyxTQUFQ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QUFBLFVBQ0NrRCxLQURELFVBQ0NBLEtBREQ7QUFBQSxVQUNRQyxNQURSLFVBQ1FBLE1BRFI7QUFBQSxVQUNnQjFFLFNBRGhCLFVBQ2dCQSxTQURoQjs7O0FBR1AsVUFBTTJFLG1CQUFtQjtBQUN2QkYsb0JBRHVCO0FBRXZCQyxzQkFGdUI7QUFHdkJFLGtCQUFVLFVBSGE7QUFJdkJDLGdCQUFRN0UsVUFBVSxLQUFLd0IsS0FBZjtBQUplLE9BQXpCOztBQU9BLGFBQU85RCxjQUNMLEtBREssRUFFTDtBQUNFb0gsYUFBSyxjQURQO0FBRUVqRCxhQUFLLEtBQUtrRCxrQkFGWjtBQUdFQyxlQUFPTDtBQUhULE9BRkssRUFPTGpILGNBQ0VHLFNBREYsRUFFRVMsT0FBT0MsTUFBUCxDQUNFLEVBREYsRUFFRSxLQUFLZ0QsS0FGUCxFQUdFLEtBQUttQixrQkFBTCxJQUNFLEtBQUtBLGtCQUFMLENBQXdCdUMsdUJBQXhCLEVBSkosRUFLRTtBQUNFQyxpQkFBUyxLQUFLQywyQkFBTCxDQUFpQyxLQUFLNUQsS0FBdEMsQ0FEWDtBQUVFTSxhQUFLLEtBQUt1RCxnQkFGWjtBQUdFQyxrQkFBVSxLQUFLOUQsS0FBTCxDQUFXOEQ7QUFIdkIsT0FMRixDQUZGLENBUEssQ0FBUDtBQXNCRDs7OztFQWxPeUM1SCxhOztlQUF2QjRELGM7OztBQXFPckJBLGVBQWVpRSxXQUFmLEdBQTZCLGdCQUE3QjtBQUNBakUsZUFBZWhELFNBQWYsR0FBMkJBLFNBQTNCO0FBQ0FnRCxlQUFlTixZQUFmLEdBQThCQSxZQUE5QjtBQUNBTSxlQUFlTCxpQkFBZixHQUFtQ0EsaUJBQW5DIiwiZmlsZSI6ImludGVyYWN0aXZlLW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFB1cmVDb21wb25lbnQsIGNyZWF0ZUVsZW1lbnQgfSBmcm9tICdyZWFjdCdcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcydcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCdcblxuaW1wb3J0IFN0YXRpY01hcCBmcm9tICcuL3N0YXRpYy1tYXAnXG5pbXBvcnQgeyBNQVBCT1hfTElNSVRTIH0gZnJvbSAnLi4vdXRpbHMvbWFwLXN0YXRlJ1xuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCdcblxuaW1wb3J0IFRyYW5zaXRpb25NYW5hZ2VyIGZyb20gJy4uL3V0aWxzL3RyYW5zaXRpb24tbWFuYWdlcidcblxuaW1wb3J0IHsgRXZlbnRNYW5hZ2VyIH0gZnJvbSAnLi4vbWpvbG5pci5qcy9zcmMvaW5kZXguanMnXG5pbXBvcnQgTWFwQ29udHJvbHMgZnJvbSAnLi4vdXRpbHMvbWFwLWNvbnRyb2xzJ1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi9jb25maWcnXG5pbXBvcnQgZGVwcmVjYXRlV2FybiBmcm9tICcuLi91dGlscy9kZXByZWNhdGUtd2FybidcblxuY29uc3QgcHJvcFR5cGVzID0gT2JqZWN0LmFzc2lnbih7fSwgU3RhdGljTWFwLnByb3BUeXBlcywge1xuICAvLyBBZGRpdGlvbmFsIHByb3BzIG9uIHRvcCBvZiBTdGF0aWNNYXBcblxuICAvKiogVmlld3BvcnQgY29uc3RyYWludHMgKi9cbiAgLy8gTWF4IHpvb20gbGV2ZWxcbiAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWluIHpvb20gbGV2ZWxcbiAgbWluWm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgLy8gTWF4IHBpdGNoIGluIGRlZ3JlZXNcbiAgbWF4UGl0Y2g6IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIE1pbiBwaXRjaCBpbiBkZWdyZWVzXG4gIG1pblBpdGNoOiBQcm9wVHlwZXMubnVtYmVyLFxuXG4gIC8qKlxuICAgKiBgb25WaWV3cG9ydENoYW5nZWAgY2FsbGJhY2sgaXMgZmlyZWQgd2hlbiB0aGUgdXNlciBpbnRlcmFjdGVkIHdpdGggdGhlXG4gICAqIG1hcC4gVGhlIG9iamVjdCBwYXNzZWQgdG8gdGhlIGNhbGxiYWNrIGNvbnRhaW5zIHZpZXdwb3J0IHByb3BlcnRpZXNcbiAgICogc3VjaCBhcyBgbG9uZ2l0dWRlYCwgYGxhdGl0dWRlYCwgYHpvb21gIGV0Yy5cbiAgICovXG4gIG9uVmlld3BvcnRDaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuXG4gIC8qKiBWaWV3cG9ydCB0cmFuc2l0aW9uICoqL1xuICAvLyB0cmFuc2l0aW9uIGR1cmF0aW9uIGZvciB2aWV3cG9ydCBjaGFuZ2VcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiBQcm9wVHlwZXMubnVtYmVyLFxuICAvLyBmdW5jdGlvbiBjYWxsZWQgZm9yIGVhY2ggdHJhbnNpdGlvbiBzdGVwLCBjYW4gYmUgdXNlZCB0byBwZXJmb3JtIGN1c3RvbSB0cmFuc2l0aW9ucy5cbiAgdHJhbnNpdGlvbkludGVycG9sYXRvcjogUHJvcFR5cGVzLmZ1bmMsXG4gIC8vIHR5cGUgb2YgaW50ZXJydXB0aW9uIG9mIGN1cnJlbnQgdHJhbnNpdGlvbiBvbiB1cGRhdGUuXG4gIHRyYW5zaXRpb25JbnRlcnJ1cHRpb246IFByb3BUeXBlcy5udW1iZXIsXG4gIC8vIGVhc2luZyBmdW5jdGlvblxuICB0cmFuc2l0aW9uRWFzaW5nOiBQcm9wVHlwZXMuZnVuYyxcbiAgLy8gdHJhbnNpdGlvbiBzdGF0dXMgdXBkYXRlIGZ1bmN0aW9uc1xuICBvblRyYW5zaXRpb25TdGFydDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVHJhbnNpdGlvbkludGVycnVwdDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uVHJhbnNpdGlvbkVuZDogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgLyoqIEVuYWJsZXMgY29udHJvbCBldmVudCBoYW5kbGluZyAqL1xuICAvLyBTY3JvbGwgdG8gem9vbVxuICBzY3JvbGxab29tOiBQcm9wVHlwZXMuYm9vbCxcbiAgLy8gRHJhZyB0byBwYW5cbiAgZHJhZ1BhbjogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIERyYWcgdG8gcm90YXRlXG4gIGRyYWdSb3RhdGU6IFByb3BUeXBlcy5ib29sLFxuICAvLyBEb3VibGUgY2xpY2sgdG8gem9vbVxuICBkb3VibGVDbGlja1pvb206IFByb3BUeXBlcy5ib29sLFxuICAvLyBQaW5jaCB0byB6b29tIC8gcm90YXRlXG4gIHRvdWNoWm9vbVJvdGF0ZTogUHJvcFR5cGVzLmJvb2wsXG4gIC8vIEtleWJvYXJkXG4gIGtleWJvYXJkOiBQcm9wVHlwZXMuYm9vbCxcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBob3ZlcmVkIG92ZXIuXG4gICAqIEBjYWxsYmFja1xuICAgKiBAcGFyYW0ge09iamVjdH0gZXZlbnQgLSBUaGUgbW91c2UgZXZlbnQuXG4gICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXX0gZXZlbnQubG5nTGF0IC0gVGhlIGNvb3JkaW5hdGVzIG9mIHRoZSBwb2ludGVyXG4gICAqIEBwYXJhbSB7QXJyYXl9IGV2ZW50LmZlYXR1cmVzIC0gVGhlIGZlYXR1cmVzIHVuZGVyIHRoZSBwb2ludGVyLCB1c2luZyBNYXBib3gnc1xuICAgKiBxdWVyeVJlbmRlcmVkRmVhdHVyZXMgQVBJOlxuICAgKiBodHRwczovL3d3dy5tYXBib3guY29tL21hcGJveC1nbC1qcy9hcGkvI01hcCNxdWVyeVJlbmRlcmVkRmVhdHVyZXNcbiAgICogVG8gbWFrZSBhIGxheWVyIGludGVyYWN0aXZlLCBzZXQgdGhlIGBpbnRlcmFjdGl2ZWAgcHJvcGVydHkgaW4gdGhlXG4gICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC4gU2VlIE1hcGJveCdzIHN0eWxlIHNwZWNcbiAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtc3R5bGUtc3BlYy8jbGF5ZXItaW50ZXJhY3RpdmVcbiAgICovXG4gIG9uSG92ZXI6IFByb3BUeXBlcy5mdW5jLFxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIG1hcCBpcyBjbGlja2VkLlxuICAgKiBAY2FsbGJhY2tcbiAgICogQHBhcmFtIHtPYmplY3R9IGV2ZW50IC0gVGhlIG1vdXNlIGV2ZW50LlxuICAgKiBAcGFyYW0ge1tOdW1iZXIsIE51bWJlcl19IGV2ZW50LmxuZ0xhdCAtIFRoZSBjb29yZGluYXRlcyBvZiB0aGUgcG9pbnRlclxuICAgKiBAcGFyYW0ge0FycmF5fSBldmVudC5mZWF0dXJlcyAtIFRoZSBmZWF0dXJlcyB1bmRlciB0aGUgcG9pbnRlciwgdXNpbmcgTWFwYm94J3NcbiAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSTpcbiAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAqIFRvIG1ha2UgYSBsYXllciBpbnRlcmFjdGl2ZSwgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgKiBsYXllciBzdHlsZSB0byBgdHJ1ZWAuIFNlZSBNYXBib3gncyBzdHlsZSBzcGVjXG4gICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLXN0eWxlLXNwZWMvI2xheWVyLWludGVyYWN0aXZlXG4gICAqL1xuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogUmFkaXVzIHRvIGRldGVjdCBmZWF0dXJlcyBhcm91bmQgYSBjbGlja2VkIHBvaW50LiBEZWZhdWx0cyB0byAwLiAqL1xuICBjbGlja1JhZGl1czogUHJvcFR5cGVzLm51bWJlcixcblxuICAvKiogQWNjZXNzb3IgdGhhdCByZXR1cm5zIGEgY3Vyc29yIHN0eWxlIHRvIHNob3cgaW50ZXJhY3RpdmUgc3RhdGUgKi9cbiAgZ2V0Q3Vyc29yOiBQcm9wVHlwZXMuZnVuYyxcblxuICAvKiogQWR2YW5jZWQgZmVhdHVyZXMgKi9cbiAgLy8gQ29udHJhaW50cyBmb3IgZGlzcGxheWluZyB0aGUgbWFwLiBJZiBub3QgbWV0LCB0aGVuIHRoZSBtYXAgaXMgaGlkZGVuLlxuICAvLyBFeHBlcmltZW50YWwhIE1heSBiZSBjaGFuZ2VkIGluIG1pbm9yIHZlcnNpb24gdXBkYXRlcy5cbiAgdmlzaWJpbGl0eUNvbnN0cmFpbnRzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIG1pblpvb206IFByb3BUeXBlcy5udW1iZXIsXG4gICAgbWF4Wm9vbTogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtaW5QaXRjaDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBtYXhQaXRjaDogUHJvcFR5cGVzLm51bWJlclxuICB9KSxcbiAgLy8gQSBtYXAgY29udHJvbCBpbnN0YW5jZSB0byByZXBsYWNlIHRoZSBkZWZhdWx0IG1hcCBjb250cm9sc1xuICAvLyBUaGUgb2JqZWN0IG11c3QgZXhwb3NlIG9uZSBwcm9wZXJ0eTogYGV2ZW50c2AgYXMgYW4gYXJyYXkgb2Ygc3Vic2NyaWJlZFxuICAvLyBldmVudCBuYW1lczsgYW5kIHR3byBtZXRob2RzOiBgc2V0U3RhdGUoc3RhdGUpYCBhbmQgYGhhbmRsZShldmVudClgXG4gIG1hcENvbnRyb2xzOiBQcm9wVHlwZXMuc2hhcGUoe1xuICAgIGV2ZW50czogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLnN0cmluZyksXG4gICAgaGFuZGxlRXZlbnQ6IFByb3BUeXBlcy5mdW5jXG4gIH0pXG59KVxuXG5jb25zdCBnZXREZWZhdWx0Q3Vyc29yID0gKHsgaXNEcmFnZ2luZywgaXNIb3ZlcmluZyB9KSA9PlxuICBpc0RyYWdnaW5nXG4gICAgPyBjb25maWcuQ1VSU09SLkdSQUJCSU5HXG4gICAgOiBpc0hvdmVyaW5nID8gY29uZmlnLkNVUlNPUi5QT0lOVEVSIDogY29uZmlnLkNVUlNPUi5HUkFCXG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oXG4gIHt9LFxuICBTdGF0aWNNYXAuZGVmYXVsdFByb3BzLFxuICBNQVBCT1hfTElNSVRTLFxuICBUcmFuc2l0aW9uTWFuYWdlci5kZWZhdWx0UHJvcHMsXG4gIHtcbiAgICBvblZpZXdwb3J0Q2hhbmdlOiBudWxsLFxuICAgIG9uQ2xpY2s6IG51bGwsXG4gICAgb25Ib3ZlcjogbnVsbCxcblxuICAgIHNjcm9sbFpvb206IHRydWUsXG4gICAgZHJhZ1BhbjogdHJ1ZSxcbiAgICBkcmFnUm90YXRlOiB0cnVlLFxuICAgIGRvdWJsZUNsaWNrWm9vbTogdHJ1ZSxcbiAgICB0b3VjaFpvb21Sb3RhdGU6IHRydWUsXG5cbiAgICBjbGlja1JhZGl1czogMCxcbiAgICBnZXRDdXJzb3I6IGdldERlZmF1bHRDdXJzb3IsXG5cbiAgICB2aXNpYmlsaXR5Q29uc3RyYWludHM6IE1BUEJPWF9MSU1JVFNcbiAgfVxuKVxuXG5jb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpLFxuICBpc0RyYWdnaW5nOiBQcm9wVHlwZXMuYm9vbCxcbiAgZXZlbnRNYW5hZ2VyOiBQcm9wVHlwZXMub2JqZWN0XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVyYWN0aXZlTWFwIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIFN0YXRpY01hcC5zdXBwb3J0ZWQoKVxuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcylcbiAgICBhdXRvYmluZCh0aGlzKVxuICAgIC8vIENoZWNrIGZvciBkZXByZWNhdGVkIHByb3BzXG4gICAgZGVwcmVjYXRlV2Fybihwcm9wcylcblxuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgZG93blxuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXG4gICAgICAvLyBXaGV0aGVyIHRoZSBjdXJzb3IgaXMgb3ZlciBhIGNsaWNrYWJsZSBmZWF0dXJlXG4gICAgICBpc0hvdmVyaW5nOiBmYWxzZVxuICAgIH1cblxuICAgIC8vIElmIHByb3BzLm1hcENvbnRyb2xzIGlzIG5vdCBwcm92aWRlZCwgZmFsbGJhY2sgdG8gZGVmYXVsdCBNYXBDb250cm9scyBpbnN0YW5jZVxuICAgIC8vIENhbm5vdCB1c2UgZGVmYXVsdFByb3BzIGhlcmUgYmVjYXVzZSBpdCBuZWVkcyB0byBiZSBwZXIgbWFwIGluc3RhbmNlXG4gICAgdGhpcy5fbWFwQ29udHJvbHMgPSBwcm9wcy5tYXBDb250cm9scyB8fCBuZXcgTWFwQ29udHJvbHMoKVxuXG4gICAgLy8gcHJvdmlkZSBhbiBldmVudE1hbmFnZXIgc3R1YiB1bnRpbCByZWFsIGV2ZW50TWFuYWdlciBjcmVhdGVkXG4gICAgY29uc3QgZXZlbnRNYW5hZ2VyU3R1YiA9IHtcbiAgICAgIHF1ZXVlOiBbXSxcbiAgICAgIG9uKGV2ZW50cywgcmVmKSB7XG4gICAgICAgIHRoaXMucXVldWUucHVzaCh7IGV2ZW50cywgcmVmLCBvbjogdHJ1ZSB9KVxuICAgICAgfSxcbiAgICAgIG9mZihldmVudHMpIHtcbiAgICAgICAgdGhpcy5xdWV1ZS5wdXNoKHsgZXZlbnRzIH0pXG4gICAgICB9LFxuICAgICAgZGVzdHJveSgpIHt9XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRNYW5hZ2VyID0gZXZlbnRNYW5hZ2VyU3R1YlxuICB9XG5cbiAgZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICB2aWV3cG9ydDogbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcyksXG4gICAgICBpc0RyYWdnaW5nOiB0aGlzLnN0YXRlLmlzRHJhZ2dpbmcsXG4gICAgICBldmVudE1hbmFnZXI6IHRoaXMuX2V2ZW50TWFuYWdlclxuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGV2ZW50TWFuYWdlciA9IG5ldyBFdmVudE1hbmFnZXIodGhpcy5fZXZlbnRDYW52YXMsIHtcbiAgICAgIHJpZ2h0QnV0dG9uOiB0cnVlXG4gICAgfSlcblxuICAgIC8vIFJlZ2lzdGVyIGFkZGl0aW9uYWwgZXZlbnQgaGFuZGxlcnMgZm9yIGNsaWNrIGFuZCBob3ZlclxuICAgIGV2ZW50TWFuYWdlci5vbignbW91c2Vtb3ZlJywgdGhpcy5fb25Nb3VzZU1vdmUpXG4gICAgZXZlbnRNYW5hZ2VyLm9uKCdjbGljaycsIHRoaXMuX29uTW91c2VDbGljaylcblxuICAgIC8vIHJ1biBzdHViIHF1ZXVlZCBhY3Rpb25cbiAgICB0aGlzLl9ldmVudE1hbmFnZXIucXVldWUuZm9yRWFjaCgoeyBldmVudHMsIHJlZiwgb24gfSkgPT4ge1xuICAgICAgaWYgKG9uID09PSB0cnVlKSB7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vbihldmVudHMsIHJlZilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGV2ZW50TWFuYWdlci5vZmYoZXZlbnRzKVxuICAgICAgfVxuICAgIH0pXG5cbiAgICB0aGlzLl9ldmVudE1hbmFnZXIgPSBldmVudE1hbmFnZXJcblxuICAgIHRoaXMuX21hcENvbnRyb2xzLnNldE9wdGlvbnMoXG4gICAgICBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCB7XG4gICAgICAgIG9uU3RhdGVDaGFuZ2U6IHRoaXMuX29uSW50ZXJhY3RpdmVTdGF0ZUNoYW5nZSxcbiAgICAgICAgZXZlbnRNYW5hZ2VyXG4gICAgICB9KVxuICAgIClcblxuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyID0gbmV3IFRyYW5zaXRpb25NYW5hZ2VyKHRoaXMucHJvcHMpXG4gIH1cblxuICBjb21wb25lbnRXaWxsVXBkYXRlKG5leHRQcm9wcykge1xuICAgIHRoaXMuX21hcENvbnRyb2xzLnNldE9wdGlvbnMobmV4dFByb3BzKVxuICAgIHRoaXMuX3RyYW5zaXRpb25NYW5hZ2VyLnByb2Nlc3NWaWV3cG9ydENoYW5nZShuZXh0UHJvcHMpXG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICBpZiAodGhpcy5fZXZlbnRNYW5hZ2VyKSB7XG4gICAgICAvLyBNdXN0IGRlc3Ryb3kgYmVjYXVzZSBoYW1tZXIgYWRkcyBldmVudCBsaXN0ZW5lcnMgdG8gd2luZG93XG4gICAgICB0aGlzLl9ldmVudE1hbmFnZXIuZGVzdHJveSgpXG4gICAgfVxuICB9XG5cbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuZ2V0TWFwKClcbiAgfVxuXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgb3B0aW9ucykge1xuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBvcHRpb25zKVxuICB9XG5cbiAgLy8gQ2hlY2tzIGEgdmlzaWJpbGl0eUNvbnN0cmFpbnRzIG9iamVjdCB0byBzZWUgaWYgdGhlIG1hcCBzaG91bGQgYmUgZGlzcGxheWVkXG4gIF9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyhwcm9wcykge1xuICAgIGNvbnN0IGNhcGl0YWxpemUgPSBzID0+IHNbMF0udG9VcHBlckNhc2UoKSArIHMuc2xpY2UoMSlcblxuICAgIGNvbnN0IHsgdmlzaWJpbGl0eUNvbnN0cmFpbnRzIH0gPSBwcm9wc1xuICAgIGZvciAoY29uc3QgcHJvcE5hbWUgaW4gcHJvcHMpIHtcbiAgICAgIGNvbnN0IGNhcGl0YWxpemVkUHJvcE5hbWUgPSBjYXBpdGFsaXplKHByb3BOYW1lKVxuICAgICAgY29uc3QgbWluUHJvcE5hbWUgPSBgbWluJHtjYXBpdGFsaXplZFByb3BOYW1lfWBcbiAgICAgIGNvbnN0IG1heFByb3BOYW1lID0gYG1heCR7Y2FwaXRhbGl6ZWRQcm9wTmFtZX1gXG5cbiAgICAgIGlmIChcbiAgICAgICAgbWluUHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA8IHZpc2liaWxpdHlDb25zdHJhaW50c1ttaW5Qcm9wTmFtZV1cbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgbWF4UHJvcE5hbWUgaW4gdmlzaWJpbGl0eUNvbnN0cmFpbnRzICYmXG4gICAgICAgIHByb3BzW3Byb3BOYW1lXSA+IHZpc2liaWxpdHlDb25zdHJhaW50c1ttYXhQcm9wTmFtZV1cbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIF9nZXRGZWF0dXJlcyh7IHBvcywgcmFkaXVzIH0pIHtcbiAgICBsZXQgZmVhdHVyZXNcbiAgICBpZiAocmFkaXVzKSB7XG4gICAgICAvLyBSYWRpdXMgZW5hYmxlcyBwb2ludCBmZWF0dXJlcywgbGlrZSBtYXJrZXIgc3ltYm9scywgdG8gYmUgY2xpY2tlZC5cbiAgICAgIGNvbnN0IHNpemUgPSByYWRpdXNcbiAgICAgIGNvbnN0IGJib3ggPSBbXG4gICAgICAgIFtwb3NbMF0gLSBzaXplLCBwb3NbMV0gKyBzaXplXSxcbiAgICAgICAgW3Bvc1swXSArIHNpemUsIHBvc1sxXSAtIHNpemVdXG4gICAgICBdXG4gICAgICBmZWF0dXJlcyA9IHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoYmJveClcbiAgICB9IGVsc2Uge1xuICAgICAgZmVhdHVyZXMgPSB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKHBvcylcbiAgICB9XG4gICAgcmV0dXJuIGZlYXR1cmVzXG4gIH1cblxuICBfb25JbnRlcmFjdGl2ZVN0YXRlQ2hhbmdlKHsgaXNEcmFnZ2luZyA9IGZhbHNlIH0pIHtcbiAgICBpZiAoaXNEcmFnZ2luZyAhPT0gdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHsgaXNEcmFnZ2luZyB9KVxuICAgIH1cbiAgfVxuXG4gIC8vIEhPVkVSIEFORCBDTElDS1xuICBfZ2V0UG9zKGV2ZW50KSB7XG4gICAgY29uc3QgeyBvZmZzZXRDZW50ZXI6IHsgeCwgeSB9IH0gPSBldmVudFxuICAgIHJldHVybiBbeCwgeV1cbiAgfVxuXG4gIF9vbk1vdXNlTW92ZShldmVudCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpXG4gICAgICBjb25zdCBmZWF0dXJlcyA9IHRoaXMuX2dldEZlYXR1cmVzKHtcbiAgICAgICAgcG9zLFxuICAgICAgICByYWRpdXM6IHRoaXMucHJvcHMuY2xpY2tSYWRpdXNcbiAgICAgIH0pXG5cbiAgICAgIGNvbnN0IGlzSG92ZXJpbmcgPSBmZWF0dXJlcyAmJiBmZWF0dXJlcy5sZW5ndGggPiAwXG4gICAgICBpZiAoaXNIb3ZlcmluZyAhPT0gdGhpcy5zdGF0ZS5pc0hvdmVyaW5nKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBpc0hvdmVyaW5nIH0pXG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnByb3BzLm9uSG92ZXIpIHtcbiAgICAgICAgY29uc3Qgdmlld3BvcnQgPSBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKVxuICAgICAgICBldmVudC5sbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QocG9zKVxuICAgICAgICBldmVudC5mZWF0dXJlcyA9IGZlYXR1cmVzXG5cbiAgICAgICAgdGhpcy5wcm9wcy5vbkhvdmVyKGV2ZW50KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9vbk1vdXNlQ2xpY2soZXZlbnQpIHtcbiAgICBpZiAodGhpcy5wcm9wcy5vbkNsaWNrKSB7XG4gICAgICBjb25zdCBwb3MgPSB0aGlzLl9nZXRQb3MoZXZlbnQpXG4gICAgICBjb25zdCB2aWV3cG9ydCA9IG5ldyBXZWJNZXJjYXRvclZpZXdwb3J0KHRoaXMucHJvcHMpXG4gICAgICBldmVudC5sbmdMYXQgPSB2aWV3cG9ydC51bnByb2plY3QocG9zKVxuICAgICAgZXZlbnQuZmVhdHVyZXMgPSB0aGlzLl9nZXRGZWF0dXJlcyh7XG4gICAgICAgIHBvcyxcbiAgICAgICAgcmFkaXVzOiB0aGlzLnByb3BzLmNsaWNrUmFkaXVzXG4gICAgICB9KVxuXG4gICAgICB0aGlzLnByb3BzLm9uQ2xpY2soZXZlbnQpXG4gICAgfVxuICB9XG5cbiAgX2V2ZW50Q2FudmFzTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX2V2ZW50Q2FudmFzID0gcmVmXG4gIH1cblxuICBfc3RhdGljTWFwTG9hZGVkKHJlZikge1xuICAgIHRoaXMuX21hcCA9IHJlZlxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCwgZ2V0Q3Vyc29yIH0gPSB0aGlzLnByb3BzXG5cbiAgICBjb25zdCBldmVudENhbnZhc1N0eWxlID0ge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICAgIGN1cnNvcjogZ2V0Q3Vyc29yKHRoaXMuc3RhdGUpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNyZWF0ZUVsZW1lbnQoXG4gICAgICAnZGl2JyxcbiAgICAgIHtcbiAgICAgICAga2V5OiAnbWFwLWNvbnRyb2xzJyxcbiAgICAgICAgcmVmOiB0aGlzLl9ldmVudENhbnZhc0xvYWRlZCxcbiAgICAgICAgc3R5bGU6IGV2ZW50Q2FudmFzU3R5bGVcbiAgICAgIH0sXG4gICAgICBjcmVhdGVFbGVtZW50KFxuICAgICAgICBTdGF0aWNNYXAsXG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAge30sXG4gICAgICAgICAgdGhpcy5wcm9wcyxcbiAgICAgICAgICB0aGlzLl90cmFuc2l0aW9uTWFuYWdlciAmJlxuICAgICAgICAgICAgdGhpcy5fdHJhbnNpdGlvbk1hbmFnZXIuZ2V0Vmlld3BvcnRJblRyYW5zaXRpb24oKSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB2aXNpYmxlOiB0aGlzLl9jaGVja1Zpc2liaWxpdHlDb25zdHJhaW50cyh0aGlzLnByb3BzKSxcbiAgICAgICAgICAgIHJlZjogdGhpcy5fc3RhdGljTWFwTG9hZGVkLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICB9XG4gICAgICAgIClcbiAgICAgIClcbiAgICApXG4gIH1cbn1cblxuSW50ZXJhY3RpdmVNYXAuZGlzcGxheU5hbWUgPSAnSW50ZXJhY3RpdmVNYXAnXG5JbnRlcmFjdGl2ZU1hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXNcbkludGVyYWN0aXZlTWFwLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wc1xuSW50ZXJhY3RpdmVNYXAuY2hpbGRDb250ZXh0VHlwZXMgPSBjaGlsZENvbnRleHRUeXBlc1xuIl19