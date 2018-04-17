'use babel';

import { NPM_LIBRARY_DESCRIPTION } from '../constants/elements';

import { getEditorKey } from '../helpers/atom';

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
    const gutter = this.getGutter(textEditor);
    if (gutter) {
      gutter.destroy();
    }

    this.gutters[getEditorKey(textEditor)] = undefined;
  }
}

export default GutterManager;
