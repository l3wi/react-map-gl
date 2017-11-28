var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

/* global window, document, process */
import PropTypes from 'prop-types';

var isBrowser = !((typeof process === 'undefined' ? 'undefined' : _typeof(process)) === 'object' && String(process) === '[object process]' && !process.browser);

var mapboxgl = isBrowser ? require('mapbox-gl') : null;

function noop() {}

var propTypes = {
  // Creation parameters
  // container: PropTypes.DOMElement || String

  mapboxApiAccessToken: PropTypes.string, /** Mapbox API access token for Mapbox tiles/styles. */
  attributionControl: PropTypes.bool, /** Show attribution control or not. */
  preserveDrawingBuffer: PropTypes.bool, /** Useful when you want to export the canvas as a PNG. */
  onLoad: PropTypes.func, /** The onLoad callback for the map */
  onError: PropTypes.func, /** The onError callback for the map */
  reuseMaps: PropTypes.bool,

  mapStyle: PropTypes.string, /** The Mapbox style. A string url to a MapboxGL style */
  visible: PropTypes.bool, /** Whether the map is visible */

  // Map view state
  width: PropTypes.number.isRequired, /** The width of the map. */
  height: PropTypes.number.isRequired, /** The height of the map. */
  longitude: PropTypes.number.isRequired, /** The longitude of the center of the map. */
  latitude: PropTypes.number.isRequired, /** The latitude of the center of the map. */
  zoom: PropTypes.number.isRequired, /** The tile zoom level of the map. */
  bearing: PropTypes.number, /** Specify the bearing of the viewport */
  pitch: PropTypes.number, /** Specify the pitch of the viewport */

  // Note: Non-public API, see https://github.com/mapbox/mapbox-gl-js/issues/1137
  altitude: PropTypes.number /** Altitude of the viewport camera. Default 1.5 "screen heights" */
};

var defaultProps = {
  mapboxApiAccessToken: getAccessToken(),
  preserveDrawingBuffer: false,
  attributionControl: true,
  preventStyleDiffing: false,
  onLoad: noop,
  onError: noop,
  reuseMaps: false,

  mapStyle: 'mapbox://styles/mapbox/light-v8',
  visible: true,

  bearing: 0,
  pitch: 0,
  altitude: 1.5
};

// Try to get access token from URL, env, local storage or config
export function getAccessToken() {
  var accessToken = null;

  if (typeof window !== 'undefined' && window.location) {
    var match = window.location.search.match(/access_token=([^&\/]*)/);
    accessToken = match && match[1];
  }

  if (!accessToken && typeof process !== 'undefined') {
    // Note: This depends on bundler plugins (e.g. webpack) inmporting environment correctly
    accessToken = accessToken || process.env.MapboxAccessToken; // eslint-disable-line
  }

  return accessToken || null;
}

// Helper function to merge defaultProps and check prop types
function checkPropTypes(props) {
  var component = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'component';

  // TODO - check for production (unless done by prop types package?)
  if (props.debug) {
    PropTypes.checkPropTypes(propTypes, props, 'prop', component);
  }
}

// A small wrapper class for mapbox-gl
// - Provides a prop style interface (that can be trivially used by a React wrapper)
// - Makes sure mapbox doesn't crash under Node
// - Handles map reuse (to work around Mapbox resource leak issues)
// - Provides support for specifying tokens during development

