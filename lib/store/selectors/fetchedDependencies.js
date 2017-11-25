'use babel';

export const selectFetchedDependencies = state =>
  state.fetchedDependencies || {};

export const selectFetchedDependency = (state, name) =>
  selectFetchedDependencies(state)[name];
