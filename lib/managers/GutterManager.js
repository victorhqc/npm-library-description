'use babel';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import {
  getEditorKey,
} from '../helpers/atom';

class GutterManager {
  constructor() {
    this.gutters = {};
  }

  addGutter(textEditor) {
    const editorKey = getEditorKey(textEditor);

    this.gutters[editorKey] = textEditor.addGutter({
      name: NPM_LIBRARY_DESCRIPTION,
    });

    return this.gutters[editorKey];
  }

  getGutter(textEditor) {
    return this.gutters[getEditorKey(textEditor)];
  }

  removeGutter(textEditor) {
    this.gutters[getEditorKey(textEditor)] = undefined;
  }

  dispose() {
    this.gutters = undefined;
  }
}

export default GutterManager;
