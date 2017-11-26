'use babel';

import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import first from 'lodash/first';
import difference from 'lodash/difference';

import {
  selectDependencies,
  selectDependency,
} from '../selectors/dependencies';

export default function subscribeToDependencies(store, emitter) {
  let currentState;

  return () => {
    const previousState = currentState;
    const state = store.getState();
    currentState = selectDependencies(state);

    if (isEqual(currentState, previousState)) {
      return;
    }

    const newDependencyKey = difference(
      keys(currentState),
      keys(previousState),
    );

    if (!newDependencyKey) {
      return;
    }

    const newDependency = selectDependency(state, first(newDependencyKey));
    emitter.emit('did-load-dependency', newDependency);
  };
}
