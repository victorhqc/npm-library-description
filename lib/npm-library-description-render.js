'use babel';

/* eslint import/prefer-default-export: 0 */
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import find from 'lodash/find';

import fetch from './fetch';

const readDependencies = dependencies => map(dependencies, (version, dependency) => {
  fetch({
    url: dependency,
    method: 'get',
  }).then(({ data }) => {
    console.log('dependency', dependency);
    console.log(data);
  }).catch((e) => {
    console.log(`dependency: ${dependency} not found`);
    console.log(e);
  });
});

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

const readDependenciesFromContents = (contents, { textEditor, gutter }) => {
  readDependencies(contents.dependencies);
  readDependencies(contents.devDependencies);
  const dependencies = mapDependenciesFromContents(contents);

  const lines = textEditor.getLineCount();
  for (let line = 0; line < lines; line += 1) {
    const text = textEditor.lineTextForBufferRow(line);
    const dependency = find(dependencies.dependencies, doesTextMatchDependency(text));
    const devDependency = find(dependencies.devDependencies, doesTextMatchDependency(text));
    if (dependency || devDependency) {
      const foundDependency = dependency || devDependency;
      console.log('DEPENDENCY FOUND');
      console.log(`${foundDependency} is in line ${line}`);
    }
  }
};

export const readFile = atom => (textEditor, validFiles = ['package.json']) => {
  const fileName = textEditor.getTitle();
  if (validFiles.indexOf(fileName) < 0) {
    return;
  }

  const gutter = textEditor.addGutter({
    name: 'npm-library-description-render',
  });

  try {
    readDependenciesFromContents(JSON.parse(textEditor.getText()), { textEditor, gutter });
  } catch (e) {
    atom.notifications.addWarning(`npm-library-description: There was a problem reading ${fileName}`);
  }
};
