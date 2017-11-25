'use babel';

/* eslint import/prefer-default-export: 0 */

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import {
  addBadge,
} from '../components/badge';

export const addMarkerToLine = ({ atom, textEditor, gutter }) => (dependency) => {
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
