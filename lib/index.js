'use babel';

import { CompositeDisposable, Emitter } from 'atom';
// import NpmLibrary from './NpmLibrary';
import initStore from './store';
import subscribeToDependencies from './store/subscriptions/dependencies';

import {
  isValidEditor,
  readFile,
} from './helpers/textEditor';

import {
  addMarker,
} from './helpers/markers';

import {
  addMouseEventListener,
} from './helpers/eventListeners';

import MarkerManager from './managers/MarkerManager';
import GutterManager from './managers/GutterManager';
import EventListenerManager from './managers/EventListenerManager';

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


  activate() {
    this.startSubscriptions();
    this.initEmitter();
    this.initStore();
    this.initManagers();
    this.gutters = {};

    const preferences = this.getPreferences();
    this.subscribe(preferences);
  },

  subscribe(preferences) {
    this.subscribeToTextChange(preferences);
    this.subscribeToConfigurationChange();
  },

  initEmitter() {
    this.emitter = new Emitter();
  },

  initStore() {
    this.store = initStore({});

    this.store.subscribe(subscribeToDependencies(this.store, this.emitter));
  },

  initManagers() {
    this.markerManager = new MarkerManager(this.emitter);
    this.gutterManager = new GutterManager();
    this.eventListenerManager = new EventListenerManager();
  },

  updatePreferences(preferences) {
    // Remove all subscriptions
    this.subscriptions.dispose();

    // Clean styles
    this.cleanAlltextEditors();
    this.startSubscriptions();

    // Resubscribe to changes
    this.subscribe(preferences);
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

  subscribeToTextChange(preferences) {
    const params = { atom, store: this.store, preferences };
    this.subscriptions.add(atom.workspace.observeTextEditors((textEditor) => {
      if (!isValidEditor(textEditor)) {
        return;
      }

      const gutter = this.gutterManager.addGutter(textEditor);

      // Read file contents.
      readFile(params, textEditor);

      // Add event listener.
      addMouseEventListener(params, {
        textEditor,
        eventListenerManager: this.eventListenerManager,
        store: this.store,
      });

      // Add markers once dependency data is loaded
      this.subscriptions.add(this.markerManager.onDidLoadDependency(
        addMarker({
          atom,
          textEditor,
          gutter,
          preferences,
        }),
      ));

      // this.subscriptions.add(textEditor.onDidSave(
      //   this.npmLibrary.updateFile(textEditor),
      // ));
      //
      // this.subscriptions.add(textEditor.onDidChangeTitle(
      //   this.npmLibrary.updateFile(textEditor),
      // ));

      // this.subscriptions.add(textEditor.onDidDestroy(
      //   this.npmLibrary.removeFile(textEditor),
      // ));
    }));

    this.subscriptions.add(atom.workspace.onDidChangeActiveTextEditor((textEditor) => {
      if (!isValidEditor(textEditor)) {
        return;
      }

      readFile(params, textEditor);
    },
    ));
  },

  cleanAlltextEditors() {
    // atom.workspace.getTextEditors().forEach(this.npmLibrary.destroy);
  },

  deactivate() {
    this.subscriptions.dispose();
    this.gutterManager.dispose();
    this.eventListenerManager.dispose();
    this.cleanAlltextEditors();

    this.gutterManager = undefined;
    this.markerManager = undefined;

    this.store = undefined;
    this.emitter = undefined;
  },

};
