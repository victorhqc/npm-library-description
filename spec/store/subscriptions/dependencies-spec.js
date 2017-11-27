'use babel';

import subscribeToDependencies from '../../../lib/store/subscriptions/dependencies';
import initStore from '../../../lib/store';

import {
  ADD_DEPENDENCY,
} from '../../../lib/store/constants/dependencies';

describe('subscribeToDependencies', () => {
  it('Should call `emit` when a new dependency is fetched', () => {
    const store = initStore({
      dependencies: {
        'another.package.json': {
          'some dependency': {
            line: 1,
            textEditorKey: 'another.package.json',
            name: 'some dependency',
            data: {
              foo: 'bar',
            },
          },
        },
      },
    });
    const emitter = {
      emit: () => {},
    };

    spyOn(emitter, 'emit');
    store.subscribe(subscribeToDependencies(store, emitter, atom));

    const payload = {
      line: 1,
      textEditorKey: 'package.json',
      name: 'some dependency',
      data: {
        foo: 'bar',
      },
    };

    store.dispatch({
      type: `${ADD_DEPENDENCY}_FULFILLED`,
      payload,
    });

    expect(
      emitter.emit,
    ).toHaveBeenCalledWith(
      'did-load-dependency',
      {
        dependency: {
          line: 1,
          textEditorKey: 'package.json',
          name: 'some dependency',
          data: {
            foo: 'bar',
          },
        },
        textEditorKey: 'package.json',
      },
    );

    expect(emitter.emit.calls).toHaveLength(1);
  });

  it('Should not been called when state is empty', () => {
    const store = initStore();
    const emitter = {
      emit: () => {},
    };

    spyOn(emitter, 'emit');
    store.subscribe(subscribeToDependencies(store, emitter, atom));

    const payload = {
      line: 1,
      textEditorKey: 'package.json',
      name: 'some dependency',
      data: {
        foo: 'bar',
      },
    };

    store.dispatch({
      type: 'SOME_RANDOM_EVENT_NOT_BEING_TRACKED',
      payload,
    });

    expect(
      emitter.emit,
    ).not.toHaveBeenCalled();
  });

  it('Should not been called when state doesn\'t change', () => {
    const store = initStore({
      dependencies: {
        'package.json': {
          'some dependency': {
            line: 1,
            textEditorKey: 'package.json',
            name: 'some dependency',
            data: {
              foo: 'bar',
            },
          },
        },
      },
    });
    const emitter = {
      emit: () => {},
    };

    spyOn(emitter, 'emit');
    store.subscribe(subscribeToDependencies(store, emitter, atom));

    const payload = {
      line: 1,
      textEditorKey: 'package.json',
      name: 'some dependency',
      another: 'new key',
      data: {
        foo: 'updated',
      },
    };

    store.dispatch({
      type: `${ADD_DEPENDENCY}_FULFILLED`,
      payload,
    });

    expect(emitter.emit.calls).toHaveLength(0);
  });
});
