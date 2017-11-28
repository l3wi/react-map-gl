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
import { PureComponent, createElement } from 'react';
import PropTypes from 'prop-types';
import autobind from '../utils/autobind';

import { getInteractiveLayerIds, setDiffStyle } from '../utils/style-utils';
import Immutable from 'immutable';

import WebMercatorViewport from 'viewport-mercator-project';

import Mapbox from '../mapbox/mapbox';

/* eslint-disable max-len */
var TOKEN_DOC_URL = 'https://uber.github.io/react-map-gl/#/Documentation/getting-started/about-mapbox-tokens';
var NO_TOKEN_WARNING = 'A valid API access token is required to use Mapbox data';
/* eslint-disable max-len */

function noop() {}

var UNAUTHORIZED_ERROR_CODE = 401;

var propTypes = Object.assign({}, Mapbox.propTypes, {
  /** The Mapbox style. A string url or a MapboxGL style Immutable.Map object. */
  mapStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Immutable.Map)]),
  /** There are known issues with style diffing. As stopgap, add option to prevent style diffing. */
  preventStyleDiffing: PropTypes.bool,
  /** Whether the map is visible */
  visible: PropTypes.bool
});

var defaultProps = Object.assign({}, Mapbox.defaultProps, {
  mapStyle: 'mapbox://styles/mapbox/light-v8',
  preventStyleDiffing: false,
  visible: true
});

var childContextTypes = {
  viewport: PropTypes.instanceOf(WebMercatorViewport)
};

