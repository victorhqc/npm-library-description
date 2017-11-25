'use babel';

import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import first from 'lodash/first';
import difference from 'lodash/difference';

import {
  selectFetchedDependencies,
  selectFetchedDependency,
} from '../selectors/fetchedDependencies';

export default function subscribeToDependencies(store, emitter) {
  let currentState;

  return () => {
    const previousState = currentState;
    const state = store.getState();
    currentState = selectFetchedDependencies(state);

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

    const newDependency = selectFetchedDependency(state, first(newDependencyKey));
    emitter.emit('did-load-dependency', newDependency);
  };
}
