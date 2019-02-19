'use babel';

import { compose, applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';

import createReducer from './reducers';

const initStore = (state) => {
  const reducer = createReducer();

  const middlewares = [
    thunkMiddleware,
    promiseMiddleware,
  ];

  return createStore(
    reducer,
    state,
    compose(applyMiddleware(...middlewares)),
  );
};

export default initStore;
