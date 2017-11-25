'use babel';

import isEqual from 'lodash/isEqual';

import {
  selectDependencies,
} from '../selectors/dependencies';

export default function subscribeToDependencies(store) {
  let currentState;

  return () => {
    const previousState = currentState;
    currentState = selectDependencies(store.getState());

    if (isEqual(currentState, previousState)) {
      return;
    }

    console.log(currentState);
  };
}
