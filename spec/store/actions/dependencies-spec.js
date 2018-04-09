'use babel';

import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { addDependency } from '../../../lib/store/actions/dependencies';

import { ADD_DEPENDENCY } from '../../../lib/store/constants/dependencies';

const middlewares = [thunk, promiseMiddleware()];
describe('addDependency', () => {
  let mockFetch;
  let mockStore;

  beforeEach(() => {
    mockFetch = new MockAdapter(axios);
    mockStore = configureMockStore(middlewares);
  });

  afterEach(() => {
    mockFetch.restore();
  });

  it('Should return a dependency information', () => {
    const response = {
      name: 'foo',
      version: '0.0.0',
      foo: 'bar',
    };

    mockFetch.onGet('https://registry.npmjs.org/foo').replyOnce(200, response);

    const expectedActions = [
      {
        type: `${ADD_DEPENDENCY}_PENDING`,
        payload: {
          line: 10,
          name: 'foo',
          textEditorKey: 'some/package.json',
        },
      },
      {
        type: `${ADD_DEPENDENCY}_FULFILLED`,
        payload: {
          line: 10,
          name: 'foo',
          textEditorKey: 'some/package.json',
          data: response,
          updatedAt: window.now,
        },
      },
    ];

    const { dispatch, getActions } = mockStore({});

    waitsForPromise(() => dispatch(addDependency({
      textEditorKey: 'some/package.json',
      line: 10,
      name: 'foo',
    })).then(() => {
      expect(
        getActions(),
      ).toEqual(expectedActions);
    }));
  });

  it('Should avoid calling `npm` API if it was already fetched but it should update line', () => {
    const expectedActions = [
      {
        type: `${ADD_DEPENDENCY}_PENDING`,
        payload: {
          line: 10,
          name: 'foo',
          textEditorKey: 'some/package.json',
        },
      },
      {
        type: `${ADD_DEPENDENCY}_FULFILLED`,
        payload: {
          line: 10,
          name: 'foo',
          data: {
            something: 'old',
          },
          updatedAt: window.now,
        },
      },
    ];

    const { dispatch, getActions } = mockStore({
      dependencies: {
        'some/package.json': {
          foo: {
            name: 'foo',
            line: 9,
            data: {
              something: 'old',
            },
          },
        },
      },
    });

    waitsForPromise(() => dispatch(addDependency({
      textEditorKey: 'some/package.json',
      line: 10,
      name: 'foo',
    })).then(() => {
      expect(
        getActions(),
      ).toEqual(expectedActions);
    }));
  });

  it('Should handle errors', () => {
    const response = {
      error: 'Something went wrong',
    };

    mockFetch.onGet('https://registry.npmjs.org/foo').replyOnce(500, response);

    const expectedActions = [
      {
        type: `${ADD_DEPENDENCY}_PENDING`,
        payload: {
          line: 10,
          name: 'foo',
          textEditorKey: 'some/package.json',
        },
      },
      {
        type: `${ADD_DEPENDENCY}_REJECTED`,
        payload: new Error('Problems getting dependency'),
        error: true,
      },
    ];

    const { dispatch, getActions } = mockStore({});

    waitsForPromise(() => dispatch(addDependency({
      textEditorKey: 'some/package.json',
      line: 10,
      name: 'foo',
    })).catch(() => {
      expect(
        getActions(),
      ).toEqual(expectedActions);
    }));
  });
});
