'use babel';

import map from 'lodash/map';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import isJSON from 'is-json';

import { CompositeDisposable } from 'atom';

import {
  addBadge,
} from '../components/badge';

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

export default class NpmLibrary {
  constructor(atom, validFiles = ['package.json']) {
    this.atom = atom;
    this.validFiles = validFiles;
    this.dependencies = {};
    this.gutters = {};
    this.subscriptions = new CompositeDisposable();

    this.readFile = this.readFile.bind(this);
    this.updateFile = this.updateFile.bind(this);
    this.destroy = this.destroy.bind(this);
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

  /**
   * Gets a stored dependency information
   * @param  {String} textEditorKey
   * @param  {String} dependency
   * @return {Object}               { dependency, line, data, isFetching }
   */
  getDependency(textEditorKey, dependency) {
    return (this.dependencies[textEditorKey] || {
      dependencies: {},
    }).dependencies[dependency];
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

  /**
   * Initial read of the opened file, creates the gutter and add dependency badges.
   * @param  {TextEditor} textEditor
   */
  readFile(textEditor) {
    if (!this.isValidEditor(textEditor)) {
      return;
    }

    const fileName = textEditor.getTitle();

    this.gutters[getEditorKey(textEditor)] = textEditor.addGutter({
      name: NPM_LIBRARY_DESCRIPTION,
    });

    const text = textEditor.getText();
    if (!isJSON(text)) {
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
        }).then(this.addMarkerToLine({ line, textEditor, textEditorKey }));
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
   * Adds a new Marker (and decorator) with the stored depencency information.
   * @param {Number} line
   * @param {TextEditor} textEditor
   * @param {String} textEditorKey
   */
  addMarkerToLine({ line, textEditor, textEditorKey }) {
    return (storedDependency) => {
      const initialPoint = [line, 0];

      const marker = textEditor.markBufferPosition(initialPoint);

      marker.setProperties({
        npmLibraryDescription: true,
        line,
      });

      if (marker.isValid() && !marker.isDestroyed()) {
        this.gutters[textEditorKey].decorateMarker(marker, {
          type: 'gutter',
          class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
          item: addBadge(atom, storedDependency),
        });
      }
    };
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
  }
}
