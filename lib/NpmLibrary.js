'use babel';

import map from 'lodash/map';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import debounce from 'lodash/debounce';
import first from 'lodash/first';
import isJSON from 'is-json';

import { CompositeDisposable } from 'atom';

import {
  addTooltip,
} from '../components/tooltip';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import fetch from '../helpers/fetch';

/**
 * This is used to identify `dependencies` and `gutters` for each `textEditor`
 * @param  {TextEditor} textEditor
 * @return {String}
 */
const getEditorKey = textEditor =>
  textEditor.getPath();

const mapDependencies = dependencies => reduce(dependencies, (prev, version, dependency) => ([
  ...prev,
  dependency,
]), []);

/**
 * Removes all the markers from a given TextEditor
 * @param  {TextEditor} textEditor
 */
const clearMarkers = (textEditor) => {
  const markers = textEditor.findMarkers({
    npmLibraryDescription: true,
  });
  map(markers, (marker) => {
    marker.destroy();
  });
};

/**
 * Converts dependencies from Object to Array
 * @param  {Object} contents Parsed `package.json` file
 * @return {Object}          Object containing `dependencies` as Array
 */
const mapDependenciesFromContents = contents => ({
  dependencies: mapDependencies(contents.dependencies),
  devDependencies: mapDependencies(contents.devDependencies),
});

const doesTextMatchDependency = text => dependency =>
  text.match(new RegExp(`"${dependency}":`));

const getRangeFromLine = (textEditor, line) => {
  const text = textEditor.lineTextForBufferRow(line);

  const characters = reduce(text, (prev, char) => {
    const currentChar = prev.currentChar + 1;

    if (prev.isTabulation && /\s|\t/.test(char)) {
      return {
        ...prev,
        currentChar,
      };
    }

    return {
      isTabulation: false,
      currentChar,
      textStartsAt: prev.isTabulation ? currentChar : prev.textStartsAt,
    };
  }, {
    isTabulation: true, // Needed to know if the text of line is still in tabulation
    currentChar: -1,
    textStartsAt: 0,
  });

  return [[line, characters.textStartsAt], [line, characters.currentChar]];
};

/**
 * Adds a new Marker (and decorator) with the stored depencency information.
 * @param {Number} line
 * @param {TextEditor} textEditor
 * @param {String} textEditorKey
 */
const addMarkerToLine = ({ line, textEditor }) => {
  // const initialPoint = [line, 0];

  // const marker = textEditor.markBufferPosition(initialPoint);
  const marker = textEditor.markBufferRange(
    getRangeFromLine(textEditor, line),
  );

  marker.setProperties({
    npmLibraryDescription: true,
    line,
  });

  if (marker.isValid() && !marker.isDestroyed()) {
    // this.gutters[textEditorKey].decorateMarker(marker, {
    //   type: 'gutter',
    //   class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
    //   item: addBadge(atom, storedDependency),
    // });

    textEditor.decorateMarker(marker, {
      type: 'text',
      class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
      // item: addBadge(atom, storedDependency),
    });
  }
};

export default class NpmLibrary {
  constructor(atom, validFiles = ['package.json']) {
    this.atom = atom;
    this.validFiles = validFiles;
    this.dependencies = {};
    this.gutters = {};
    this.eventListeners = {};
    this.subscriptions = new CompositeDisposable();

    this.readFile = this.readFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.destroy = this.destroy.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onDidChangeActiveTextEditor = this.onDidChangeActiveTextEditor.bind(this);
  }

  /**
   * Updates dependency information. Used to avoid refetching the same dependency twice.
   * @param  {String} textEditorKey
   * @param  {Object} [params={}]   { depencency, line, data }
   */
  updateDependency(textEditorKey, params = {}) {
    this.dependencies = {
      ...this.dependencies,
      [textEditorKey]: {
        dependencies: {
          ...((this.dependencies[textEditorKey] || { dependencies: {} }).dependencies || {}),
          ...params,
        },
      },
    };
  }

  /**
   * Adds a new dependency to `this.dependencies`.
   * @param {String} textEditorKey
   * @param {String} dependency
   * @param {Object} params         { depencency, line, data }
   */
  addDependency(textEditorKey, { dependency, ...params }) {
    this.updateDependency(textEditorKey, {
      [dependency]: {
        dependency,
        ...params,
      },
    });
  }

  getDependencies(textEditorKey) {
    return (this.dependencies[textEditorKey] || {
      dependencies: {},
    }).dependencies;
  }

  /**
   * Gets a stored dependency information
   * @param  {String} textEditorKey
   * @param  {String} dependency
   * @return {Object}               { dependency, line, data, isFetching }
   */
  getDependency(textEditorKey, dependency) {
    return this.getDependencies(textEditorKey)[dependency];
  }

  getDependencyByLine(textEditorKey, line) {
    return find(
      this.getDependencies(textEditorKey),
      dependency => dependency.line === line,
    );
  }

  /**
   * Useful to know if depencency was already fetched.
   * @param  {String}  textEditorKey
   * @param  {String}  dependency
   * @return {Boolean}
   */
  isDependencyFetched(textEditorKey, dependency) {
    const storedDependency = this.getDependency(textEditorKey, dependency);

    if (!storedDependency || !storedDependency.data) {
      return false;
    }

    return true;
  }

  /**
   * Used to apply logic only to valid files, i.e. package.json. All other files should
   * be ignored.
   * @param  {TextEditor}  textEditor
   * @return {Boolean}
   */
  isValidEditor(textEditor) {
    const fileName = textEditor.getTitle();
    if (this.validFiles.indexOf(fileName) < 0) {
      return false;
    }

    return true;
  }