var Mapbox = function () {
  _createClass(Mapbox, null, [{
    key: 'supported',
    value: function supported() {
      return mapboxgl && mapboxgl.supported();
    }
  }]);

  function Mapbox(props) {
    _classCallCheck(this, Mapbox);

    if (!mapboxgl) {
      throw new Error('Mapbox not supported');
    }

    this.props = {};
    this._initialize(props);
  }

  _createClass(Mapbox, [{
    key: 'finalize',
    value: function finalize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._destroy();
      return this;
    }
  }, {
    key: 'setProps',
    value: function setProps(props) {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._update(this.props, props);
      return this;
    }

    // Mapbox's map.resize() reads size from DOM, so DOM element must already be resized
    // In a system like React we must wait to read size until after render
    // (e.g. until "componentDidUpdate")

  }, {
    key: 'resize',
    value: function resize() {
      if (!mapboxgl || !this._map) {
        return this;
      }

      this._map.resize();
      return this;
    }

    // External apps can access map this way

  }, {
    key: 'getMap',
    value: function getMap() {
      return this._map;
    }

    // PRIVATE API

  }, {
    key: '_create',
    value: function _create(props) {
      // Reuse a saved map, if available
      if (props.reuseMaps && Mapbox.savedMap) {
        this._map = this.map = Mapbox.savedMap;
        Mapbox.savedMap = null;
        // TODO - need to call onload again, need to track with Promise?
        props.onLoad();
        console.debug('Reused existing mapbox map', this._map); // eslint-disable-line
      } else {
        this._map = this.map = new mapboxgl.Map({
          container: props.container || document.body,
          center: [props.longitude, props.latitude],
          zoom: props.zoom,
          pitch: props.pitch,
          bearing: props.bearing,
          style: props.mapStyle,
          interactive: false,
          attributionControl: props.attributionControl,
          preserveDrawingBuffer: props.preserveDrawingBuffer
        });
        // Attach optional onLoad function
        this.map.once('load', props.onLoad);
        this.map.on('error', props.onError);
        console.debug('Created new mapbox map', this._map); // eslint-disable-line
      }

      return this;
    }
  }, {
    key: '_destroy',
    value: function _destroy() {
      if (!Mapbox.savedMap) {
        Mapbox.savedMap = this._map;
      } else {
        this._map.remove();
      }
    }
  }, {
    key: '_initialize',
    value: function _initialize(props) {
      props = Object.assign({}, defaultProps, props);
      checkPropTypes(props, 'Mapbox');

      // Make empty string pick up default prop
      this.accessToken = props.mapboxApiAccessToken || defaultProps.mapboxApiAccessToken;

      // Creation only props
      if (mapboxgl) {
        if (!this.accessToken) {
          mapboxgl.accessToken = 'no-token'; // Prevents mapbox from throwing
        } else {
          mapboxgl.accessToken = this.accessToken;
        }
      }

      this._create(props);

      // Disable outline style
      var canvas = this.map.getCanvas();
      if (canvas) {
        canvas.style.outline = 'none';
      }

      this._updateMapViewport({}, props);
      this._updateMapSize({}, props);

      this.props = props;
    }
  }, {
    key: '_update',
    value: function _update(oldProps, newProps) {
      newProps = Object.assign({}, this.props, newProps);
      checkPropTypes(newProps, 'Mapbox');

      this._updateMapViewport(oldProps, newProps);
      this._updateMapSize(oldProps, newProps);

      this.props = newProps;
    }
  }, {
    key: '_updateMapViewport',
    value: function _updateMapViewport(oldProps, newProps) {
      var viewportChanged = newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom || newProps.pitch !== oldProps.pitch || newProps.bearing !== oldProps.bearing || newProps.altitude !== oldProps.altitude;

      if (viewportChanged) {
        this._map.jumpTo({
          center: [newProps.longitude, newProps.latitude],
          zoom: newProps.zoom,
          bearing: newProps.bearing,
          pitch: newProps.pitch
        });

        // TODO - jumpTo doesn't handle altitude
        if (newProps.altitude !== oldProps.altitude) {
          this._map.transform.altitude = newProps.altitude;
        }
      }
    }

    // Note: needs to be called after render (e.g. in componentDidUpdate)

  }, {
    key: '_updateMapSize',
    value: function _updateMapSize(oldProps, newProps) {
      var sizeChanged = oldProps.width !== newProps.width || oldProps.height !== newProps.height;
      if (sizeChanged) {
        this._map.resize();
      }
    }
  }]);

  return Mapbox;
}();

export default Mapbox;


