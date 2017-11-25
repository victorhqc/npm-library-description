'use babel';

import compose from 'lodash/fp/compose';

import {
  ADD_DEPENDENCY,
  REMOVE_DEPENDENCY,
} from '../constants/dependencies';

const combine = data => state => ({
  ...state,
  ...data,
});

const isFetching = state => ({
  ...state,
  isFetching: true,
});

const isDone = state => ({
  ...state,
  isFetching: false,
});

const hasError = error => state => ({
  ...state,
  error,
});

const defaultState = {};

export default function dependenciesReducer(state = defaultState, action = {}) {
  const {
    payload,
    type,
  } = action;

  switch (type) {
    case `${ADD_DEPENDENCY}_PENDING`:
      return {
        ...state,
        [payload.name]: compose(
          // 2. add line
          combine(payload),
          // 1. add is fetching
          isFetching,
        )({}),
      };
    case `${ADD_DEPENDENCY}_FULFILLED`:
      return {
        ...state,
        [payload.name]: compose(
          // 2. combine with payload
          combine(payload),
          // 1. is no longer fetching
          isDone,
        )(state[payload.name]),
      };
    case `${ADD_DEPENDENCY}_REJECTED`:
      return {
        ...state,
        [payload.name]: compose(
          // 2. add error
          hasError(payload),
          // 1. is no longer fetching
          isDone,
        )(state[payload.name]),
      };
    case REMOVE_DEPENDENCY:
      return {
        ...state,
        [payload.name]: undefined,
      };
    default:
      return state;
  }
}
