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

import Hammer from './utils/hammer';

// This module contains constants that must be conditionally required
// due to `window`/`document` references downstream.
export var RECOGNIZERS = Hammer ? [[Hammer.Rotate, { enable: false }], [Hammer.Pinch, { enable: false }], [Hammer.Swipe, { enable: false }], [Hammer.Pan, { threshold: 0, enable: false }], [Hammer.Press, { enable: false }], [Hammer.Tap, { event: 'doubletap', taps: 2, enable: false }], [Hammer.Tap, { enable: false }]] : null;

// Recognize the following gestures even if a given recognizer succeeds
export var RECOGNIZER_COMPATIBLE_MAP = {
  rotate: ['pinch']
};

// Recognize the folling gestures only if a given recognizer fails
export var RECOGNIZER_FALLBACK_MAP = {
  doubletap: ['tap']
};

/**
 * Only one set of basic input events will be fired by Hammer.js:
 * either pointer, touch, or mouse, depending on system support.
 * In order to enable an application to be agnostic of system support,
 * alias basic input events into "classes" of events: down, move, and up.
 * See `_onBasicInput()` for usage of these aliases.
 */
export var BASIC_EVENT_ALIASES = {
  pointerdown: 'pointerdown',
  pointermove: 'pointermove',
  pointerup: 'pointerup',
  touchstart: 'pointerdown',
  touchmove: 'pointermove',
  touchend: 'pointerup',
  mousedown: 'pointerdown',
  mousemove: 'pointermove',
  mouseup: 'pointerup'
};

export var INPUT_EVENT_TYPES = {
  KEY_EVENTS: ['keydown', 'keyup'],
  MOUSE_EVENTS: ['mousedown', 'mousemove', 'mouseup', 'mouseleave'],
  WHEEL_EVENTS: [
  // Chrome, Safari
  'wheel',
  // IE
  'mousewheel',
  // legacy Firefox
  'DOMMouseScroll']
};

/**
 * "Gestural" events are those that have semantic meaning beyond the basic input event,
 * e.g. a click or tap is a sequence of `down` and `up` events with no `move` event in between.
 * Hammer.js handles these with its Recognizer system;
 * this block maps event names to the Recognizers required to detect the events.
 */
export var EVENT_RECOGNIZER_MAP = {
  tap: 'tap',
  doubletap: 'doubletap',
  press: 'press',
  pinch: 'pinch',
  pinchin: 'pinch',
  pinchout: 'pinch',
  pinchstart: 'pinch',
  pinchmove: 'pinch',
  pinchend: 'pinch',
  pinchcancel: 'pinch',
  rotate: 'rotate',
  rotatestart: 'rotate',
  rotatemove: 'rotate',
  rotateend: 'rotate',
  rotatecancel: 'rotate',
  pan: 'pan',
  panstart: 'pan',
  panmove: 'pan',
  panup: 'pan',
  pandown: 'pan',
  panleft: 'pan',
  panright: 'pan',
  panend: 'pan',
  pancancel: 'pan',
  swipe: 'swipe',
  swipeleft: 'swipe',
  swiperight: 'swipe',
  swipeup: 'swipe',
  swipedown: 'swipe'
};

/**
 * Map gestural events typically provided by browsers
 * that are not reported in 'hammer.input' events
 * to corresponding Hammer.js gestures.
 */
