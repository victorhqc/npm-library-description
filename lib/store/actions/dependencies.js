'use babel';

import fetch from '../../helpers/fetch';

import {
  ADD_DEPENDENCY,
  REMOVE_DEPENDENCY,
} from '../constants/dependencies';

import {
  selectDependency,
} from '../selectors/dependencies';

export const addDependency = ({ textEditorKey, line, name }) => (dispatch, getState) => dispatch({
  type: ADD_DEPENDENCY,
  payload: {
    data: {
      line,
      name,
      textEditorKey,
    },
    promise: new Promise((resolve, reject) => {
      const storedDependency = selectDependency(getState(), {
        name,
        textEditorKey,
      });

      if (storedDependency) {
        resolve({
          ...storedDependency,
          line,
        });
        return;
      }

      fetch({
        url: name,
        method: 'get',
      }).then(({ data }) => {
        resolve({
          name,
          data,
          line,
          textEditorKey,
        });
      }).catch(() => {
        reject(new Error('Problems getting dependency'));
      });
    }),
  },
});

export const removeDepenency = ({ textEditorKey, name }) => ({
  type: REMOVE_DEPENDENCY,
  payload: {
    textEditorKey,
    name,
  },
});
