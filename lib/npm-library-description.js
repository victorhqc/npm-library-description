'use babel';

import { CompositeDisposable } from 'atom';
import { readFile } from './npm-library-description-render';

export default {
  subscriptions: null,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    this.subscribeToTextChange();
  },

  subscribeToTextChange() {
    this.subscriptions.add(atom.workspace.observeTextEditors(readFile(atom)));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

};
