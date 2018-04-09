'use babel';

import reduce from 'lodash/reduce';
import find from 'lodash/find';

import { addDependency } from '../store/actions/dependencies';

import { getEditorKey } from './atom';

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

export const doesTextMatchDependency = text => dependency =>
  text.match(new RegExp(`"${dependency}":`));

export const readDependenciesFromJson = (json, { textEditor, store }) => {
  const {
    dependencies,
    devDependencies,
  } = mapDependenciesFromJson(json);

  const lines = textEditor.getLineCount();
  for (let line = 0; line < lines; line += 1) {
    const text = textEditor.lineTextForBufferRow(line);
    const dependency = find(dependencies, doesTextMatchDependency(text));
    const devDependency = find(devDependencies, doesTextMatchDependency(text));

    if (dependency || devDependency) {
      store.dispatch(addDependency({
        line,
        name: dependency || devDependency,
        textEditorKey: getEditorKey(textEditor),
      }));
    }
  }
};