var StaticMap = function (_PureComponent) {
  _inherits(StaticMap, _PureComponent);

  _createClass(StaticMap, null, [{
    key: 'supported',
    value: function supported() {
      return Mapbox && Mapbox.supported();
    }
  }]);

  function StaticMap(props) {
    _classCallCheck(this, StaticMap);

    var _this = _possibleConstructorReturn(this, (StaticMap.__proto__ || Object.getPrototypeOf(StaticMap)).call(this, props));

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
    autobind(_this);
    return _this;
  }

  _createClass(StaticMap, [{
    key: 'getChildContext',
    value: function getChildContext() {
      return {
        viewport: new WebMercatorViewport(this.props)
      };
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var mapStyle = this.props.mapStyle;


      this._mapbox = new Mapbox(Object.assign({}, this.props, {
        container: this._mapboxMap,
        onError: this._mapboxMapError,
        mapStyle: Immutable.Map.isMap(mapStyle) ? mapStyle.toJS() : mapStyle
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
      var interactiveLayerIds = getInteractiveLayerIds(mapStyle);
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
        if (Immutable.Map.isMap(mapStyle)) {
          if (this.props.preventStyleDiffing) {
            this._map.setStyle(mapStyle.toJS());
          } else {
            setDiffStyle(oldMapStyle, mapStyle, this._map);
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
        return createElement('div', { key: 'warning', id: 'no-token-warning', style: style }, [createElement('h3', { key: 'header' }, NO_TOKEN_WARNING), createElement('div', { key: 'text' }, 'For information on setting up your basemap, read'), createElement('a', { key: 'link', href: TOKEN_DOC_URL }, 'Note on Map Tokens')]);
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

      var mapContainerStyle = Object.assign({}, style, { width: width, height: height, position: 'relative' });
      var mapStyle = Object.assign({}, style, {
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
      return createElement('div', {
        key: 'map-container',
        style: mapContainerStyle,
        children: [createElement('div', {
          key: 'map-mapbox',
          ref: this._mapboxMapLoaded,
          style: mapStyle,
          className: className
        }), createElement('div', {
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
}(PureComponent);

export default StaticMap;


StaticMap.displayName = 'StaticMap';
StaticMap.propTypes = propTypes;
StaticMap.defaultProps = defaultProps;
StaticMap.childContextTypes = childContextTypes;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL3N0YXRpYy1tYXAuanMiXSwibmFtZXMiOlsiUHVyZUNvbXBvbmVudCIsImNyZWF0ZUVsZW1lbnQiLCJQcm9wVHlwZXMiLCJhdXRvYmluZCIsImdldEludGVyYWN0aXZlTGF5ZXJJZHMiLCJzZXREaWZmU3R5bGUiLCJJbW11dGFibGUiLCJXZWJNZXJjYXRvclZpZXdwb3J0IiwiTWFwYm94IiwiVE9LRU5fRE9DX1VSTCIsIk5PX1RPS0VOX1dBUk5JTkciLCJub29wIiwiVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUiLCJwcm9wVHlwZXMiLCJPYmplY3QiLCJhc3NpZ24iLCJtYXBTdHlsZSIsIm9uZU9mVHlwZSIsInN0cmluZyIsImluc3RhbmNlT2YiLCJNYXAiLCJwcmV2ZW50U3R5bGVEaWZmaW5nIiwiYm9vbCIsInZpc2libGUiLCJkZWZhdWx0UHJvcHMiLCJjaGlsZENvbnRleHRUeXBlcyIsInZpZXdwb3J0IiwiU3RhdGljTWFwIiwic3VwcG9ydGVkIiwicHJvcHMiLCJfcXVlcnlQYXJhbXMiLCJjb21wb25lbnREaWRNb3VudCIsImNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMiLCJjb21wb25lbnREaWRVcGRhdGUiLCJjb21wb25lbnRXaWxsVW5tb3VudCIsInN0YXRlIiwiYWNjZXNzVG9rZW5JbnZhbGlkIiwiX21hcGJveCIsImNvbnRhaW5lciIsIl9tYXBib3hNYXAiLCJvbkVycm9yIiwiX21hcGJveE1hcEVycm9yIiwiaXNNYXAiLCJ0b0pTIiwiX21hcCIsImdldE1hcCIsIl91cGRhdGVRdWVyeVBhcmFtcyIsIm5ld1Byb3BzIiwic2V0UHJvcHMiLCJfdXBkYXRlTWFwU3R5bGUiLCJzZXRTdGF0ZSIsIndpZHRoIiwiaGVpZ2h0IiwiX3VwZGF0ZU1hcFNpemUiLCJmaW5hbGl6ZSIsImdlb21ldHJ5IiwicGFyYW1ldGVycyIsInF1ZXJ5UGFyYW1zIiwibGF5ZXJzIiwibGVuZ3RoIiwicXVlcnlSZW5kZXJlZEZlYXR1cmVzIiwiaW50ZXJhY3RpdmVMYXllcklkcyIsIm9sZFByb3BzIiwic2l6ZUNoYW5nZWQiLCJyZXNpemUiLCJvbGRNYXBTdHlsZSIsInNldFN0eWxlIiwicmVmIiwiZXZ0Iiwic3RhdHVzQ29kZSIsImVycm9yIiwic3RhdHVzIiwiY29uc29sZSIsInN0eWxlIiwicG9zaXRpb24iLCJsZWZ0IiwidG9wIiwia2V5IiwiaWQiLCJocmVmIiwiY2xhc3NOYW1lIiwibWFwQ29udGFpbmVyU3R5bGUiLCJ2aXNpYmlsaXR5Iiwib3ZlcmxheUNvbnRhaW5lclN0eWxlIiwib3ZlcmZsb3ciLCJjaGlsZHJlbiIsIl9tYXBib3hNYXBMb2FkZWQiLCJfcmVuZGVyTm9Ub2tlbldhcm5pbmciLCJkaXNwbGF5TmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVFBLGFBQVIsRUFBdUJDLGFBQXZCLFFBQTJDLE9BQTNDO0FBQ0EsT0FBT0MsU0FBUCxNQUFzQixZQUF0QjtBQUNBLE9BQU9DLFFBQVAsTUFBcUIsbUJBQXJCOztBQUVBLFNBQVFDLHNCQUFSLEVBQWdDQyxZQUFoQyxRQUFtRCxzQkFBbkQ7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLFdBQXRCOztBQUVBLE9BQU9DLG1CQUFQLE1BQWdDLDJCQUFoQzs7QUFFQSxPQUFPQyxNQUFQLE1BQW1CLGtCQUFuQjs7QUFFQTtBQUNBLElBQU1DLGdCQUFnQix5RkFBdEI7QUFDQSxJQUFNQyxtQkFBbUIseURBQXpCO0FBQ0E7O0FBRUEsU0FBU0MsSUFBVCxHQUFnQixDQUFFOztBQUVsQixJQUFNQywwQkFBMEIsR0FBaEM7O0FBRUEsSUFBTUMsWUFBWUMsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0JQLE9BQU9LLFNBQXpCLEVBQW9DO0FBQ3BEO0FBQ0FHLFlBQVVkLFVBQVVlLFNBQVYsQ0FBb0IsQ0FDNUJmLFVBQVVnQixNQURrQixFQUU1QmhCLFVBQVVpQixVQUFWLENBQXFCYixVQUFVYyxHQUEvQixDQUY0QixDQUFwQixDQUYwQztBQU1wRDtBQUNBQyx1QkFBcUJuQixVQUFVb0IsSUFQcUI7QUFRcEQ7QUFDQUMsV0FBU3JCLFVBQVVvQjtBQVRpQyxDQUFwQyxDQUFsQjs7QUFZQSxJQUFNRSxlQUFlVixPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQlAsT0FBT2dCLFlBQXpCLEVBQXVDO0FBQzFEUixZQUFVLGlDQURnRDtBQUUxREssdUJBQXFCLEtBRnFDO0FBRzFERSxXQUFTO0FBSGlELENBQXZDLENBQXJCOztBQU1BLElBQU1FLG9CQUFvQjtBQUN4QkMsWUFBVXhCLFVBQVVpQixVQUFWLENBQXFCWixtQkFBckI7QUFEYyxDQUExQjs7SUFJcUJvQixTOzs7OztnQ0FDQTtBQUNqQixhQUFPbkIsVUFBVUEsT0FBT29CLFNBQVAsRUFBakI7QUFDRDs7O0FBRUQscUJBQVlDLEtBQVosRUFBbUI7QUFBQTs7QUFBQSxzSEFDWEEsS0FEVzs7QUFFakIsVUFBS0MsWUFBTCxHQUFvQixFQUFwQjtBQUNBLFFBQUksQ0FBQ0gsVUFBVUMsU0FBVixFQUFMLEVBQTRCO0FBQzFCLFlBQUtHLGlCQUFMLEdBQXlCcEIsSUFBekI7QUFDQSxZQUFLcUIseUJBQUwsR0FBaUNyQixJQUFqQztBQUNBLFlBQUtzQixrQkFBTCxHQUEwQnRCLElBQTFCO0FBQ0EsWUFBS3VCLG9CQUFMLEdBQTRCdkIsSUFBNUI7QUFDRDtBQUNELFVBQUt3QixLQUFMLEdBQWE7QUFDWEMsMEJBQW9CO0FBRFQsS0FBYjtBQUdBakM7QUFaaUI7QUFhbEI7Ozs7c0NBRWlCO0FBQ2hCLGFBQU87QUFDTHVCLGtCQUFVLElBQUluQixtQkFBSixDQUF3QixLQUFLc0IsS0FBN0I7QUFETCxPQUFQO0FBR0Q7Ozt3Q0FFbUI7QUFBQSxVQUNYYixRQURXLEdBQ0MsS0FBS2EsS0FETixDQUNYYixRQURXOzs7QUFHbEIsV0FBS3FCLE9BQUwsR0FBZSxJQUFJN0IsTUFBSixDQUFXTSxPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQixLQUFLYyxLQUF2QixFQUE4QjtBQUN0RFMsbUJBQVcsS0FBS0MsVUFEc0M7QUFFdERDLGlCQUFTLEtBQUtDLGVBRndDO0FBR3REekIsa0JBQVVWLFVBQVVjLEdBQVYsQ0FBY3NCLEtBQWQsQ0FBb0IxQixRQUFwQixJQUFnQ0EsU0FBUzJCLElBQVQsRUFBaEMsR0FBa0QzQjtBQUhOLE9BQTlCLENBQVgsQ0FBZjtBQUtBLFdBQUs0QixJQUFMLEdBQVksS0FBS1AsT0FBTCxDQUFhUSxNQUFiLEVBQVo7QUFDQSxXQUFLQyxrQkFBTCxDQUF3QjlCLFFBQXhCO0FBQ0Q7Ozs4Q0FFeUIrQixRLEVBQVU7QUFDbEMsV0FBS1YsT0FBTCxDQUFhVyxRQUFiLENBQXNCRCxRQUF0QjtBQUNBLFdBQUtFLGVBQUwsQ0FBcUIsS0FBS3BCLEtBQTFCLEVBQWlDa0IsUUFBakM7O0FBRUE7O0FBRUE7QUFDQSxXQUFLRyxRQUFMLENBQWM7QUFDWkMsZUFBTyxLQUFLdEIsS0FBTCxDQUFXc0IsS0FETjtBQUVaQyxnQkFBUSxLQUFLdkIsS0FBTCxDQUFXdUI7QUFGUCxPQUFkO0FBSUQ7Ozt5Q0FFb0I7QUFDbkI7QUFDQTtBQUNBLFdBQUtDLGNBQUwsQ0FBb0IsS0FBS2xCLEtBQXpCLEVBQWdDLEtBQUtOLEtBQXJDO0FBQ0Q7OzsyQ0FFc0I7QUFDckIsV0FBS1EsT0FBTCxDQUFhaUIsUUFBYjtBQUNBLFdBQUtqQixPQUFMLEdBQWUsSUFBZjtBQUNBLFdBQUtPLElBQUwsR0FBWSxJQUFaO0FBQ0Q7O0FBRUQ7Ozs7NkJBQ1M7QUFDUCxhQUFPLEtBQUtBLElBQVo7QUFDRDs7QUFFRDs7Ozs7Ozs7Ozs7OzBDQVNzQlcsUSxFQUFVQyxVLEVBQVk7QUFDMUMsVUFBTUMsY0FBY0QsY0FBYyxLQUFLMUIsWUFBdkM7QUFDQSxVQUFJMkIsWUFBWUMsTUFBWixJQUFzQkQsWUFBWUMsTUFBWixDQUFtQkMsTUFBbkIsS0FBOEIsQ0FBeEQsRUFBMkQ7QUFDekQsZUFBTyxFQUFQO0FBQ0Q7QUFDRCxhQUFPLEtBQUtmLElBQUwsQ0FBVWdCLHFCQUFWLENBQWdDTCxRQUFoQyxFQUEwQ0UsV0FBMUMsQ0FBUDtBQUNEOztBQUVEOzs7O3VDQUNtQnpDLFEsRUFBVTtBQUMzQixVQUFNNkMsc0JBQXNCekQsdUJBQXVCWSxRQUF2QixDQUE1QjtBQUNBLFdBQUtjLFlBQUwsR0FBb0IsRUFBQzRCLFFBQVFHLG1CQUFULEVBQXBCO0FBQ0Q7O0FBRUQ7Ozs7bUNBQ2VDLFEsRUFBVWYsUSxFQUFVO0FBQ2pDLFVBQU1nQixjQUNKRCxTQUFTWCxLQUFULEtBQW1CSixTQUFTSSxLQUE1QixJQUFxQ1csU0FBU1YsTUFBVCxLQUFvQkwsU0FBU0ssTUFEcEU7O0FBR0EsVUFBSVcsV0FBSixFQUFpQjtBQUNmLGFBQUtuQixJQUFMLENBQVVvQixNQUFWO0FBQ0E7QUFDRDtBQUNGOzs7b0NBRWVGLFEsRUFBVWYsUSxFQUFVO0FBQ2xDLFVBQU0vQixXQUFXK0IsU0FBUy9CLFFBQTFCO0FBQ0EsVUFBTWlELGNBQWNILFNBQVM5QyxRQUE3QjtBQUNBLFVBQUlBLGFBQWFpRCxXQUFqQixFQUE4QjtBQUM1QixZQUFJM0QsVUFBVWMsR0FBVixDQUFjc0IsS0FBZCxDQUFvQjFCLFFBQXBCLENBQUosRUFBbUM7QUFDakMsY0FBSSxLQUFLYSxLQUFMLENBQVdSLG1CQUFmLEVBQW9DO0FBQ2xDLGlCQUFLdUIsSUFBTCxDQUFVc0IsUUFBVixDQUFtQmxELFNBQVMyQixJQUFULEVBQW5CO0FBQ0QsV0FGRCxNQUVPO0FBQ0x0Qyx5QkFBYTRELFdBQWIsRUFBMEJqRCxRQUExQixFQUFvQyxLQUFLNEIsSUFBekM7QUFDRDtBQUNGLFNBTkQsTUFNTztBQUNMLGVBQUtBLElBQUwsQ0FBVXNCLFFBQVYsQ0FBbUJsRCxRQUFuQjtBQUNEO0FBQ0QsYUFBSzhCLGtCQUFMLENBQXdCOUIsUUFBeEI7QUFDRDtBQUNGOzs7cUNBRWdCbUQsRyxFQUFLO0FBQ3BCLFdBQUs1QixVQUFMLEdBQWtCNEIsR0FBbEI7QUFDRDs7QUFFRDs7OztvQ0FDZ0JDLEcsRUFBSztBQUNuQixVQUFNQyxhQUFhRCxJQUFJRSxLQUFKLElBQWFGLElBQUlFLEtBQUosQ0FBVUMsTUFBdkIsSUFBaUNILElBQUlHLE1BQXhEO0FBQ0EsVUFBSUYsZUFBZXpELHVCQUFmLElBQTBDLENBQUMsS0FBS3VCLEtBQUwsQ0FBV0Msa0JBQTFELEVBQThFO0FBQzVFO0FBQ0FvQyxnQkFBUUYsS0FBUixDQUFjNUQsZ0JBQWQsRUFGNEUsQ0FFM0M7QUFDakMsYUFBS3dDLFFBQUwsQ0FBYyxFQUFDZCxvQkFBb0IsSUFBckIsRUFBZDtBQUNEO0FBQ0Y7Ozs0Q0FFdUI7QUFDdEIsVUFBSSxLQUFLRCxLQUFMLENBQVdDLGtCQUFmLEVBQW1DO0FBQ2pDLFlBQU1xQyxRQUFRO0FBQ1pDLG9CQUFVLFVBREU7QUFFWkMsZ0JBQU0sQ0FGTTtBQUdaQyxlQUFLO0FBSE8sU0FBZDtBQUtBLGVBQ0UzRSxjQUFjLEtBQWQsRUFBcUIsRUFBQzRFLEtBQUssU0FBTixFQUFpQkMsSUFBSSxrQkFBckIsRUFBeUNMLFlBQXpDLEVBQXJCLEVBQXNFLENBQ3BFeEUsY0FBYyxJQUFkLEVBQW9CLEVBQUM0RSxLQUFLLFFBQU4sRUFBcEIsRUFBcUNuRSxnQkFBckMsQ0FEb0UsRUFFcEVULGNBQWMsS0FBZCxFQUFxQixFQUFDNEUsS0FBSyxNQUFOLEVBQXJCLEVBQW9DLGtEQUFwQyxDQUZvRSxFQUdwRTVFLGNBQWMsR0FBZCxFQUFtQixFQUFDNEUsS0FBSyxNQUFOLEVBQWNFLE1BQU10RSxhQUFwQixFQUFuQixFQUF1RCxvQkFBdkQsQ0FIb0UsQ0FBdEUsQ0FERjtBQU9EOztBQUVELGFBQU8sSUFBUDtBQUNEOzs7NkJBRVE7QUFBQSxtQkFDNEMsS0FBS29CLEtBRGpEO0FBQUEsVUFDQW1ELFNBREEsVUFDQUEsU0FEQTtBQUFBLFVBQ1c3QixLQURYLFVBQ1dBLEtBRFg7QUFBQSxVQUNrQkMsTUFEbEIsVUFDa0JBLE1BRGxCO0FBQUEsVUFDMEJxQixLQUQxQixVQUMwQkEsS0FEMUI7QUFBQSxVQUNpQ2xELE9BRGpDLFVBQ2lDQSxPQURqQzs7QUFFUCxVQUFNMEQsb0JBQW9CbkUsT0FBT0MsTUFBUCxDQUFjLEVBQWQsRUFBa0IwRCxLQUFsQixFQUF5QixFQUFDdEIsWUFBRCxFQUFRQyxjQUFSLEVBQWdCc0IsVUFBVSxVQUExQixFQUF6QixDQUExQjtBQUNBLFVBQU0xRCxXQUFXRixPQUFPQyxNQUFQLENBQWMsRUFBZCxFQUFrQjBELEtBQWxCLEVBQXlCO0FBQ3hDdEIsb0JBRHdDO0FBRXhDQyxzQkFGd0M7QUFHeEM4QixvQkFBWTNELFVBQVUsU0FBVixHQUFzQjtBQUhNLE9BQXpCLENBQWpCO0FBS0EsVUFBTTRELHdCQUF3QjtBQUM1QlQsa0JBQVUsVUFEa0I7QUFFNUJDLGNBQU0sQ0FGc0I7QUFHNUJDLGFBQUssQ0FIdUI7QUFJNUJ6QixvQkFKNEI7QUFLNUJDLHNCQUw0QjtBQU01QmdDLGtCQUFVO0FBTmtCLE9BQTlCOztBQVNBO0FBQ0EsYUFDRW5GLGNBQWMsS0FBZCxFQUFxQjtBQUNuQjRFLGFBQUssZUFEYztBQUVuQkosZUFBT1EsaUJBRlk7QUFHbkJJLGtCQUFVLENBQ1JwRixjQUFjLEtBQWQsRUFBcUI7QUFDbkI0RSxlQUFLLFlBRGM7QUFFbkJWLGVBQUssS0FBS21CLGdCQUZTO0FBR25CYixpQkFBT3pELFFBSFk7QUFJbkJnRTtBQUptQixTQUFyQixDQURRLEVBT1IvRSxjQUFjLEtBQWQsRUFBcUI7QUFDbkI0RSxlQUFLLGNBRGM7QUFFbkI7QUFDQUcscUJBQVcsVUFIUTtBQUluQlAsaUJBQU9VLHFCQUpZO0FBS25CRSxvQkFBVSxLQUFLeEQsS0FBTCxDQUFXd0Q7QUFMRixTQUFyQixDQVBRLEVBY1IsS0FBS0UscUJBQUwsRUFkUTtBQUhTLE9BQXJCLENBREY7QUFzQkQ7Ozs7RUFoTW9DdkYsYTs7ZUFBbEIyQixTOzs7QUFtTXJCQSxVQUFVNkQsV0FBVixHQUF3QixXQUF4QjtBQUNBN0QsVUFBVWQsU0FBVixHQUFzQkEsU0FBdEI7QUFDQWMsVUFBVUgsWUFBVixHQUF5QkEsWUFBekI7QUFDQUcsVUFBVUYsaUJBQVYsR0FBOEJBLGlCQUE5QiIsImZpbGUiOiJzdGF0aWMtbWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG5cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblxuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cbmltcG9ydCB7UHVyZUNvbXBvbmVudCwgY3JlYXRlRWxlbWVudH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCBhdXRvYmluZCBmcm9tICcuLi91dGlscy9hdXRvYmluZCc7XG5cbmltcG9ydCB7Z2V0SW50ZXJhY3RpdmVMYXllcklkcywgc2V0RGlmZlN0eWxlfSBmcm9tICcuLi91dGlscy9zdHlsZS11dGlscyc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5cbmltcG9ydCBXZWJNZXJjYXRvclZpZXdwb3J0IGZyb20gJ3ZpZXdwb3J0LW1lcmNhdG9yLXByb2plY3QnO1xuXG5pbXBvcnQgTWFwYm94IGZyb20gJy4uL21hcGJveC9tYXBib3gnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG5jb25zdCBUT0tFTl9ET0NfVVJMID0gJ2h0dHBzOi8vdWJlci5naXRodWIuaW8vcmVhY3QtbWFwLWdsLyMvRG9jdW1lbnRhdGlvbi9nZXR0aW5nLXN0YXJ0ZWQvYWJvdXQtbWFwYm94LXRva2Vucyc7XG5jb25zdCBOT19UT0tFTl9XQVJOSU5HID0gJ0EgdmFsaWQgQVBJIGFjY2VzcyB0b2tlbiBpcyByZXF1aXJlZCB0byB1c2UgTWFwYm94IGRhdGEnO1xuLyogZXNsaW50LWRpc2FibGUgbWF4LWxlbiAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUgPSA0MDE7XG5cbmNvbnN0IHByb3BUeXBlcyA9IE9iamVjdC5hc3NpZ24oe30sIE1hcGJveC5wcm9wVHlwZXMsIHtcbiAgLyoqIFRoZSBNYXBib3ggc3R5bGUuIEEgc3RyaW5nIHVybCBvciBhIE1hcGJveEdMIHN0eWxlIEltbXV0YWJsZS5NYXAgb2JqZWN0LiAqL1xuICBtYXBTdHlsZTogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICBQcm9wVHlwZXMuaW5zdGFuY2VPZihJbW11dGFibGUuTWFwKVxuICBdKSxcbiAgLyoqIFRoZXJlIGFyZSBrbm93biBpc3N1ZXMgd2l0aCBzdHlsZSBkaWZmaW5nLiBBcyBzdG9wZ2FwLCBhZGQgb3B0aW9uIHRvIHByZXZlbnQgc3R5bGUgZGlmZmluZy4gKi9cbiAgcHJldmVudFN0eWxlRGlmZmluZzogUHJvcFR5cGVzLmJvb2wsXG4gIC8qKiBXaGV0aGVyIHRoZSBtYXAgaXMgdmlzaWJsZSAqL1xuICB2aXNpYmxlOiBQcm9wVHlwZXMuYm9vbFxufSk7XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIE1hcGJveC5kZWZhdWx0UHJvcHMsIHtcbiAgbWFwU3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2xpZ2h0LXY4JyxcbiAgcHJldmVudFN0eWxlRGlmZmluZzogZmFsc2UsXG4gIHZpc2libGU6IHRydWVcbn0pO1xuXG5jb25zdCBjaGlsZENvbnRleHRUeXBlcyA9IHtcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5pbnN0YW5jZU9mKFdlYk1lcmNhdG9yVmlld3BvcnQpXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdGF0aWNNYXAgZXh0ZW5kcyBQdXJlQ29tcG9uZW50IHtcbiAgc3RhdGljIHN1cHBvcnRlZCgpIHtcbiAgICByZXR1cm4gTWFwYm94ICYmIE1hcGJveC5zdXBwb3J0ZWQoKTtcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuX3F1ZXJ5UGFyYW1zID0ge307XG4gICAgaWYgKCFTdGF0aWNNYXAuc3VwcG9ydGVkKCkpIHtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkTW91bnQgPSBub29wO1xuICAgICAgdGhpcy5jb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50RGlkVXBkYXRlID0gbm9vcDtcbiAgICAgIHRoaXMuY29tcG9uZW50V2lsbFVubW91bnQgPSBub29wO1xuICAgIH1cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgYWNjZXNzVG9rZW5JbnZhbGlkOiBmYWxzZVxuICAgIH07XG4gICAgYXV0b2JpbmQodGhpcyk7XG4gIH1cblxuICBnZXRDaGlsZENvbnRleHQoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHZpZXdwb3J0OiBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh0aGlzLnByb3BzKVxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCB7bWFwU3R5bGV9ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuX21hcGJveCA9IG5ldyBNYXBib3goT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywge1xuICAgICAgY29udGFpbmVyOiB0aGlzLl9tYXBib3hNYXAsXG4gICAgICBvbkVycm9yOiB0aGlzLl9tYXBib3hNYXBFcnJvcixcbiAgICAgIG1hcFN0eWxlOiBJbW11dGFibGUuTWFwLmlzTWFwKG1hcFN0eWxlKSA/IG1hcFN0eWxlLnRvSlMoKSA6IG1hcFN0eWxlXG4gICAgfSkpO1xuICAgIHRoaXMuX21hcCA9IHRoaXMuX21hcGJveC5nZXRNYXAoKTtcbiAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzKG5ld1Byb3BzKSB7XG4gICAgdGhpcy5fbWFwYm94LnNldFByb3BzKG5ld1Byb3BzKTtcbiAgICB0aGlzLl91cGRhdGVNYXBTdHlsZSh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG5cbiAgICAvLyBTYXZlIHdpZHRoL2hlaWdodCBzbyB0aGF0IHdlIGNhbiBjaGVjayB0aGVtIGluIGNvbXBvbmVudERpZFVwZGF0ZVxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgd2lkdGg6IHRoaXMucHJvcHMud2lkdGgsXG4gICAgICBoZWlnaHQ6IHRoaXMucHJvcHMuaGVpZ2h0XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XG4gICAgLy8gU2luY2UgTWFwYm94J3MgbWFwLnJlc2l6ZSgpIHJlYWRzIHNpemUgZnJvbSBET01cbiAgICAvLyB3ZSBtdXN0IHdhaXQgdG8gcmVhZCBzaXplIHVudGlsIGFmdGVyIHJlbmRlciAoaS5lLiBoZXJlIGluIFwiZGlkVXBkYXRlXCIpXG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZSh0aGlzLnN0YXRlLCB0aGlzLnByb3BzKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHRoaXMuX21hcGJveC5maW5hbGl6ZSgpO1xuICAgIHRoaXMuX21hcGJveCA9IG51bGw7XG4gICAgdGhpcy5fbWFwID0gbnVsbDtcbiAgfVxuXG4gIC8vIEV4dGVybmFsIGFwcHMgY2FuIGFjY2VzcyBtYXAgdGhpcyB3YXlcbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICAvKiogVXNlcyBNYXBib3gnc1xuICAgICogcXVlcnlSZW5kZXJlZEZlYXR1cmVzIEFQSSB0byBmaW5kIGZlYXR1cmVzIGF0IHBvaW50IG9yIGluIGEgYm91bmRpbmcgYm94LlxuICAgICogaHR0cHM6Ly93d3cubWFwYm94LmNvbS9tYXBib3gtZ2wtanMvYXBpLyNNYXAjcXVlcnlSZW5kZXJlZEZlYXR1cmVzXG4gICAgKiBUbyBxdWVyeSBvbmx5IHNvbWUgb2YgdGhlIGxheWVycywgc2V0IHRoZSBgaW50ZXJhY3RpdmVgIHByb3BlcnR5IGluIHRoZVxuICAgICogbGF5ZXIgc3R5bGUgdG8gYHRydWVgLlxuICAgICogQHBhcmFtIHtbTnVtYmVyLCBOdW1iZXJdfFtbTnVtYmVyLCBOdW1iZXJdLCBbTnVtYmVyLCBOdW1iZXJdXX0gZ2VvbWV0cnkgLVxuICAgICogICBQb2ludCBvciBhbiBhcnJheSBvZiB0d28gcG9pbnRzIGRlZmluaW5nIHRoZSBib3VuZGluZyBib3hcbiAgICAqIEBwYXJhbSB7T2JqZWN0fSBwYXJhbWV0ZXJzIC0gcXVlcnkgb3B0aW9uc1xuICAgICovXG4gIHF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhnZW9tZXRyeSwgcGFyYW1ldGVycykge1xuICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gcGFyYW1ldGVycyB8fCB0aGlzLl9xdWVyeVBhcmFtcztcbiAgICBpZiAocXVlcnlQYXJhbXMubGF5ZXJzICYmIHF1ZXJ5UGFyYW1zLmxheWVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX21hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZ2VvbWV0cnksIHF1ZXJ5UGFyYW1zKTtcbiAgfVxuXG4gIC8vIEhvdmVyIGFuZCBjbGljayBvbmx5IHF1ZXJ5IGxheWVycyB3aG9zZSBpbnRlcmFjdGl2ZSBwcm9wZXJ0eSBpcyB0cnVlXG4gIF91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSkge1xuICAgIGNvbnN0IGludGVyYWN0aXZlTGF5ZXJJZHMgPSBnZXRJbnRlcmFjdGl2ZUxheWVySWRzKG1hcFN0eWxlKTtcbiAgICB0aGlzLl9xdWVyeVBhcmFtcyA9IHtsYXllcnM6IGludGVyYWN0aXZlTGF5ZXJJZHN9O1xuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID1cbiAgICAgIG9sZFByb3BzLndpZHRoICE9PSBuZXdQcm9wcy53aWR0aCB8fCBvbGRQcm9wcy5oZWlnaHQgIT09IG5ld1Byb3BzLmhlaWdodDtcblxuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgICAgLy8gdGhpcy5fY2FsbE9uQ2hhbmdlVmlld3BvcnQodGhpcy5fbWFwLnRyYW5zZm9ybSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZU1hcFN0eWxlKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IG1hcFN0eWxlID0gbmV3UHJvcHMubWFwU3R5bGU7XG4gICAgY29uc3Qgb2xkTWFwU3R5bGUgPSBvbGRQcm9wcy5tYXBTdHlsZTtcbiAgICBpZiAobWFwU3R5bGUgIT09IG9sZE1hcFN0eWxlKSB7XG4gICAgICBpZiAoSW1tdXRhYmxlLk1hcC5pc01hcChtYXBTdHlsZSkpIHtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMucHJldmVudFN0eWxlRGlmZmluZykge1xuICAgICAgICAgIHRoaXMuX21hcC5zZXRTdHlsZShtYXBTdHlsZS50b0pTKCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNldERpZmZTdHlsZShvbGRNYXBTdHlsZSwgbWFwU3R5bGUsIHRoaXMuX21hcCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX21hcC5zZXRTdHlsZShtYXBTdHlsZSk7XG4gICAgICB9XG4gICAgICB0aGlzLl91cGRhdGVRdWVyeVBhcmFtcyhtYXBTdHlsZSk7XG4gICAgfVxuICB9XG5cbiAgX21hcGJveE1hcExvYWRlZChyZWYpIHtcbiAgICB0aGlzLl9tYXBib3hNYXAgPSByZWY7XG4gIH1cblxuICAvLyBIYW5kbGUgbWFwIGVycm9yXG4gIF9tYXBib3hNYXBFcnJvcihldnQpIHtcbiAgICBjb25zdCBzdGF0dXNDb2RlID0gZXZ0LmVycm9yICYmIGV2dC5lcnJvci5zdGF0dXMgfHwgZXZ0LnN0YXR1cztcbiAgICBpZiAoc3RhdHVzQ29kZSA9PT0gVU5BVVRIT1JJWkVEX0VSUk9SX0NPREUgJiYgIXRoaXMuc3RhdGUuYWNjZXNzVG9rZW5JbnZhbGlkKSB7XG4gICAgICAvLyBNYXBib3ggdGhyb3dzIHVuYXV0aG9yaXplZCBlcnJvciAtIGludmFsaWQgdG9rZW5cbiAgICAgIGNvbnNvbGUuZXJyb3IoTk9fVE9LRU5fV0FSTklORyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2FjY2Vzc1Rva2VuSW52YWxpZDogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG4gIF9yZW5kZXJOb1Rva2VuV2FybmluZygpIHtcbiAgICBpZiAodGhpcy5zdGF0ZS5hY2Nlc3NUb2tlbkludmFsaWQpIHtcbiAgICAgIGNvbnN0IHN0eWxlID0ge1xuICAgICAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICAgICAgbGVmdDogMCxcbiAgICAgICAgdG9wOiAwXG4gICAgICB9O1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge2tleTogJ3dhcm5pbmcnLCBpZDogJ25vLXRva2VuLXdhcm5pbmcnLCBzdHlsZX0sIFtcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdoMycsIHtrZXk6ICdoZWFkZXInfSwgTk9fVE9LRU5fV0FSTklORyksXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge2tleTogJ3RleHQnfSwgJ0ZvciBpbmZvcm1hdGlvbiBvbiBzZXR0aW5nIHVwIHlvdXIgYmFzZW1hcCwgcmVhZCcpLFxuICAgICAgICAgIGNyZWF0ZUVsZW1lbnQoJ2EnLCB7a2V5OiAnbGluaycsIGhyZWY6IFRPS0VOX0RPQ19VUkx9LCAnTm90ZSBvbiBNYXAgVG9rZW5zJylcbiAgICAgICAgXSlcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgY29uc3Qge2NsYXNzTmFtZSwgd2lkdGgsIGhlaWdodCwgc3R5bGUsIHZpc2libGV9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBtYXBDb250YWluZXJTdHlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0eWxlLCB7d2lkdGgsIGhlaWdodCwgcG9zaXRpb246ICdyZWxhdGl2ZSd9KTtcbiAgICBjb25zdCBtYXBTdHlsZSA9IE9iamVjdC5hc3NpZ24oe30sIHN0eWxlLCB7XG4gICAgICB3aWR0aCxcbiAgICAgIGhlaWdodCxcbiAgICAgIHZpc2liaWxpdHk6IHZpc2libGUgPyAndmlzaWJsZScgOiAnaGlkZGVuJ1xuICAgIH0pO1xuICAgIGNvbnN0IG92ZXJsYXlDb250YWluZXJTdHlsZSA9IHtcbiAgICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgICAgbGVmdDogMCxcbiAgICAgIHRvcDogMCxcbiAgICAgIHdpZHRoLFxuICAgICAgaGVpZ2h0LFxuICAgICAgb3ZlcmZsb3c6ICdoaWRkZW4nXG4gICAgfTtcblxuICAgIC8vIE5vdGU6IGEgc3RhdGljIG1hcCBzdGlsbCBoYW5kbGVzIGNsaWNrcyBhbmQgaG92ZXIgZXZlbnRzXG4gICAgcmV0dXJuIChcbiAgICAgIGNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcbiAgICAgICAga2V5OiAnbWFwLWNvbnRhaW5lcicsXG4gICAgICAgIHN0eWxlOiBtYXBDb250YWluZXJTdHlsZSxcbiAgICAgICAgY2hpbGRyZW46IFtcbiAgICAgICAgICBjcmVhdGVFbGVtZW50KCdkaXYnLCB7XG4gICAgICAgICAgICBrZXk6ICdtYXAtbWFwYm94JyxcbiAgICAgICAgICAgIHJlZjogdGhpcy5fbWFwYm94TWFwTG9hZGVkLFxuICAgICAgICAgICAgc3R5bGU6IG1hcFN0eWxlLFxuICAgICAgICAgICAgY2xhc3NOYW1lXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY3JlYXRlRWxlbWVudCgnZGl2Jywge1xuICAgICAgICAgICAga2V5OiAnbWFwLW92ZXJsYXlzJyxcbiAgICAgICAgICAgIC8vIFNhbWUgYXMgaW50ZXJhY3RpdmUgbWFwJ3Mgb3ZlcmxheSBjb250YWluZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZTogJ292ZXJsYXlzJyxcbiAgICAgICAgICAgIHN0eWxlOiBvdmVybGF5Q29udGFpbmVyU3R5bGUsXG4gICAgICAgICAgICBjaGlsZHJlbjogdGhpcy5wcm9wcy5jaGlsZHJlblxuICAgICAgICAgIH0pLFxuICAgICAgICAgIHRoaXMuX3JlbmRlck5vVG9rZW5XYXJuaW5nKClcbiAgICAgICAgXVxuICAgICAgfSlcbiAgICApO1xuICB9XG59XG5cblN0YXRpY01hcC5kaXNwbGF5TmFtZSA9ICdTdGF0aWNNYXAnO1xuU3RhdGljTWFwLnByb3BUeXBlcyA9IHByb3BUeXBlcztcblN0YXRpY01hcC5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG5TdGF0aWNNYXAuY2hpbGRDb250ZXh0VHlwZXMgPSBjaGlsZENvbnRleHRUeXBlcztcbiJdfQ==