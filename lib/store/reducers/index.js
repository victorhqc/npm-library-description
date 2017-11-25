'use babel';

import { combineReducers } from 'redux';

import dependencies from './dependencies';
import fetchedDependencies from './fetchedDependencies';

export default () => combineReducers({
  dependencies,
  fetchedDependencies,
});