Mapbox.propTypes = propTypes;
Mapbox.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tYXBib3gvbWFwYm94LmpzIl0sIm5hbWVzIjpbIlByb3BUeXBlcyIsImlzQnJvd3NlciIsInByb2Nlc3MiLCJTdHJpbmciLCJicm93c2VyIiwibWFwYm94Z2wiLCJyZXF1aXJlIiwibm9vcCIsInByb3BUeXBlcyIsIm1hcGJveEFwaUFjY2Vzc1Rva2VuIiwic3RyaW5nIiwiYXR0cmlidXRpb25Db250cm9sIiwiYm9vbCIsInByZXNlcnZlRHJhd2luZ0J1ZmZlciIsIm9uTG9hZCIsImZ1bmMiLCJvbkVycm9yIiwicmV1c2VNYXBzIiwibWFwU3R5bGUiLCJ2aXNpYmxlIiwid2lkdGgiLCJudW1iZXIiLCJpc1JlcXVpcmVkIiwiaGVpZ2h0IiwibG9uZ2l0dWRlIiwibGF0aXR1ZGUiLCJ6b29tIiwiYmVhcmluZyIsInBpdGNoIiwiYWx0aXR1ZGUiLCJkZWZhdWx0UHJvcHMiLCJnZXRBY2Nlc3NUb2tlbiIsInByZXZlbnRTdHlsZURpZmZpbmciLCJhY2Nlc3NUb2tlbiIsIndpbmRvdyIsImxvY2F0aW9uIiwibWF0Y2giLCJzZWFyY2giLCJlbnYiLCJNYXBib3hBY2Nlc3NUb2tlbiIsImNoZWNrUHJvcFR5cGVzIiwicHJvcHMiLCJjb21wb25lbnQiLCJkZWJ1ZyIsIk1hcGJveCIsInN1cHBvcnRlZCIsIkVycm9yIiwiX2luaXRpYWxpemUiLCJfbWFwIiwiX2Rlc3Ryb3kiLCJfdXBkYXRlIiwicmVzaXplIiwic2F2ZWRNYXAiLCJtYXAiLCJjb25zb2xlIiwiTWFwIiwiY29udGFpbmVyIiwiZG9jdW1lbnQiLCJib2R5IiwiY2VudGVyIiwic3R5bGUiLCJpbnRlcmFjdGl2ZSIsIm9uY2UiLCJvbiIsInJlbW92ZSIsIk9iamVjdCIsImFzc2lnbiIsIl9jcmVhdGUiLCJjYW52YXMiLCJnZXRDYW52YXMiLCJvdXRsaW5lIiwiX3VwZGF0ZU1hcFZpZXdwb3J0IiwiX3VwZGF0ZU1hcFNpemUiLCJvbGRQcm9wcyIsIm5ld1Byb3BzIiwidmlld3BvcnRDaGFu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R0FnRCxTQUFTOUMsS0FBVCxLQUFtQjZDLFNBQVM3QyxLQUg1QixJQUlBOEMsU0FBUy9DLE9BQVQsS0FBcUI4QyxTQUFTOUMsT0FKOUIsSUFLQStDLFNBQVM3QyxRQUFULEtBQXNCNEMsU0FBUzVDLFFBTmpDOztBQVFBLFVBQUk4QyxlQUFKLEVBQXFCO0FBQ25CLGFBQUszQixJQUFMLENBQVU0QixNQUFWLENBQWlCO0FBQ2ZqQixrQkFBUSxDQUFDZSxTQUFTbEQsU0FBVixFQUFxQmtELFNBQVNqRCxRQUE5QixDQURPO0FBRWZDLGdCQUFNZ0QsU0FBU2hELElBRkE7QUFHZkMsbUJBQVMrQyxTQUFTL0MsT0FISDtBQUlmQyxpQkFBTzhDLFNBQVM5QztBQUpELFNBQWpCOztBQU9BO0FBQ0EsWUFBSThDLFNBQVM3QyxRQUFULEtBQXNCNEMsU0FBUzVDLFFBQW5DLEVBQTZDO0FBQzNDLGVBQUttQixJQUFMLENBQVU2QixTQUFWLENBQW9CaEQsUUFBcEIsR0FBK0I2QyxTQUFTN0MsUUFBeEM7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7Ozs7bUNBQ2U0QyxRLEVBQVVDLFEsRUFBVTtBQUNqQyxVQUFNSSxjQUFjTCxTQUFTckQsS0FBVCxLQUFtQnNELFNBQVN0RCxLQUE1QixJQUFxQ3FELFNBQVNsRCxNQUFULEtBQW9CbUQsU0FBU25ELE1BQXRGO0FBQ0EsVUFBSXVELFdBQUosRUFBaUI7QUFDZixhQUFLOUIsSUFBTCxDQUFVRyxNQUFWO0FBQ0Q7QUFDRjs7Ozs7O2VBOUprQlAsTTs7O0FBaUtyQkEsT0FBT3BDLFNBQVAsR0FBbUJBLFNBQW5CO0FBQ0FvQyxPQUFPZCxZQUFQLEdBQXNCQSxZQUF0QiIsImZpbGUiOiJtYXBib3guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cblxuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93LCBkb2N1bWVudCwgcHJvY2VzcyAqL1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcblxuY29uc3QgaXNCcm93c2VyID0gIShcbiAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gIFN0cmluZyhwcm9jZXNzKSA9PT0gJ1tvYmplY3QgcHJvY2Vzc10nICYmXG4gICFwcm9jZXNzLmJyb3dzZXJcbik7XG5cbmNvbnN0IG1hcGJveGdsID0gaXNCcm93c2VyID8gcmVxdWlyZSgnbWFwYm94LWdsJykgOiBudWxsO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICAvLyBDcmVhdGlvbiBwYXJhbWV0ZXJzXG4gIC8vIGNvbnRhaW5lcjogUHJvcFR5cGVzLkRPTUVsZW1lbnQgfHwgU3RyaW5nXG5cbiAgbWFwYm94QXBpQWNjZXNzVG9rZW46IFByb3BUeXBlcy5zdHJpbmcsIC8qKiBNYXBib3ggQVBJIGFjY2VzcyB0b2tlbiBmb3IgTWFwYm94IHRpbGVzL3N0eWxlcy4gKi9cbiAgYXR0cmlidXRpb25Db250cm9sOiBQcm9wVHlwZXMuYm9vbCwgLyoqIFNob3cgYXR0cmlidXRpb24gY29udHJvbCBvciBub3QuICovXG4gIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogUHJvcFR5cGVzLmJvb2wsIC8qKiBVc2VmdWwgd2hlbiB5b3Ugd2FudCB0byBleHBvcnQgdGhlIGNhbnZhcyBhcyBhIFBORy4gKi9cbiAgb25Mb2FkOiBQcm9wVHlwZXMuZnVuYywgLyoqIFRoZSBvbkxvYWQgY2FsbGJhY2sgZm9yIHRoZSBtYXAgKi9cbiAgb25FcnJvcjogUHJvcFR5cGVzLmZ1bmMsIC8qKiBUaGUgb25FcnJvciBjYWxsYmFjayBmb3IgdGhlIG1hcCAqL1xuICByZXVzZU1hcHM6IFByb3BUeXBlcy5ib29sLFxuXG4gIG1hcFN0eWxlOiBQcm9wVHlwZXMuc3RyaW5nLCAvKiogVGhlIE1hcGJveCBzdHlsZS4gQSBzdHJpbmcgdXJsIHRvIGEgTWFwYm94R0wgc3R5bGUgKi9cbiAgdmlzaWJsZTogUHJvcFR5cGVzLmJvb2wsIC8qKiBXaGV0aGVyIHRoZSBtYXAgaXMgdmlzaWJsZSAqL1xuXG4gIC8vIE1hcCB2aWV3IHN0YXRlXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgd2lkdGggb2YgdGhlIG1hcC4gKi9cbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgaGVpZ2h0IG9mIHRoZSBtYXAuICovXG4gIGxvbmdpdHVkZTogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLCAvKiogVGhlIGxvbmdpdHVkZSBvZiB0aGUgY2VudGVyIG9mIHRoZSBtYXAuICovXG4gIGxhdGl0dWRlOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgbGF0aXR1ZGUgb2YgdGhlIGNlbnRlciBvZiB0aGUgbWFwLiAqL1xuICB6b29tOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsIC8qKiBUaGUgdGlsZSB6b29tIGxldmVsIG9mIHRoZSBtYXAuICovXG4gIGJlYXJpbmc6IFByb3BUeXBlcy5udW1iZXIsIC8qKiBTcGVjaWZ5IHRoZSBiZWFyaW5nIG9mIHRoZSB2aWV3cG9ydCAqL1xuICBwaXRjaDogUHJvcFR5cGVzLm51bWJlciwgLyoqIFNwZWNpZnkgdGhlIHBpdGNoIG9mIHRoZSB2aWV3cG9ydCAqL1xuXG4gIC8vIE5vdGU6IE5vbi1wdWJsaWMgQVBJLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzExMzdcbiAgYWx0aXR1ZGU6IFByb3BUeXBlcy5udW1iZXIgLyoqIEFsdGl0dWRlIG9mIHRoZSB2aWV3cG9ydCBjYW1lcmEuIERlZmF1bHQgMS41IFwic2NyZWVuIGhlaWdodHNcIiAqL1xufTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBtYXBib3hBcGlBY2Nlc3NUb2tlbjogZ2V0QWNjZXNzVG9rZW4oKSxcbiAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBmYWxzZSxcbiAgYXR0cmlidXRpb25Db250cm9sOiB0cnVlLFxuICBwcmV2ZW50U3R5bGVEaWZmaW5nOiBmYWxzZSxcbiAgb25Mb2FkOiBub29wLFxuICBvbkVycm9yOiBub29wLFxuICByZXVzZU1hcHM6IGZhbHNlLFxuXG4gIG1hcFN0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9saWdodC12OCcsXG4gIHZpc2libGU6IHRydWUsXG5cbiAgYmVhcmluZzogMCxcbiAgcGl0Y2g6IDAsXG4gIGFsdGl0dWRlOiAxLjVcbn07XG5cbi8vIFRyeSB0byBnZXQgYWNjZXNzIHRva2VuIGZyb20gVVJMLCBlbnYsIGxvY2FsIHN0b3JhZ2Ugb3IgY29uZmlnXG5leHBvcnQgZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XG4gIGxldCBhY2Nlc3NUb2tlbiA9IG51bGw7XG5cbiAgaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5sb2NhdGlvbikge1xuICAgIGNvbnN0IG1hdGNoID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaC5tYXRjaCgvYWNjZXNzX3Rva2VuPShbXiZcXC9dKikvKTtcbiAgICBhY2Nlc3NUb2tlbiA9IG1hdGNoICYmIG1hdGNoWzFdO1xuICB9XG5cbiAgaWYgKCFhY2Nlc3NUb2tlbiAmJiB0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAvLyBOb3RlOiBUaGlzIGRlcGVuZHMgb24gYnVuZGxlciBwbHVnaW5zIChlLmcuIHdlYnBhY2spIGlubXBvcnRpbmcgZW52aXJvbm1lbnQgY29ycmVjdGx5XG4gICAgYWNjZXNzVG9rZW4gPSBhY2Nlc3NUb2tlbiB8fCBwcm9jZXNzLmVudi5NYXBib3hBY2Nlc3NUb2tlbjsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICB9XG5cbiAgcmV0dXJuIGFjY2Vzc1Rva2VuIHx8IG51bGw7XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBtZXJnZSBkZWZhdWx0UHJvcHMgYW5kIGNoZWNrIHByb3AgdHlwZXNcbmZ1bmN0aW9uIGNoZWNrUHJvcFR5cGVzKHByb3BzLCBjb21wb25lbnQgPSAnY29tcG9uZW50Jykge1xuICAvLyBUT0RPIC0gY2hlY2sgZm9yIHByb2R1Y3Rpb24gKHVubGVzcyBkb25lIGJ5IHByb3AgdHlwZXMgcGFja2FnZT8pXG4gIGlmIChwcm9wcy5kZWJ1Zykge1xuICAgIFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyhwcm9wVHlwZXMsIHByb3BzLCAncHJvcCcsIGNvbXBvbmVudCk7XG4gIH1cbn1cblxuLy8gQSBzbWFsbCB3cmFwcGVyIGNsYXNzIGZvciBtYXBib3gtZ2xcbi8vIC0gUHJvdmlkZXMgYSBwcm9wIHN0eWxlIGludGVyZmFjZSAodGhhdCBjYW4gYmUgdHJpdmlhbGx5IHVzZWQgYnkgYSBSZWFjdCB3cmFwcGVyKVxuLy8gLSBNYWtlcyBzdXJlIG1hcGJveCBkb2Vzbid0IGNyYXNoIHVuZGVyIE5vZGVcbi8vIC0gSGFuZGxlcyBtYXAgcmV1c2UgKHRvIHdvcmsgYXJvdW5kIE1hcGJveCByZXNvdXJjZSBsZWFrIGlzc3Vlcylcbi8vIC0gUHJvdmlkZXMgc3VwcG9ydCBmb3Igc3BlY2lmeWluZyB0b2tlbnMgZHVyaW5nIGRldmVsb3BtZW50XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcGJveCB7XG4gIHN0YXRpYyBzdXBwb3J0ZWQoKSB7XG4gICAgcmV0dXJuIG1hcGJveGdsICYmIG1hcGJveGdsLnN1cHBvcnRlZCgpO1xuICB9XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBpZiAoIW1hcGJveGdsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hcGJveCBub3Qgc3VwcG9ydGVkJyk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcyA9IHt9O1xuICAgIHRoaXMuX2luaXRpYWxpemUocHJvcHMpO1xuICB9XG5cbiAgZmluYWxpemUoKSB7XG4gICAgaWYgKCFtYXBib3hnbCB8fCAhdGhpcy5fbWFwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cbiAgICB0aGlzLl9kZXN0cm95KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIGlmICghbWFwYm94Z2wgfHwgIXRoaXMuX21hcCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgdGhpcy5fdXBkYXRlKHRoaXMucHJvcHMsIHByb3BzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIE1hcGJveCdzIG1hcC5yZXNpemUoKSByZWFkcyBzaXplIGZyb20gRE9NLCBzbyBET00gZWxlbWVudCBtdXN0IGFscmVhZHkgYmUgcmVzaXplZFxuICAvLyBJbiBhIHN5c3RlbSBsaWtlIFJlYWN0IHdlIG11c3Qgd2FpdCB0byByZWFkIHNpemUgdW50aWwgYWZ0ZXIgcmVuZGVyXG4gIC8vIChlLmcuIHVudGlsIFwiY29tcG9uZW50RGlkVXBkYXRlXCIpXG4gIHJlc2l6ZSgpIHtcbiAgICBpZiAoIW1hcGJveGdsIHx8ICF0aGlzLl9tYXApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHRoaXMuX21hcC5yZXNpemUoKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIEV4dGVybmFsIGFwcHMgY2FuIGFjY2VzcyBtYXAgdGhpcyB3YXlcbiAgZ2V0TWFwKCkge1xuICAgIHJldHVybiB0aGlzLl9tYXA7XG4gIH1cblxuICAvLyBQUklWQVRFIEFQSVxuXG4gIF9jcmVhdGUocHJvcHMpIHtcbiAgICAvLyBSZXVzZSBhIHNhdmVkIG1hcCwgaWYgYXZhaWxhYmxlXG4gICAgaWYgKHByb3BzLnJldXNlTWFwcyAmJiBNYXBib3guc2F2ZWRNYXApIHtcbiAgICAgIHRoaXMuX21hcCA9IHRoaXMubWFwID0gTWFwYm94LnNhdmVkTWFwO1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gbnVsbDtcbiAgICAgIC8vIFRPRE8gLSBuZWVkIHRvIGNhbGwgb25sb2FkIGFnYWluLCBuZWVkIHRvIHRyYWNrIHdpdGggUHJvbWlzZT9cbiAgICAgIHByb3BzLm9uTG9hZCgpO1xuICAgICAgY29uc29sZS5kZWJ1ZygnUmV1c2VkIGV4aXN0aW5nIG1hcGJveCBtYXAnLCB0aGlzLl9tYXApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX21hcCA9IHRoaXMubWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgICAgIGNvbnRhaW5lcjogcHJvcHMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHksXG4gICAgICAgIGNlbnRlcjogW3Byb3BzLmxvbmdpdHVkZSwgcHJvcHMubGF0aXR1ZGVdLFxuICAgICAgICB6b29tOiBwcm9wcy56b29tLFxuICAgICAgICBwaXRjaDogcHJvcHMucGl0Y2gsXG4gICAgICAgIGJlYXJpbmc6IHByb3BzLmJlYXJpbmcsXG4gICAgICAgIHN0eWxlOiBwcm9wcy5tYXBTdHlsZSxcbiAgICAgICAgaW50ZXJhY3RpdmU6IGZhbHNlLFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IHByb3BzLmF0dHJpYnV0aW9uQ29udHJvbCxcbiAgICAgICAgcHJlc2VydmVEcmF3aW5nQnVmZmVyOiBwcm9wcy5wcmVzZXJ2ZURyYXdpbmdCdWZmZXJcbiAgICAgIH0pO1xuICAgICAgLy8gQXR0YWNoIG9wdGlvbmFsIG9uTG9hZCBmdW5jdGlvblxuICAgICAgdGhpcy5tYXAub25jZSgnbG9hZCcsIHByb3BzLm9uTG9hZCk7XG4gICAgICB0aGlzLm1hcC5vbignZXJyb3InLCBwcm9wcy5vbkVycm9yKTtcbiAgICAgIGNvbnNvbGUuZGVidWcoJ0NyZWF0ZWQgbmV3IG1hcGJveCBtYXAnLCB0aGlzLl9tYXApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBfZGVzdHJveSgpIHtcbiAgICBpZiAoIU1hcGJveC5zYXZlZE1hcCkge1xuICAgICAgTWFwYm94LnNhdmVkTWFwID0gdGhpcy5fbWFwO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9tYXAucmVtb3ZlKCk7XG4gICAgfVxuICB9XG5cbiAgX2luaXRpYWxpemUocHJvcHMpIHtcbiAgICBwcm9wcyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRQcm9wcywgcHJvcHMpO1xuICAgIGNoZWNrUHJvcFR5cGVzKHByb3BzLCAnTWFwYm94Jyk7XG5cbiAgICAvLyBNYWtlIGVtcHR5IHN0cmluZyBwaWNrIHVwIGRlZmF1bHQgcHJvcFxuICAgIHRoaXMuYWNjZXNzVG9rZW4gPSBwcm9wcy5tYXBib3hBcGlBY2Nlc3NUb2tlbiB8fCBkZWZhdWx0UHJvcHMubWFwYm94QXBpQWNjZXNzVG9rZW47XG5cbiAgICAvLyBDcmVhdGlvbiBvbmx5IHByb3BzXG4gICAgaWYgKG1hcGJveGdsKSB7XG4gICAgICBpZiAoIXRoaXMuYWNjZXNzVG9rZW4pIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAnbm8tdG9rZW4nOyAvLyBQcmV2ZW50cyBtYXBib3ggZnJvbSB0aHJvd2luZ1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSB0aGlzLmFjY2Vzc1Rva2VuO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX2NyZWF0ZShwcm9wcyk7XG5cbiAgICAvLyBEaXNhYmxlIG91dGxpbmUgc3R5bGVcbiAgICBjb25zdCBjYW52YXMgPSB0aGlzLm1hcC5nZXRDYW52YXMoKTtcbiAgICBpZiAoY2FudmFzKSB7XG4gICAgICBjYW52YXMuc3R5bGUub3V0bGluZSA9ICdub25lJztcbiAgICB9XG5cbiAgICB0aGlzLl91cGRhdGVNYXBWaWV3cG9ydCh7fSwgcHJvcHMpO1xuICAgIHRoaXMuX3VwZGF0ZU1hcFNpemUoe30sIHByb3BzKTtcblxuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcbiAgfVxuXG4gIF91cGRhdGUob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgbmV3UHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCB0aGlzLnByb3BzLCBuZXdQcm9wcyk7XG4gICAgY2hlY2tQcm9wVHlwZXMobmV3UHJvcHMsICdNYXBib3gnKTtcblxuICAgIHRoaXMuX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcyk7XG4gICAgdGhpcy5fdXBkYXRlTWFwU2l6ZShvbGRQcm9wcywgbmV3UHJvcHMpO1xuXG4gICAgdGhpcy5wcm9wcyA9IG5ld1Byb3BzO1xuICB9XG5cbiAgX3VwZGF0ZU1hcFZpZXdwb3J0KG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tIHx8XG4gICAgICBuZXdQcm9wcy5waXRjaCAhPT0gb2xkUHJvcHMucGl0Y2ggfHxcbiAgICAgIG5ld1Byb3BzLmJlYXJpbmcgIT09IG9sZFByb3BzLmJlYXJpbmcgfHxcbiAgICAgIG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZTtcblxuICAgIGlmICh2aWV3cG9ydENoYW5nZWQpIHtcbiAgICAgIHRoaXMuX21hcC5qdW1wVG8oe1xuICAgICAgICBjZW50ZXI6IFtuZXdQcm9wcy5sb25naXR1ZGUsIG5ld1Byb3BzLmxhdGl0dWRlXSxcbiAgICAgICAgem9vbTogbmV3UHJvcHMuem9vbSxcbiAgICAgICAgYmVhcmluZzogbmV3UHJvcHMuYmVhcmluZyxcbiAgICAgICAgcGl0Y2g6IG5ld1Byb3BzLnBpdGNoXG4gICAgICB9KTtcblxuICAgICAgLy8gVE9ETyAtIGp1bXBUbyBkb2Vzbid0IGhhbmRsZSBhbHRpdHVkZVxuICAgICAgaWYgKG5ld1Byb3BzLmFsdGl0dWRlICE9PSBvbGRQcm9wcy5hbHRpdHVkZSkge1xuICAgICAgICB0aGlzLl9tYXAudHJhbnNmb3JtLmFsdGl0dWRlID0gbmV3UHJvcHMuYWx0aXR1ZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gTm90ZTogbmVlZHMgdG8gYmUgY2FsbGVkIGFmdGVyIHJlbmRlciAoZS5nLiBpbiBjb21wb25lbnREaWRVcGRhdGUpXG4gIF91cGRhdGVNYXBTaXplKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIGNvbnN0IHNpemVDaGFuZ2VkID0gb2xkUHJvcHMud2lkdGggIT09IG5ld1Byb3BzLndpZHRoIHx8IG9sZFByb3BzLmhlaWdodCAhPT0gbmV3UHJvcHMuaGVpZ2h0O1xuICAgIGlmIChzaXplQ2hhbmdlZCkge1xuICAgICAgdGhpcy5fbWFwLnJlc2l6ZSgpO1xuICAgIH1cbiAgfVxufVxuXG5NYXBib3gucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuTWFwYm94LmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==