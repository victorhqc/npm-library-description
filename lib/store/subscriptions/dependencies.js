'use babel';

import isEqual from 'lodash/isEqual';
import reduce from 'lodash/reduce';
import forEach from 'lodash/forEach';

import {
  selectDependency,
} from '../selectors/dependencies';

const getUpdatedDependency = (state, nextState) =>
  reduce(nextState, (prev, nextDependency, key) => {
    if (!state && nextDependency) {
      return key;
    }

    if (!isEqual(nextDependency, state[key])) {
      return key;
    }

    return prev;
  }, null);

export default function subscribeToDependencies(store, emitter) {
  let nextState = (store.getState() || { dependencies: {} }).dependencies;

  return () => {
    const state = nextState;
    const storeState = store.getState();
    nextState = storeState.dependencies;

    if (!nextState) {
      return;
    }

    if (isEqual(nextState, state)) {
      return;
    }

    forEach(nextState, (dependencies, textEditorKey) => {
      const newDependencyKey = getUpdatedDependency(
        state[textEditorKey],
        nextState[textEditorKey],
      );

      if (!newDependencyKey) {
        return;
      }

      const newDependency = selectDependency(storeState, {
        name: newDependencyKey,
        textEditorKey,
      });

      if (!newDependency) {
        return;
      }

      emitter.emit('did-load-dependency', {
        dependency: newDependency,
        textEditorKey,
      });
    });
  };
}
