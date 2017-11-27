'use babel';

import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import first from 'lodash/first';
import difference from 'lodash/difference';
import forEach from 'lodash/forEach';

import {
  selectDependency,
} from '../selectors/dependencies';

export default function subscribeToDependencies(store, emitter) {
  let currentState = (store.getState() || { dependencies: {} }).dependencies;

  return () => {
    const previousState = currentState;
    const state = store.getState();
    currentState = state.dependencies;

    if (!currentState) {
      return;
    }

    if (isEqual(currentState, previousState)) {
      return;
    }

    forEach(currentState, (dependencies, textEditorKey) => {
      const newDependencyKey = difference(
        keys(currentState[textEditorKey]),
        keys(previousState[textEditorKey]),
      );

      if (!newDependencyKey || isEmpty(newDependencyKey)) {
        return;
      }

      const newDependency = selectDependency(state, {
        name: first(newDependencyKey),
        textEditorKey,
      });

      emitter.emit('did-load-dependency', {
        dependency: newDependency,
        textEditorKey,
      });
    });
  };
}
