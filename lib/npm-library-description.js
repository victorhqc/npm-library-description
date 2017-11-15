'use babel';

import { CompositeDisposable } from 'atom';
import NpmLibraryDescription from './NpmLibraryDescription';

export default {
  subscriptions: null,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.npmLibraryDescription = new NpmLibraryDescription(atom, ['package.json']);

    this.subscribeToTextChange();
  },

  subscribeToTextChange() {
    this.subscriptions.add(atom.workspace.observeTextEditors(
      this.npmLibraryDescription.readFile,
    ));

    this.subscriptions.add(atom.workspace.observeActiveTextEditor(
      this.npmLibraryDescription.activeFile,
    ));
  },

  deactivate() {
    this.subscriptions.dispose();
    this.this.subscribeToTextChange.destroy();
  },

};