  observeMouse(textEditor) {
    const view = this.atom.views.getView(textEditor);

    if (!view) {
      return;
    }

    // No need ro register it again.
    const currentEventListener = this.eventListeners[getEditorKey(textEditor)];
    if (currentEventListener) {
      return;
    }

    const eventListener = debounce(
      this.onMouseMove({ view, textEditor }),
      300,
    );

    this.eventListeners[getEditorKey(textEditor)] = {
      element: view,
      eventListener,
    };

    view.addEventListener('mousemove', eventListener);
  }

  onMouseMove({ view, textEditor }) {
    const textEditorKey = getEditorKey(textEditor);
    return (event) => {
      const regexp = new RegExp(NPM_LIBRARY_DESCRIPTION, 'g');
      const element = event.target;

      // Not a valid element
      if (!regexp.test(element.className)) {
        return;
      }

      const position = view.component.screenPositionForMouseEvent(event);
      const line = first(position.toArray());

      const dependency = this.getDependencyByLine(textEditorKey, line);
      if (!dependency) {
        return;
      }

      const lineHeight = textEditor.getLineHeightInPixels();
      const lastVisibleRow = view.component.getLastVisibleRow();
      const linesToBottom = lastVisibleRow - line;
      const pixelsToBottom = lineHeight * linesToBottom;

      addTooltip({ dependency, pixelsToBottom }, element);
    };
  }

  /**
   * Initial read of the opened file, creates the gutter and add dependency badges.
   * @param  {TextEditor} textEditor
   */
  readFile(textEditor) {
    if (!this.isValidEditor(textEditor)) {
      return;
    }

    const fileName = textEditor.getTitle();

    this.observeMouse(textEditor);

    this.gutters[getEditorKey(textEditor)] = textEditor.addGutter({
      name: NPM_LIBRARY_DESCRIPTION,
    });

    const text = textEditor.getText();
    if (!isJSON.strict(text)) {
      this.atom.notifications.addWarning(
        `${NPM_LIBRARY_DESCRIPTION}: There was a problem reading ${fileName}`,
      );
      return;
    }

    this.readDependenciesFromContents(JSON.parse(text), {
      textEditor,
    });
  }

  /**
   * Gets the dependencies from the `package.json`
   * @param  {Object} contents   Parsed `package.json` file
   * @param  {TextEditor} textEditor
   */
  readDependenciesFromContents(contents, { textEditor }) {
    const {
      dependencies,
      devDependencies,
    } = mapDependenciesFromContents(contents);

    const textEditorKey = getEditorKey(textEditor);

    const lines = textEditor.getLineCount();
    for (let line = 0; line < lines; line += 1) {
      const text = textEditor.lineTextForBufferRow(line);
      const dependency = find(dependencies, doesTextMatchDependency(text));
      const devDependency = find(devDependencies, doesTextMatchDependency(text));

      if ((dependency || devDependency)) {
        this.fetchDependencyInformation(textEditorKey, {
          textEditorKey,
          dependency: dependency || devDependency,
          line,
        }).then(addMarkerToLine({ line, textEditor, textEditorKey }));
      }
    }
  }

  /**
   * Fetches dependency informatin from `npm` and adds the dependency to `this.dependencies`
   * @param  {String} textEditorKey
   * @param  {String} dependency
   * @param  {Number} line
   * @return {Promise}
   */
  fetchDependencyInformation(textEditorKey, {
    dependency,
    line,
  }) {
    return new Promise((resolve, reject) => {
      if (this.isDependencyFetched(textEditorKey, dependency)) {
        resolve(this.getDependency(textEditorKey, dependency));
        return;
      }

      this.addDependency(textEditorKey, {
        dependency,
        line,
        isFetching: true,
      });

      fetch({
        url: dependency,
        method: 'get',
      }).then(({ data }) => {
        const updatedDependency = {
          dependency,
          line,
          data,
          isFetching: false,
        };

        this.addDependency(textEditorKey, updatedDependency);

        resolve(updatedDependency);
      }).catch(() => {
        this.addDependency(textEditorKey, {
          dependency,
          line,
          error: true,
          isFetching: false,
        });

        reject();
      });
    });
  }

  /**
   * Updates the file markers when it's updated.
   * @param  {TextEditor} textEditor
   */
  updateFile(textEditor) {
    return () => {
      if (!textEditor || !this.isValidEditor(textEditor)) {
        return;
      }

      const text = textEditor.getText();
      if (!isJSON(text)) {
        return;
      }
      clearMarkers(textEditor);

      this.readDependenciesFromContents(JSON.parse(text), {
        textEditor,
      });
    };
  }

  onDidChangeActiveTextEditor(textEditor) {
    if (!textEditor || !this.isValidEditor(textEditor)) {
      return;
    }

    // Execute this at the end of stack
    this.observeMouse(textEditor);
  }

  /**
   * Remove all markers from textEditor, as well as the gutters and subscriptions generated.
   * @param  {TextEditor} textEditor
   */
  destroy(textEditor) {
    if (!textEditor || !this.isValidEditor(textEditor)) {
      return;
    }

    clearMarkers(textEditor);
    this.gutters[getEditorKey(textEditor)].destroy();
    this.subscriptions.dispose();

    const {
      element,
      eventListener,
    } = this.eventListeners[getEditorKey(textEditor)];

    element.removeEventListener('mouseover', eventListener);
  }
}
