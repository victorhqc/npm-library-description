'use babel';

import find from 'lodash/find';

export const selectFetchedDependencies = state =>
  state.fetchedDependencies || {};

export const selectFetchedDependency = (state, name) =>
  selectFetchedDependencies(state)[name];

export const selectDependenctByLine = (state, line) =>
  find(
    selectFetchedDependencies(state),
    dependency => dependency.line === line,
  );
