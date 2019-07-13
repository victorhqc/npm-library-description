'use babel';

import { getEditorKey } from '../helpers/atom';

class EventListenerManager {
  constructor() {
    this.eventListeners = {};
  }

  add(textEditor, actionName, { element, eventListener }) {
    const editorKey = getEditorKey(textEditor);

    if (!this.eventListeners[editorKey]) {
      this.eventListeners[editorKey] = {};
    }

    this.eventListeners[editorKey][actionName] = {
      element,
      eventListener,
    };
  }

  get(textEditor, actionName) {
    return (this.eventListeners[getEditorKey(textEditor)] || {})[actionName];
  }

  remove(textEditor, actionName) {
    const {
      element,
      eventListener,
    } = this.get(textEditor, actionName);

    if (!element) {
      return;
    }

    element.removeEventListener(actionName, eventListener);
    this.eventListeners[getEditorKey(textEditor)][actionName] = {};
  }

  dispose(textEditor) {
    Object.keys(this.eventListeners[getEditorKey(textEditor)] || {}).map(
      actionName => this.remove(textEditor, actionName),
    );
  }
}

export default EventListenerManager;
