'use babel';

import map from 'lodash/map';
import reduce from 'lodash/reduce';
import find from 'lodash/find';
import isJSON from 'is-json';

import {
  addBadge,
} from './elements';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import fetch from './fetch';

const getEditorKey = textEditor =>
  textEditor.getPath();

const mapDependencies = dependencies => reduce(dependencies, (prev, version, dependency) => ([
  ...prev,
  dependency,
]), []);

const clearMarkers = (textEditor) => {
  const markers = textEditor.findMarkers({
    npmLibraryDescription: true,
  });
  map(markers, marker => marker.destroy());
};

const mapDependenciesFromContents = contents => ({
  dependencies: mapDependencies(contents.dependencies),
  devDependencies: mapDependencies(contents.devDependencies),
});

const doesTextMatchDependency = text => dependency =>
  text.match(new RegExp(`"${dependency}":`));

export default class NpmLibraryDescription {
  constructor(atom, validFiles = ['package.json']) {
    this.atom = atom;
    this.validFiles = validFiles;
    this.files = {};
    this.gutter = null;

    this.readFile = this.readFile.bind(this);
    this.activeFile = this.activeFile.bind(this);
  }

  updateMemoryFile(textEditorKey, params = {}) {
    this.files = {
      ...this.files,
      [textEditorKey]: {
        dependencies: {
          ...((this.files[textEditorKey] || { dependencies: {} }).dependencies || {}),
          ...params,
        },
      },
    };
  }

  addDependency(textEditorKey, { dependency, ...params }) {
    this.updateMemoryFile(textEditorKey, {
      [dependency]: {
        dependency,
        ...params,
      },
    });
  }

  getFileDependencies(textEditor) {
    return (this.files[getEditorKey(textEditor)] || {}).dependencies;
  }

  isValidEditor(textEditor) {
    const fileName = textEditor.getTitle();
    if (this.validFiles.indexOf(fileName) < 0) {
      return false;
    }

    return true;
  }

  readFile(textEditor) {
    if (!this.isValidEditor(textEditor)) {
      return;
    }

    const fileName = textEditor.getTitle();

    this.gutter = textEditor.addGutter({
      name: NPM_LIBRARY_DESCRIPTION,
    });

    const text = textEditor.getText();
    if (!isJSON(text)) {
      this.atom.notifications.addWarning(`${NPM_LIBRARY_DESCRIPTION}: There was a problem reading ${fileName}`);
      return;
    }

    this.readDependenciesFromContents(JSON.parse(text), {
      textEditor,
    });
  }

  readDependenciesFromContents(contents, { textEditor, ...params }) {
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

      if (dependency || devDependency) {
        this.addMarkerToLine(line, {
          textEditor,
          textEditorKey,
          line,
          dependency: dependency || devDependency,
          ...params,
        });
      }
    }
  }

  addMarkerToLine(line, params) {
    const {
      textEditorKey,
      dependency,
      textEditor,
    } = params;

    this.fetchDependencyInformation(textEditorKey, {
      dependency,
      line,
      textEditor,
    });
    const initialPoint = [line, 0];

    const marker = textEditor.markBufferPosition(initialPoint);

    marker.setProperties({
      npmLibraryDescription: true,
      line,
    });

    if (marker.isValid() && !marker.isDestroyed()) {
      this.gutter.decorateMarker(marker, {
        type: 'gutter',
        class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
      });
    }
  }

  fetchDependencyInformation(textEditorKey, {
    dependency,
    line,
    textEditor,
  }) {
    this.addDependency(textEditorKey, {
      dependency,
      line,
      isFetching: true,
    });

    fetch({
      url: dependency,
      method: 'get',
    }).then(({ data }) => {
      this.addDependency(textEditorKey, {
        dependency,
        line,
        data,
        isFetching: false,
      });

      map(this.getFileDependencies(textEditor), addBadge(atom, false));
    }).catch(() => {
      this.addDependency(textEditorKey, {
        dependency,
        line,
        error: true,
        isFetching: false,
      });
    });
  }

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

  activeFile(textEditor) {
    if (!textEditor || !this.isValidEditor(textEditor)) {
      return;
    }

    map(this.getFileDependencies(textEditor), addBadge(atom));
  }

  destroy() {
  }
}
