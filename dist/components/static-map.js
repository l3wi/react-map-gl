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

var _styleUtils = require('../utils/style-utils');

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

var _mapbox = require('../mapbox/mapbox');

var _mapbox2 = _interopRequireDefault(_mapbox);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens'; // Copyright (c) 2015 Uber Technologies, Inc.

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

var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;

var propTypes = (0, _assign2.default)({}, _mapbox2.default.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: _propTypes2.default.oneOfType([_propTypes2.default.string, _propTypes2.default.instanceOf(_immutable2.default.Map)]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: _propTypes2.default.bool,
  /** Whether the map is visible */
  visible: _propTypes2.default.bool
});

var defaultProps = (0, _assign2.default)({}, _mapbox2.default.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: _propTypes2.default.instanceOf(_viewportMercatorProject2.default)
};

var StaticMap = function (_PureComponent) {
  (0, _inherits3.default)(StaticMap, _PureComponent);
  (0, _createClass3.default)(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return _mapbox2.default && _mapbox2.default.supported();
    }
  }]);

  function StaticMap(props) {
    (0, _classCallCheck3.default)(this, StaticMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (StaticMap.__proto__ || (0, _getPrototypeOf2.default)(StaticMap)).call(this, props));

    _this._queryParams = {};
    if (!StaticMap.supported()) {
      _this.componentDidMount = noop;
      _this.componentWillReceiveProps = noop;
      _this.componentDidUpdate = noop;
      _this.componentWillUnmount = noop;
    }
    _this.state = {
      accessTokenInvalid: false
    };
    (0, _autobind2.default)(_this);
    return _this;
  }

  (0, _createClass3.default)(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new _viewportMercatorProject2.default(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;


      this._mapbox = new _mapbox2.default((0, _assign2.default)({}, this.props, {
        container: this._mapboxMap,
        onError: this._mapboxMapError,
        mapStyle: _immutable2.default.Map.isMap(mapStyle) ? mapStyle.toJS() : mapStyle
      }));
      this._map = this._mapbox.getMap();
      this._updateQueryParams(mapStyle);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this._mapbox.setProps(newProps);
      this._updateMapStyle(this.props, newProps);

      // this._updateMapViewport(this.props, newProps);

      // Save width/height so that we can check them in componentDidUpdate
      this.setState({
        width: this.props.width,
        height: this.props.height
      });
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      // Since Mapbox's map.resize() reads size from DOM
      // we must wait to read size until after render (i.e. here in "didUpdate")
      this._updateMapSize(this.state, this.props);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._mapbox.finalize();
      this._mapbox = null;
      this._map = null;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    /** Uses Mapbox's
      * queryRenderedFeatures API to find features at point or in a bounding box.
      * https://www.mapbox.com/mapbox-gl-js/api/#Map#queryRenderedFeatures
      * To query only some of the layers, set the `interactive` property in the
      * layer style to `true`.
      * @param {[Number, Number]|[[Number, Number], [Number, Number]]} geometry -
      *   Point or an array of two points defining the bounding box
      * @param {Object} parameters - query options
      */

  }, {
    key: 'queryRenderedFeatures',
    value: function queryRenderedFeatures(geometry, parameters) {
      var queryParams = parameters || this._queryParams;
      if (queryParams.layers && queryParams.layers.length === 0) {
        return [];
      }
      return this._map.queryRenderedFeatures(geometry, queryParams);
    }

    // Hover and click only query layers whose interactive property is true

  }, {
    key: '_updateQueryParams',
    value: function _updateQueryParams(mapStyle) {
      var interactiveLayerIds = (0, _styleUtils.getInteractiveLayerIds)(mapStyle);
      this._queryParams = { layers: interactiveLayerIds };
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;

      if (sizeChanged) {
        this._map.resize();
        // this._callOnChangeViewport(this._map.transform);
      }
    }
  }, {
    key: '_updateMapStyle',
    value: function _updateMapStyle(oldProps, newProps) {
      var mapStyle = newProps.mapStyle;
      var oldMapStyle = oldProps.mapStyle;
      if (mapStyle !== oldMapStyle) {
        if (_immutable2.default.Map.isMap(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            (0, _styleUtils.setDiffStyle)(oldMapStyle, mapStyle, this._map);
          }
        } else {
          this._map.setStyle(mapStyle);
        }
        this._updateQueryParams(mapStyle);
      }
    }
  }, {
    key: '_mapboxMapLoaded',
    value: function _mapboxMapLoaded(ref) {
      this._mapboxMap = ref;
    }

    // Handle map error

  }, {
    key: '_mapboxMapError',
    value: function _mapboxMapError(evt) {
      var statusCode = evt.error && evt.error.status || evt.status;
      if (statusCode === UNAUTHORIZED_ERROR_CODE && !this.state.accessTokenInvalid) {
        // Mapbox throws unauthorized error - invalid token
        console.error(NO_TOKEN_WARNING); // eslint-disable-line
        this.setState({ accessTokenInvalid: true });
      }
    }
  }, {
    key: '_renderNoTokenWarning',
    value: function _renderNoTokenWarning() {
      if (this.state.accessTokenInvalid) {
        var style = {
          position: 'absolute',
          left: 0,
          top: 0
        };
        return (0, _react.createElement)('div', { key: 'warning', id: 'no-token-warning', style: style }, [(0, _react.createElement)('h3', { key: 'header' }, NO_TOKEN_WARNING), (0, _react.createElement)('div', { key: 'text' }, 'For information on setting up your basemap, read'), (0, _react.createElement)('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
      }

      return null;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          className = _props.className,
          width = _props.width,
          height = _props.height,
          style = _props.style,
          visible = _props.visible;

      var mapContainerStyle = (0, _assign2.default)({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = (0, _assign2.default)({}, style, {
        width: width,
        height: height,
        visibility: visible ? 'visible' : 'hidden'
      });
      var overlayContainerStyle = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: width,
        height: height,
        overflow: 'hidden'
      };

      // Note: a static map still handles clicks and hover events
      return (0, _react.createElement)('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [(0, _react.createElement)('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), (0, _react.createElement)('div', {
          key: 'map-overlays',
          // Same as interactive map's overlay container
          className: 'overlays',
          style: overlayContainerStyle,
          children: this.props.children
        }), this._renderNoTokenWarning()]
      });
    }
  }]);
  return StaticMap;
}(_react.PureComponent);

