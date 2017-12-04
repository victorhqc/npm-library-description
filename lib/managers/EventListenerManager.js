'use babel';

import {
  getEditorKey,
} from '../helpers/atom';

class EventListenerManager {
  constructor() {
    this.eventListeners = {};
  }

  add(textEditor, { element, eventListener }) {
    const editorKey = getEditorKey(textEditor);

    this.eventListeners[editorKey] = {
      element,
      eventListener,
    };
  }

  get(textEditor) {
    return this.eventListeners[getEditorKey(textEditor)];
  }

  remove(textEditor) {
    this.eventListeners[getEditorKey(textEditor)] = undefined;
  }

  dispose() {
    this.eventListeners = undefined;
  }
}

export default EventListenerManager;
