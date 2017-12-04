'use babel';

import isJSON from 'is-json';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import {
  clearMarkers,
} from './markers';

import {
  VALID_FILES,
} from '../constants/textEditor';

import {
  readDependenciesFromJson,
} from './dependencies';

export const isValidEditor = (textEditor, validFiles) => {
  if (!textEditor) {
    return false;
  }

  const fileName = textEditor.getTitle();
  if (validFiles.indexOf(fileName) < 0) {
    return false;
  }

  return true;
};

export const onlyWithValidEditor = (callback, validFiles = VALID_FILES) => (textEditor) => {
  if (!isValidEditor(textEditor, validFiles)) {
    return;
  }

  callback(textEditor);
};

const warnBadParsing = (atom, { textEditor, text }) => {
  if (!isJSON.strict(text)) {
    const fileName = textEditor.getTitle();
    atom.notifications.addWarning(
      `${NPM_LIBRARY_DESCRIPTION}: There was a problem reading ${fileName}`,
    );
    return false;
  }

  return true;
};

export const readFile = (params, textEditor) => {
  const {
    atom,
    store,
  } = params;

  const text = textEditor.getText();
  if (!warnBadParsing(atom, { textEditor, text })) {
    return;
  }

  readDependenciesFromJson(JSON.parse(text), { textEditor, store });
};

export const updateFile = (params, textEditor) => () => {
  const text = textEditor.getText();
  if (!warnBadParsing(atom, { textEditor, text })) {
    return;
  }

  clearMarkers(textEditor);

  const {
    store,
  } = params;

  readDependenciesFromJson(JSON.parse(text), { textEditor, store });
};
