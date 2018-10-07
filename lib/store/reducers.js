'use babel';

import { combineReducers } from 'redux';

import { dependenciesReducer } from './dependencies';

export default () => combineReducers({
  dependencies: dependenciesReducer,
});
