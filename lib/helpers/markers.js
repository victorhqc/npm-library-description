'use babel';

/* eslint import/prefer-default-export: 0 */

import map from 'lodash/map';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import {
  getRangeFromLine,
} from './atom';

import {
  addBadge,
} from '../components/badge';

export const addMarkerToLine = ({
  atom,
  textEditor,
  gutter,
  dependency,
}) => {
  const {
    line,
  } = dependency;

  const initialPoint = [line, 0];

  const marker = textEditor.markBufferPosition(initialPoint);

  marker.setProperties({
    npmLibraryDescription: true,
    line,
  });

  if (marker.isValid() && !marker.isDestroyed()) {
    gutter.decorateMarker(marker, {
      type: 'gutter',
      class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
      item: addBadge(atom, dependency,
      ),
    });
  }
};

export const addTextMarkerToLine = ({ textEditor, dependency }) => {
  const {
    line,
  } = dependency;

  const marker = textEditor.markBufferRange(
    getRangeFromLine(textEditor, line),
  );

  marker.setProperties({
    npmLibraryDescription: true,
    line,
  });

  if (marker.isValid() && !marker.isDestroyed()) {
    textEditor.decorateMarker(marker, {
      type: 'text',
      class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
    });
  }
};

export const addMarker = ({
  atom,
  textEditor,
  gutter,
  preferences,
}) => (dependency) => {
  const {
    showTooltipWithMouseEvent,
  } = preferences;

  if (showTooltipWithMouseEvent) {
    addTextMarkerToLine({ textEditor, dependency });
    return;
  }

  addMarkerToLine({
    atom,
    textEditor,
    gutter,
    dependency,
  });
};

/**
 * Removes all the markers from a given TextEditor
 * @param  {TextEditor} textEditor
 */
export const clearMarkers = (textEditor) => {
  const markers = textEditor.findMarkers({
    npmLibraryDescription: true,
  });
  map(markers, (marker) => {
    marker.destroy();
  });
};
