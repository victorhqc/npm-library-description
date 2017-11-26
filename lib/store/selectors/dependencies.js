'use babel';

import find from 'lodash/find';

export const selectDependencies = state =>
  state.dependencies || {};

export const selectDependency = (state, name) =>
  selectDependencies(state)[name];

export const selectDependencyByLine = (state, line) =>
  find(
    selectDependencies(state),
    dependency => dependency.line === line,
  );
