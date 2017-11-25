'use babel';

import reduce from 'lodash/reduce';
import map from 'lodash/map';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

/**
 * This is used to identify `dependencies` and `gutters` for each `textEditor`
 * @param  {TextEditor} textEditor
 * @return {String}
 */
export const getEditorKey = (textEditor) => {
  if (!textEditor) {
    return false;
  }

  return textEditor.getPath();
};

export const getActiveTextEditor = atom => atom.workspace.getActiveTextEditor();

export const getView = (atom, textEditor) => atom.views.getView(textEditor);

export const calculatePixelsFromLine = (atom, line) => {
  const textEditor = getActiveTextEditor(atom);
  const view = getView(atom, textEditor);

  const lineHeight = textEditor.getLineHeightInPixels();
  const lastVisibleRow = view.component.getLastVisibleRow();
  const firstVisibleRow = view.component.getFirstVisibleRow();
  const leftOffset = view.component.getGutterContainerWidth();

  const linesToBottom = lastVisibleRow - line;
  const linesToTop = line - firstVisibleRow;

  const pixelsToTop = lineHeight * linesToTop;
  const pixelsToBottom = lineHeight * linesToBottom;

  return {
    lineHeight,
    lastVisibleRow,
    firstVisibleRow,
    linesToBottom,
    linesToTop,
    pixelsToTop,
    pixelsToBottom,
    leftOffset,
  };
};

export const getRangeFromLine = (textEditor, line) => {
  const text = textEditor.lineTextForBufferRow(line);

  const characters = reduce(text, (prev, char) => {
    const currentChar = prev.currentChar + 1;

    if (prev.isTabulation && /\s|\t/.test(char)) {
      return {
        ...prev,
        currentChar,
      };
    }

    return {
      isTabulation: false,
      currentChar,
      textStartsAt: prev.isTabulation ? currentChar : prev.textStartsAt,
    };
  }, {
    isTabulation: true, // Needed to know if the text of line is still in tabulation
    currentChar: -1,
    textStartsAt: 0,
  });

  return [[line, characters.textStartsAt], [line, characters.currentChar]];
};

export const addTextMarkerToLine = ({ line, textEditor }) => {
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
