'use babel';

import map from 'lodash/map';
import reduce from 'lodash/reduce';
import find from 'lodash/find';

import {
  addBadge,
} from './elements';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

// import fetch from './fetch';

const getEditorKey = textEditor =>
  textEditor.getPath();

// const readDependencies = dependencies => map(dependencies, (version, dependency) => {
//   fetch({
//     url: dependency,
//     method: 'get',
//   }).then(({ data }) => {
//     console.log('dependency', dependency);
//     console.log(data);
//   }).catch(() => {
//     console.log(`dependency: ${dependency} not found`);
//   });
// });

const mapDependencies = dependencies => reduce(dependencies, (prev, version, dependency) => ([
  ...prev,
  dependency,
]), []);

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

    this.readFile = this.readFile.bind(this);
    this.activeFile = this.activeFile.bind(this);
  }

  updateFile(textEditorKey, params = {}) {
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

  addFile(textEditorKey) {
    this.updateFile(textEditorKey);
  }

  addDependency(textEditorKey, { dependency, line }) {
    this.updateFile(textEditorKey, {
      [dependency]: {
        dependency,
        line,
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
    const fileName = textEditor.getTitle();
    if (!this.isValidEditor(textEditor)) {
      return;
    }

    const gutter = textEditor.addGutter({
      name: NPM_LIBRARY_DESCRIPTION,
    });

    try {
      this.readDependenciesFromContents(JSON.parse(textEditor.getText()), {
        textEditor,
        gutter,
      });
    } catch (e) {
      this.atom.notifications.addWarning(`${NPM_LIBRARY_DESCRIPTION}: There was a problem reading ${fileName}`);
    }
  }

  readDependenciesFromContents(contents, { textEditor, ...params }) {
    // readDependencies(contents.dependencies);
    // readDependencies(contents.devDependencies);

    const dependencies = mapDependenciesFromContents(contents);

    const textEditorKey = getEditorKey(textEditor);

    const lines = textEditor.getLineCount();
    for (let line = 0; line < lines; line += 1) {
      const text = textEditor.lineTextForBufferRow(line);
      const dependency = find(dependencies.dependencies, doesTextMatchDependency(text));
      const devDependency = find(dependencies.devDependencies, doesTextMatchDependency(text));

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
      gutter,
    } = params;

    this.addDependency(textEditorKey, {
      dependency,
      line,
    });
    const initialPoint = [line, 0];

    const marker = textEditor.markBufferPosition(initialPoint);

    marker.setProperties({
      npmLibraryDescription: true,
      line,
    });

    if (marker.isValid() && !marker.isDestroyed()) {
      gutter.decorateMarker(marker, {
        type: 'gutter',
        class: `${NPM_LIBRARY_DESCRIPTION} line-${line}`,
      });
    }
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