exports.default = StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiVE9LRU5fRE9DX1VSTCIsIk5PX1RPS0VOX1dBUk5JTkciLCJub29wIiwiVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUiLCJwcm9wVHlwZXMiLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsImluc3RhbmNlT2YiLCJNYXAiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwiYm9vbCIsInZpc2libGUiLCJkZWZhdWx0UHJvcHMiLCJjaGlsZENvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiU3RhdGljTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJfcXVlcnlQYXJhbXMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJjb21wb25lbnREaWRVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0YXRlIiwiYWNjZXNzVG9rZW5JbnZhbGlkIiwiX21hcGJveCIsImNvbnRhaW5lciIsIl9tYXBib3hNYXAiLCJvbkVycm9yIiwiX21hcGJveE1hcEVycm9yIiwiaXNNYXAiLCJ0b0pTIiwiX21hcCIsImdldE1hcCIsIl91cGRhdGVRdWVyeVBhcmFtcyIsIm5ld1Byb3BzIiwic2V0UHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiX3VwZGF0ZU1hcFNpemUiLCJmaW5hbGl6ZSIsImdlb21ldHJ5IiwicGFyYW1ldGVycyIsInF1ZXJ5UGFyYW1zIiwibGF5ZXJzIiwibGVuZ3RoIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsIm9sZFByb3BzIiwic2l6ZUNoYW5nZWQiLCJyZXNpemUiLCJvbGRNYXBTdHlsZSIsInNldFN0eWxlIiwicmVmIiwiZXZ0Iiwic3RhdHVzQ29kZSIsImVycm9yIiwic3RhdHVzIiwiY29uc29sZSIsInN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwia2V5IiwiaWQiLCJocmVmIiwiY2xhc3NOYW1lIiwibWFwQ29udGFpbmVyU3R5bGUiLCJ2aXNpYmlsaXR5Iiwib3ZlcmxheUNvbnRhaW5lclN0eWxlIiwib3ZlcmZsb3ciLCJjaGlsZHJlbiIsIl9tYXBib3hNYXBMb2FkZWQiLCJfcmVuZGVyTm9Ub2tlbldhcm5pbmciLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBbUJBOztBQUNBOzs7O0FBQ0E7Ozs7QUFFQTs7QUFDQTs7OztBQUVBOzs7O0FBRUE7Ozs7OztBQUVBO0FBQ0EsSUFBTUEsZ0JBQWdCLHlGQUF0QixDLENBL0JBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQWNBLElBQU1DLG1CQUFtQix5REFBekI7QUFDQTs7QUFFQSxTQUFTQyxJQUFULEdBQWdCLENBQUU7O0FBRWxCLElBQU1DLDBCQUEwQixHQUFoQzs7QUFFQSxJQUFNQyxZQUFZLHNCQUFjLEVBQWQsRUFBa0IsaUJBQU9BLFNBQXpCLEVBQW9DO0FBQ3BEO0FBQ0FDLFlBQVUsb0JBQVVDLFNBQVYsQ0FBb0IsQ0FDNUIsb0JBQVVDLE1BRGtCLEVBRTVCLG9CQUFVQyxVQUFWLENBQXFCLG9CQUFVQyxHQUEvQixDQUY0QixDQUFwQixDQUYwQztBQU1wRDtBQUNBQyx1QkFBcUIsb0JBQVVDLElBUHFCO0FBUXBEO0FBQ0FDLFdBQVMsb0JBQVVEO0FBVGlDLENBQXBDLENBQWxCOztBQVlBLElBQU1FLGVBQWUsc0JBQWMsRUFBZCxFQUFrQixpQkFBT0EsWUFBekIsRUFBdUM7QUFDMURSLFlBQVUsaUNBRGdEO0FBRTFESyx1QkFBcUIsS0FGcUM7QUFHMURFLFdBQVM7QUFIaUQsQ0FBdkMsQ0FBckI7O0FBTUEsSUFBTUUsb0JBQW9CO0FBQ3hCQyxZQUFVLG9CQUFVUCxVQUFWO0FBRGMsQ0FBMUI7O0lBSXFCUSxTOzs7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SixlQUFPUSxpQkFGWTtBQUduQkksa0JBQVUsQ0FDUiwwQkFBYyxLQUFkLEVBQXFCO0FBQ25CUixlQUFLLFlBRGM7QUFFbkJWLGVBQUssS0FBS21CLGdCQUZTO0FBR25CYixpQkFBT3pELFFBSFk7QUFJbkJnRTtBQUptQixTQUFyQixDQURRLEVBT1IsMEJBQWMsS0FBZCxFQUFxQjtBQUNuQkgsZUFBSyxjQURjO0FBRW5CO0FBQ0FHLHFCQUFXLFVBSFE7QUFJbkJQLGlCQUFPVSxxQkFKWTtBQUtuQkUsb0JBQVUsS0FBS3hELEtBQUwsQ0FBV3dEO0FBTEYsU0FBckIsQ0FQUSxFQWNSLEtBQUtFLHFCQUFMLEVBZFE7QUFIUyxPQUFyQixDQURGO0FBc0JEOzs7OztrQkFoTWtCNUQsUzs7O0FBbU1yQkEsVUFBVTZELFdBQVYsR0FBd0IsV0FBeEI7QUFDQTdELFVBQVVaLFNBQVYsR0FBc0JBLFNBQXRCO0FBQ0FZLFVBQVVILFlBQVYsR0FBeUJBLFlBQXpCO0FBQ0FHLFVBQVVGLGlCQUFWLEdBQThCQSxpQkFBOUIiLCJmaWxlIjoic3RhdGljLW1hcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG5cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cblxuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5pbXBvcnQge1B1cmVDb21wb25lbnQsIGNyZWF0ZUVsZW1lbnR9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnLi4vdXRpbHMvYXV0b2JpbmQnO1xuXG5pbXBvcnQge2dldEludGVyYWN0aXZlTGF5ZXJJZHMsIHNldERpZmZTdHlsZX0gZnJvbSAnLi4vdXRpbHMvc3R5bGUtdXRpbHMnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuXG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICd2aWV3cG9ydC1tZXJjYXRvci1wcm9qZWN0JztcblxuaW1wb3J0IE1hcGJveCBmcm9tICcuLi9tYXBib3gvbWFwYm94JztcblxuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuY29uc3QgVE9LRU5fRE9DX1VSTCA9ICdodHRwczovL3ViZXIuZ2l0aHViLmlvL3JlYWN0LW1hcC1nbC8jL0RvY3VtZW50YXRpb24vZ2V0dGluZy1zdGFydGVkL2Fib3V0LW1hcGJveC10b2tlbnMnO1xuY29uc3QgTk9fVE9LRU5fV0FSTklORyA9ICdBIHZhbGlkIEFQSSBhY2Nlc3MgdG9rZW4gaXMgcmVxdWlyZWQgdG8gdXNlIE1hcGJveCBkYXRhJztcbi8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmNvbnN0IFVOQVVUSE9SSVpFRF9FUlJPUl9DT0RFID0gNDAxO1xuXG5jb25zdCBwcm9wVHlwZXMgPSBPYmplY3QuYXNzaWduKHt9LCBNYXBib3gucHJvcFR5cGVzLCB7XG4gIC8qKiBUaGUgTWFwYm94IHN0eWxlLiBBIHN0cmluZyB1cmwgb3IgYSBNYXBib3hHTCBzdHlsZSBJbW11dGFibGUuTWFwIG9iamVjdC4gKi9cbiAgbWFwU3R5bGU6IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgIFByb3BUeXBlcy5zdHJpbmcsXG4gICAgUHJvcFR5cGVzLmluc3RhbmNlT2YoSW1tdXRhYmxlLk1hcClcbiAgXSksXG4gIC8qKiBUaGVyZSBhcmUga25vd24gaXNzdWVzIHdpdGggc3R5bGUgZGlmZmluZy4gQXMgc3RvcGdhcCwgYWRkIG9wdGlvbiB0byBwcmV2ZW50IHN0eWxlIGRpZmZpbmcuICovXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IFByb3BUeXBlcy5ib29sLFxuICAvKiogV2hldGhlciB0aGUgbWFwIGlzIHZpc2libGUgKi9cbiAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2xcbn0pO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBNYXBib3guZGVmYXVsdFByb3BzLCB7XG4gIG1hcFN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12OCcsXG4gIHByZXZlbnRTdHlsZURpZmZpbmc6IGZhbHNlLFxuICB2aXNpYmxlOiB0cnVlXG59KTtcblxuY29uc3QgY2hpbGRDb250ZXh0VHlwZXMgPSB7XG4gIHZpZXdwb3J0OiBQcm9wVHlwZXMuaW5zdGFuY2VPZihXZWJNZXJjYXRvclZpZXdwb3J0KVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3RhdGljTWFwIGV4dGVuZHMgUHVyZUNvbXBvbmVudCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIE1hcGJveCAmJiBNYXBib3guc3VwcG9ydGVkKCk7XG4gIH1cblxuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHt9O1xuICAgIGlmICghU3RhdGljTWFwLnN1cHBvcnRlZCgpKSB7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZE1vdW50ID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudERpZFVwZGF0ZSA9IG5vb3A7XG4gICAgICB0aGlzLmNvbXBvbmVudFdpbGxVbm1vdW50ID0gbm9vcDtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGFjY2Vzc1Rva2VuSW52YWxpZDogZmFsc2VcbiAgICB9O1xuICAgIGF1dG9iaW5kKHRoaXMpO1xuICB9XG5cbiAgZ2V0Q2hpbGRDb250ZXh0KCkge1xuICAgIHJldHVybiB7XG4gICAgICB2aWV3cG9ydDogbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQodGhpcy5wcm9wcylcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3Qge21hcFN0eWxlfSA9IHRoaXMucHJvcHM7XG5cbiAgICB0aGlzLl9tYXBib3ggPSBuZXcgTWFwYm94KE9iamVjdC5hc3NpZ24oe30sIHRoaXMucHJvcHMsIHtcbiAgICAgIGNvbnRhaW5lcjogdGhpcy5fbWFwYm94TWFwLFxuICAgICAgb25FcnJvcjogdGhpcy5fbWFwYm94TWFwRXJyb3IsXG4gICAgICBtYXBTdHlsZTogSW1tdXRhYmxlLk1hcC5pc01hcChtYXBTdHlsZSkgPyBtYXBTdHlsZS50b0pTKCkgOiBtYXBTdHlsZVxuICAgIH0pKTtcbiAgICB0aGlzLl9tYXAgPSB0aGlzLl9tYXBib3guZ2V0TWFwKCk7XG4gICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXdQcm9wcykge1xuICAgIHRoaXMuX21hcGJveC5zZXRQcm9wcyhuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU3R5bGUodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gdGhpcy5fdXBkYXRlTWFwVmlld3BvcnQodGhpcy5wcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgLy8gU2F2ZSB3aWR0aC9oZWlnaHQgc28gdGhhdCB3ZSBjYW4gY2hlY2sgdGhlbSBpbiBjb21wb25lbnREaWRVcGRhdGVcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpZHRoOiB0aGlzLnByb3BzLndpZHRoLFxuICAgICAgaGVpZ2h0OiB0aGlzLnByb3BzLmhlaWdodFxuICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xuICAgIC8vIFNpbmNlIE1hcGJveCdzIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NXG4gICAgLy8gd2UgbXVzdCB3YWl0IHRvIHJlYWQgc2l6ZSB1bnRpbCBhZnRlciByZW5kZXIgKGkuZS4gaGVyZSBpbiBcImRpZFVwZGF0ZVwiKVxuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUodGhpcy5zdGF0ZSwgdGhpcy5wcm9wcyk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICB0aGlzLl9tYXBib3guZmluYWxpemUoKTtcbiAgICB0aGlzLl9tYXBib3ggPSBudWxsO1xuICAgIHRoaXMuX21hcCA9IG51bGw7XG4gIH1cblxuICAvLyBFeHRlcm5hbCBhcHBzIGNhbiBhY2Nlc3MgbWFwIHRoaXMgd2F5XG4gIGdldE1hcCgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwO1xuICB9XG5cbiAgLyoqIFVzZXMgTWFwYm94J3NcbiAgICAqIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyBBUEkgdG8gZmluZCBmZWF0dXJlcyBhdCBwb2ludCBvciBpbiBhIGJvdW5kaW5nIGJveC5cbiAgICAqIGh0dHBzOi8vd3d3Lm1hcGJveC5jb20vbWFwYm94LWdsLWpzL2FwaS8jTWFwI3F1ZXJ5UmVuZGVyZWRGZWF0dXJlc1xuICAgICogVG8gcXVlcnkgb25seSBzb21lIG9mIHRoZSBsYXllcnMsIHNldCB0aGUgYGludGVyYWN0aXZlYCBwcm9wZXJ0eSBpbiB0aGVcbiAgICAqIGxheWVyIHN0eWxlIHRvIGB0cnVlYC5cbiAgICAqIEBwYXJhbSB7W051bWJlciwgTnVtYmVyXXxbW051bWJlciwgTnVtYmVyXSwgW051bWJlciwgTnVtYmVyXV19IGdlb21ldHJ5IC1cbiAgICAqICAgUG9pbnQgb3IgYW4gYXJyYXkgb2YgdHdvIHBvaW50cyBkZWZpbmluZyB0aGUgYm91bmRpbmcgYm94XG4gICAgKiBAcGFyYW0ge09iamVjdH0gcGFyYW1ldGVycyAtIHF1ZXJ5IG9wdGlvbnNcbiAgICAqL1xuICBxdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIHBhcmFtZXRlcnMpIHtcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IHBhcmFtZXRlcnMgfHwgdGhpcy5fcXVlcnlQYXJhbXM7XG4gICAgaWYgKHF1ZXJ5UGFyYW1zLmxheWVycyAmJiBxdWVyeVBhcmFtcy5sYXllcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGdlb21ldHJ5LCBxdWVyeVBhcmFtcyk7XG4gIH1cblxuICAvLyBIb3ZlciBhbmQgY2xpY2sgb25seSBxdWVyeSBsYXllcnMgd2hvc2UgaW50ZXJhY3RpdmUgcHJvcGVydHkgaXMgdHJ1ZVxuICBfdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpIHtcbiAgICBjb25zdCBpbnRlcmFjdGl2ZUxheWVySWRzID0gZ2V0SW50ZXJhY3RpdmVMYXllcklkcyhtYXBTdHlsZSk7XG4gICAgdGhpcy5fcXVlcnlQYXJhbXMgPSB7bGF5ZXJzOiBpbnRlcmFjdGl2ZUxheWVySWRzfTtcbiAgfVxuXG4gIC8vIE5vdGU6IG5lZWRzIHRvIGJlIGNhbGxlZCBhZnRlciByZW5kZXIgKGUuZy4gaW4gY29tcG9uZW50RGlkVXBkYXRlKVxuICBfdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBzaXplQ2hhbmdlZCA9XG4gICAgICBvbGRQcm9wcy53aWR0aCAhPT0gbmV3UHJvcHMud2lkdGggfHwgb2xkUHJvcHMuaGVpZ2h0ICE9PSBuZXdQcm9wcy5oZWlnaHQ7XG5cbiAgICBpZiAoc2l6ZUNoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICAgIC8vIHRoaXMuX2NhbGxPbkNoYW5nZVZpZXdwb3J0KHRoaXMuX21hcC50cmFuc2Zvcm0pO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVNYXBTdHlsZShvbGRQcm9wcywgbmV3UHJvcHMpIHtcbiAgICBjb25zdCBtYXBTdHlsZSA9IG5ld1Byb3BzLm1hcFN0eWxlO1xuICAgIGNvbnN0IG9sZE1hcFN0eWxlID0gb2xkUHJvcHMubWFwU3R5bGU7XG4gICAgaWYgKG1hcFN0eWxlICE9PSBvbGRNYXBTdHlsZSkge1xuICAgICAgaWYgKEltbXV0YWJsZS5NYXAuaXNNYXAobWFwU3R5bGUpKSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLnByZXZlbnRTdHlsZURpZmZpbmcpIHtcbiAgICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUudG9KUygpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXREaWZmU3R5bGUob2xkTWFwU3R5bGUsIG1hcFN0eWxlLCB0aGlzLl9tYXApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9tYXAuc2V0U3R5bGUobWFwU3R5bGUpO1xuICAgICAgfVxuICAgICAgdGhpcy5fdXBkYXRlUXVlcnlQYXJhbXMobWFwU3R5bGUpO1xuICAgIH1cbiAgfVxuXG4gIF9tYXBib3hNYXBMb2FkZWQocmVmKSB7XG4gICAgdGhpcy5fbWFwYm94TWFwID0gcmVmO1xuICB9XG5cbiAgLy8gSGFuZGxlIG1hcCBlcnJvclxuICBfbWFwYm94TWFwRXJyb3IoZXZ0KSB7XG4gICAgY29uc3Qgc3RhdHVzQ29kZSA9IGV2dC5lcnJvciAmJiBldnQuZXJyb3Iuc3RhdHVzIHx8IGV2dC5zdGF0dXM7XG4gICAgaWYgKHN0YXR1c0NvZGUgPT09IFVOQVVUSE9SSVpFRF9FUlJPUl9DT0RFICYmICF0aGlzLnN0YXRlLmFjY2Vzc1Rva2VuSW52YWxpZCkge1xuICAgICAgLy8gTWFwYm94IHRocm93cyB1bmF1dGhvcml6ZWQgZXJyb3IgLSBpbnZhbGlkIHRva2VuXG4gICAgICBjb25zb2xlLmVycm9yKE5PX1RPS0VOX1dBUk5JTkcpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICB0aGlzLnNldFN0YXRlKHthY2Nlc3NUb2tlbkludmFsaWQ6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICBfcmVuZGVyTm9Ub2tlbldhcm5pbmcoKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuYWNjZXNzVG9rZW5JbnZhbGlkKSB7XG4gICAgICBjb25zdCBzdHlsZSA9IHtcbiAgICAgICAgcG9zaXRpb246ICdhYnNvbHV0ZScsXG4gICAgICAgIGxlZnQ6IDAsXG4gICAgICAgIHRvcDogMFxuICAgICAgfTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd3YXJuaW5nJywgaWQ6ICduby10b2tlbi13YXJuaW5nJywgc3R5bGV9LCBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnaDMnLCB7a2V5OiAnaGVhZGVyJ30sIE5PX1RPS0VOX1dBUk5JTkcpLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtrZXk6ICd0ZXh0J30sICdGb3IgaW5mb3JtYXRpb24gb24gc2V0dGluZyB1cCB5b3VyIGJhc2VtYXAsIHJlYWQnKSxcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdhJywge2tleTogJ2xpbmsnLCBocmVmOiBUT0tFTl9ET0NfVVJMfSwgJ05vdGUgb24gTWFwIFRva2VucycpXG4gICAgICAgIF0pXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtjbGFzc05hbWUsIHdpZHRoLCBoZWlnaHQsIHN0eWxlLCB2aXNpYmxlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgbWFwQ29udGFpbmVyU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge3dpZHRoLCBoZWlnaHQsIHBvc2l0aW9uOiAncmVsYXRpdmUnfSk7XG4gICAgY29uc3QgbWFwU3R5bGUgPSBPYmplY3QuYXNzaWduKHt9LCBzdHlsZSwge1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB2aXNpYmlsaXR5OiB2aXNpYmxlID8gJ3Zpc2libGUnIDogJ2hpZGRlbidcbiAgICB9KTtcbiAgICBjb25zdCBvdmVybGF5Q29udGFpbmVyU3R5bGUgPSB7XG4gICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgIGxlZnQ6IDAsXG4gICAgICB0b3A6IDAsXG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIG92ZXJmbG93OiAnaGlkZGVuJ1xuICAgIH07XG5cbiAgICAvLyBOb3RlOiBhIHN0YXRpYyBtYXAgc3RpbGwgaGFuZGxlcyBjbGlja3MgYW5kIGhvdmVyIGV2ZW50c1xuICAgIHJldHVybiAoXG4gICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgIGtleTogJ21hcC1jb250YWluZXInLFxuICAgICAgICBzdHlsZTogbWFwQ29udGFpbmVyU3R5bGUsXG4gICAgICAgIGNoaWxkcmVuOiBbXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAga2V5OiAnbWFwLW1hcGJveCcsXG4gICAgICAgICAgICByZWY6IHRoaXMuX21hcGJveE1hcExvYWRlZCxcbiAgICAgICAgICAgIHN0eWxlOiBtYXBTdHlsZSxcbiAgICAgICAgICAgIGNsYXNzTmFtZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAgICAgIGtleTogJ21hcC1vdmVybGF5cycsXG4gICAgICAgICAgICAvLyBTYW1lIGFzIGludGVyYWN0aXZlIG1hcCdzIG92ZXJsYXkgY29udGFpbmVyXG4gICAgICAgICAgICBjbGFzc05hbWU6ICdvdmVybGF5cycsXG4gICAgICAgICAgICBzdHlsZTogb3ZlcmxheUNvbnRhaW5lclN0eWxlLFxuICAgICAgICAgICAgY2hpbGRyZW46IHRoaXMucHJvcHMuY2hpbGRyZW5cbiAgICAgICAgICB9KSxcbiAgICAgICAgICB0aGlzLl9yZW5kZXJOb1Rva2VuV2FybmluZygpXG4gICAgICAgIF1cbiAgICAgIH0pXG4gICAgKTtcbiAgfVxufVxuXG5TdGF0aWNNYXAuZGlzcGxheU5hbWUgPSAnU3RhdGljTWFwJztcblN0YXRpY01hcC5wcm9wVHlwZXMgPSBwcm9wVHlwZXM7XG5TdGF0aWNNYXAuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuU3RhdGljTWFwLmNoaWxkQ29udGV4dFR5cGVzID0gY2hpbGRDb250ZXh0VHlwZXM7XG4iXX0=