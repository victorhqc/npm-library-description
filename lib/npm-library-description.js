'use babel';

import { CompositeDisposable } from 'atom';
import NpmLibrary from './NpmLibrary';

export default {
  subscriptions: null,

  activate() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    this.npmLibrary = new NpmLibrary(atom, ['package.json']);

    this.subscribeToTextChange();
  },

  subscribeToTextChange() {
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      this.npmLibrary.readFile(textEditor);

      this.subscriptions.add(textEditor.onDidSave(
        this.npmLibrary.updateFile(textEditor),
      ));

      this.subscriptions.add(textEditor.onDidChangeTitle(
        this.npmLibrary.updateFile(textEditor),
      ));
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor(
      this.npmLibrary.onDidChangeActiveTextEditor,
    ));
  },

  cleanAlltextEditors() {
    atom.workspace.getTextEditors().forEach(this.npmLibrary.destroy);
  },

  deactivate() {
    this.subscriptions.dispose();
    this.cleanAlltextEditors();
  },

};
