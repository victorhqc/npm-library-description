'use babel';

import {
  ADD_DEPENDENCY,
} from '../constants/dependencies';

const defaultState = {};

export default function dependencies(state = defaultState, action = {}) {
  const {
    payload,
    type,
  } = action;

  switch (type) {
    case `${ADD_DEPENDENCY}_FULFILLED`:
      return {
        ...state,
        [payload.name]: payload,
      };
    default:
      return state;
  }
}
