'use babel';

import reduce from 'lodash/reduce';
import find from 'lodash/find';

import { addDependency } from '../store/dependencies';

import { getEditorKey } from './atom';

export const cleanDependencyName = name =>
  name.replace(/@|\//g, '');

export const mapDependencies = dependencies =>
  reduce(dependencies, (prev, version, dependency) => ([
    ...prev,
    dependency,
  ]), []);

/**
 * Converts dependencies from Object to Array
 * @param  {Object} json Parsed `package.json` file
 * @return {Object}          Object containing `dependencies` as Array
 */
export const mapDependenciesFromJson = json => ({
  dependencies: mapDependencies(json.dependencies),
  devDependencies: mapDependencies(json.devDependencies),
});

export const doesTextMatchJSONKey = text => string =>
  text.match(new RegExp(`"${string}":`));

export const readDependenciesFromJson = (json, { textEditor, store, preferences }) => {
  const {
    dependencies,
    devDependencies,
  } = mapDependenciesFromJson(json);

  const lines = textEditor.getLineCount();
  // Used to avoid filling dependency marker in wrong place.
  // Only if dependency is in `dependencies` or `devDependencies`. should be marked.
  let validLine = false;
  Array.from(Array(lines).keys()).forEach((line) => {
    const text = textEditor.lineTextForBufferRow(line);

    const isDependency = doesTextMatchJSONKey(text)('dependencies');
    const isDevDependency = doesTextMatchJSONKey(text)('devDependencies');

    if (isDependency || isDevDependency) {
      validLine = true;
    }

    // Ends dependencies or devDependencies block
    if (validLine && text.match(/\}$/gi)) {
      validLine = false;
    }

    // Don't add a marker if is not a valid line.
    if (!validLine) {
      return;
    }

    const dependency = find(dependencies, doesTextMatchJSONKey(text));
    const devDependency = find(devDependencies, doesTextMatchJSONKey(text));

    if (dependency || devDependency) {
      store.dispatch(addDependency({
        line,
        npmToken: (preferences.npmToken || undefined),
        name: dependency || devDependency,
        textEditorKey: getEditorKey(textEditor),
      }));
    }
  });
};
