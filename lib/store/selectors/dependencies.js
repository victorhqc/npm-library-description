'use babel';

export const selectDependencies = state =>
  state.dependencies || {};

export const selectDependency = (state, name) =>
  selectDependencies(state)[name];
