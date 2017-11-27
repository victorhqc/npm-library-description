'use babel';

import find from 'lodash/find';

export const selectDependencies = (state, { textEditorKey }) =>
  state.dependencies[textEditorKey] || {};

export const selectDependency = (state, { textEditorKey, name }) =>
  selectDependencies(state, { textEditorKey })[name];

export const selectDependencyByLine = (state, { textEditorKey, line }) =>
  find(
    selectDependencies(state, { textEditorKey }),
    dependency => dependency.line === line,
  );
