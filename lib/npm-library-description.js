'use babel';

import { CompositeDisposable } from 'atom';
import NpmLibrary from './NpmLibrary';

export default {
  subscriptions: null,

  config: {
    showTooltipWithMouseEvent: {
      title: 'Show tooltip using mouse event',
      description: `
By default, the package tooltip is shown by clicking an icon in the left side. When this is enabled,
the tooltip will be shown by hovering the mouse over the package text.
`,
      order: 1,
      type: 'boolean',
      default: false,
    },
    showDelay: {
      order: 2,
      description: 'Only applicable when using mouse event to show tooltip',
      type: 'integer',
      default: 600,
      minimum: 1,
    },
  },

  getPreferences() {
    // Get the way to get the tooltip
    const showTooltipWithMouseEvent = atom.config.get('npm-library-description.showTooltipWithMouseEvent');

    // Get the delay to show the tooltip by using mouse event.
    const showDelay = atom.config.get('npm-library-description.showDelay');

    return { showTooltipWithMouseEvent, showDelay };
  },

  startSubscriptions() {
    this.subscriptions = new CompositeDisposable();
  },

  startLibrary(preferences) {
    this.npmLibrary = new NpmLibrary(atom, ['package.json'], preferences);
  },

  activate() {
    this.startSubscriptions();

    const preferences = this.getPreferences();
    this.startLibrary(preferences);

    this.subscribeToTextChange();
    this.subscribeToConfigurationChange();
  },

  updatePreferences(preferences) {
    // Remove all subscriptions
    this.subscriptions.dispose();

    // Clean styles
    this.cleanAlltextEditors();

    this.startSubscriptions();
    this.startLibrary(preferences);

    // Resubscribe to changes
    this.subscribeToTextChange();
    this.subscribeToConfigurationChange();
  },

  subscribeToConfigurationChange() {
    this.subscriptions.add(
      atom.config.onDidChange('npm-library-description.showTooltipWithMouseEvent', {}, (event) => {
        const showTooltipWithMouseEvent = event.newValue;
        const preferences = this.getPreferences();

        this.updatePreferences({ showTooltipWithMouseEvent, ...preferences });
      }));

    this.subscriptions.add(atom.config.onDidChange('npm-library-description.showDelay', {}, (event) => {
      const showDelay = event.newValue;
      const preferences = this.getPreferences();

      this.updatePreferences({ showDelay, ...preferences });
    }));
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