export var GESTURE_EVENT_ALIASES = {
  click: 'tap',
  dblclick: 'doubletap',
  mousedown: 'pointerdown',
  mousemove: 'pointermove',
  mouseup: 'pointerup',
  mouseleave: 'pointerleave'
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9tam9sbmlyLmpzL3NyYy9jb25zdGFudHMuanMiXSwibmFtZXMiOlsiSGFtbWVyIiwiUkVDT0dOSVpFUlMiLCJSb3RhdGUiLCJlbmFibGUiLCJQaW5jaCIsIlN3aXBlIiwiUGFuIiwidGhyZXNob2xkIiwiUHJlc3MiLCJUYXAiLCJldmVudCIsInRhcHMiLCJSRUNPR05JWkVSX0NPTVBBVElCTEVfTUFQIiwicm90YXRlIiwiUkVDT0dOSVpFUl9GQUxMQkFDS19NQVAiLCJkb3VibGV0YXAiLCJCQVNJQ19FVkVOVF9BTElBU0VTIiwicG9pbnRlcmRvd24iLCJwb2ludGVybW92ZSIsInBvaW50ZXJ1cCIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsIm1vdXNlZG93biIsIm1vdXNlbW92ZSIsIm1vdXNldXAiLCJJTlBVVF9FVkVOVF9UWVBFUyIsIktFWV9FVkVOVFMiLCJNT1VTRV9FVkVOVFMiLCJXSEVFTF9FVkVOVFMiLCJFVkVOVF9SRUNPR05JWkVSX01BUCIsInRhcCIsInByZXNzIiwicGluY2giLCJwaW5jaGluIiwicGluY2hvdXQiLCJwaW5jaHN0YXJ0IiwicGluY2htb3ZlIiwicGluY2hlbmQiLCJwaW5jaGNhbmNlbCIsInJvdGF0ZXN0YXJ0Iiwicm90YXRlbW92ZSIsInJvdGF0ZWVuZCIsInJvdGF0ZWNhbmNlbCIsInBhbiIsInBhbnN0YXJ0IiwicGFubW92ZSIsInBhbnVwIiwicGFuZG93biIsInBhbmxlZnQiLCJwYW5yaWdodCIsInBhbmVuZCIsInBhbmNhbmNlbCIsInN3aXBlIiwic3dpcGVsZWZ0Iiwic3dpcGVyaWdodCIsInN3aXBldXAiLCJzd2lwZWRvd24iLCJHRVNUVVJFX0VWRU5UX0FMSUFTRVMiLCJjbGljayIsImRibGNsaWNrIiwibW91c2VsZWF2ZSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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LGNBQVk7QUFOdUIsQ0FBOUIiLCJmaWxlIjoiY29uc3RhbnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IEhhbW1lciBmcm9tICcuL3V0aWxzL2hhbW1lcic7XG5cbi8vIFRoaXMgbW9kdWxlIGNvbnRhaW5zIGNvbnN0YW50cyB0aGF0IG11c3QgYmUgY29uZGl0aW9uYWxseSByZXF1aXJlZFxuLy8gZHVlIHRvIGB3aW5kb3dgL2Bkb2N1bWVudGAgcmVmZXJlbmNlcyBkb3duc3RyZWFtLlxuZXhwb3J0IGNvbnN0IFJFQ09HTklaRVJTID0gSGFtbWVyID8gW1xuICBbSGFtbWVyLlJvdGF0ZSwge2VuYWJsZTogZmFsc2V9XSxcbiAgW0hhbW1lci5QaW5jaCwge2VuYWJsZTogZmFsc2V9XSxcbiAgW0hhbW1lci5Td2lwZSwge2VuYWJsZTogZmFsc2V9XSxcbiAgW0hhbW1lci5QYW4sIHt0aHJlc2hvbGQ6IDAsIGVuYWJsZTogZmFsc2V9XSxcbiAgW0hhbW1lci5QcmVzcywge2VuYWJsZTogZmFsc2V9XSxcbiAgW0hhbW1lci5UYXAsIHtldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIsIGVuYWJsZTogZmFsc2V9XSxcbiAgW0hhbW1lci5UYXAsIHtlbmFibGU6IGZhbHNlfV1cbl0gOiBudWxsO1xuXG4vLyBSZWNvZ25pemUgdGhlIGZvbGxvd2luZyBnZXN0dXJlcyBldmVuIGlmIGEgZ2l2ZW4gcmVjb2duaXplciBzdWNjZWVkc1xuZXhwb3J0IGNvbnN0IFJFQ09HTklaRVJfQ09NUEFUSUJMRV9NQVAgPSB7XG4gIHJvdGF0ZTogWydwaW5jaCddXG59O1xuXG4vLyBSZWNvZ25pemUgdGhlIGZvbGxpbmcgZ2VzdHVyZXMgb25seSBpZiBhIGdpdmVuIHJlY29nbml6ZXIgZmFpbHNcbmV4cG9ydCBjb25zdCBSRUNPR05JWkVSX0ZBTExCQUNLX01BUCA9IHtcbiAgZG91YmxldGFwOiBbJ3RhcCddXG59O1xuXG4vKipcbiAqIE9ubHkgb25lIHNldCBvZiBiYXNpYyBpbnB1dCBldmVudHMgd2lsbCBiZSBmaXJlZCBieSBIYW1tZXIuanM6XG4gKiBlaXRoZXIgcG9pbnRlciwgdG91Y2gsIG9yIG1vdXNlLCBkZXBlbmRpbmcgb24gc3lzdGVtIHN1cHBvcnQuXG4gKiBJbiBvcmRlciB0byBlbmFibGUgYW4gYXBwbGljYXRpb24gdG8gYmUgYWdub3N0aWMgb2Ygc3lzdGVtIHN1cHBvcnQsXG4gKiBhbGlhcyBiYXNpYyBpbnB1dCBldmVudHMgaW50byBcImNsYXNzZXNcIiBvZiBldmVudHM6IGRvd24sIG1vdmUsIGFuZCB1cC5cbiAqIFNlZSBgX29uQmFzaWNJbnB1dCgpYCBmb3IgdXNhZ2Ugb2YgdGhlc2UgYWxpYXNlcy5cbiAqL1xuZXhwb3J0IGNvbnN0IEJBU0lDX0VWRU5UX0FMSUFTRVMgPSB7XG4gIHBvaW50ZXJkb3duOiAncG9pbnRlcmRvd24nLFxuICBwb2ludGVybW92ZTogJ3BvaW50ZXJtb3ZlJyxcbiAgcG9pbnRlcnVwOiAncG9pbnRlcnVwJyxcbiAgdG91Y2hzdGFydDogJ3BvaW50ZXJkb3duJyxcbiAgdG91Y2htb3ZlOiAncG9pbnRlcm1vdmUnLFxuICB0b3VjaGVuZDogJ3BvaW50ZXJ1cCcsXG4gIG1vdXNlZG93bjogJ3BvaW50ZXJkb3duJyxcbiAgbW91c2Vtb3ZlOiAncG9pbnRlcm1vdmUnLFxuICBtb3VzZXVwOiAncG9pbnRlcnVwJ1xufTtcblxuZXhwb3J0IGNvbnN0IElOUFVUX0VWRU5UX1RZUEVTID0ge1xuICBLRVlfRVZFTlRTOiBbXG4gICAgJ2tleWRvd24nLFxuICAgICdrZXl1cCdcbiAgXSxcbiAgTU9VU0VfRVZFTlRTOiBbXG4gICAgJ21vdXNlZG93bicsXG4gICAgJ21vdXNlbW92ZScsXG4gICAgJ21vdXNldXAnLFxuICAgICdtb3VzZWxlYXZlJ1xuICBdLFxuICBXSEVFTF9FVkVOVFM6IFtcbiAgICAvLyBDaHJvbWUsIFNhZmFyaVxuICAgICd3aGVlbCcsXG4gICAgLy8gSUVcbiAgICAnbW91c2V3aGVlbCcsXG4gICAgLy8gbGVnYWN5IEZpcmVmb3hcbiAgICAnRE9NTW91c2VTY3JvbGwnXG4gIF1cbn07XG5cbi8qKlxuICogXCJHZXN0dXJhbFwiIGV2ZW50cyBhcmUgdGhvc2UgdGhhdCBoYXZlIHNlbWFudGljIG1lYW5pbmcgYmV5b25kIHRoZSBiYXNpYyBpbnB1dCBldmVudCxcbiAqIGUuZy4gYSBjbGljayBvciB0YXAgaXMgYSBzZXF1ZW5jZSBvZiBgZG93bmAgYW5kIGB1cGAgZXZlbnRzIHdpdGggbm8gYG1vdmVgIGV2ZW50IGluIGJldHdlZW4uXG4gKiBIYW1tZXIuanMgaGFuZGxlcyB0aGVzZSB3aXRoIGl0cyBSZWNvZ25pemVyIHN5c3RlbTtcbiAqIHRoaXMgYmxvY2sgbWFwcyBldmVudCBuYW1lcyB0byB0aGUgUmVjb2duaXplcnMgcmVxdWlyZWQgdG8gZGV0ZWN0IHRoZSBldmVudHMuXG4gKi9cbmV4cG9ydCBjb25zdCBFVkVOVF9SRUNPR05JWkVSX01BUCA9IHtcbiAgdGFwOiAndGFwJyxcbiAgZG91YmxldGFwOiAnZG91YmxldGFwJyxcbiAgcHJlc3M6ICdwcmVzcycsXG4gIHBpbmNoOiAncGluY2gnLFxuICBwaW5jaGluOiAncGluY2gnLFxuICBwaW5jaG91dDogJ3BpbmNoJyxcbiAgcGluY2hzdGFydDogJ3BpbmNoJyxcbiAgcGluY2htb3ZlOiAncGluY2gnLFxuICBwaW5jaGVuZDogJ3BpbmNoJyxcbiAgcGluY2hjYW5jZWw6ICdwaW5jaCcsXG4gIHJvdGF0ZTogJ3JvdGF0ZScsXG4gIHJvdGF0ZXN0YXJ0OiAncm90YXRlJyxcbiAgcm90YXRlbW92ZTogJ3JvdGF0ZScsXG4gIHJvdGF0ZWVuZDogJ3JvdGF0ZScsXG4gIHJvdGF0ZWNhbmNlbDogJ3JvdGF0ZScsXG4gIHBhbjogJ3BhbicsXG4gIHBhbnN0YXJ0OiAncGFuJyxcbiAgcGFubW92ZTogJ3BhbicsXG4gIHBhbnVwOiAncGFuJyxcbiAgcGFuZG93bjogJ3BhbicsXG4gIHBhbmxlZnQ6ICdwYW4nLFxuICBwYW5yaWdodDogJ3BhbicsXG4gIHBhbmVuZDogJ3BhbicsXG4gIHBhbmNhbmNlbDogJ3BhbicsXG4gIHN3aXBlOiAnc3dpcGUnLFxuICBzd2lwZWxlZnQ6ICdzd2lwZScsXG4gIHN3aXBlcmlnaHQ6ICdzd2lwZScsXG4gIHN3aXBldXA6ICdzd2lwZScsXG4gIHN3aXBlZG93bjogJ3N3aXBlJ1xufTtcblxuLyoqXG4gKiBNYXAgZ2VzdHVyYWwgZXZlbnRzIHR5cGljYWxseSBwcm92aWRlZCBieSBicm93c2Vyc1xuICogdGhhdCBhcmUgbm90IHJlcG9ydGVkIGluICdoYW1tZXIuaW5wdXQnIGV2ZW50c1xuICogdG8gY29ycmVzcG9uZGluZyBIYW1tZXIuanMgZ2VzdHVyZXMuXG4gKi9cbmV4cG9ydCBjb25zdCBHRVNUVVJFX0VWRU5UX0FMSUFTRVMgPSB7XG4gIGNsaWNrOiAndGFwJyxcbiAgZGJsY2xpY2s6ICdkb3VibGV0YXAnLFxuICBtb3VzZWRvd246ICdwb2ludGVyZG93bicsXG4gIG1vdXNlbW92ZTogJ3BvaW50ZXJtb3ZlJyxcbiAgbW91c2V1cDogJ3BvaW50ZXJ1cCcsXG4gIG1vdXNlbGVhdmU6ICdwb2ludGVybGVhdmUnXG59O1xuIl19