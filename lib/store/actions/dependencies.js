'use babel';

import fetch from '../../helpers/fetch';

import {
  ADD_DEPENDENCY,
  REMOVE_DEPENDENCY,
} from '../constants/dependencies';

import {
  selectDependency,
} from '../selectors/dependencies';

export const addDependency = ({ line, name }) => (dispatch, getState) => dispatch({
  type: ADD_DEPENDENCY,
  payload: {
    data: {
      line,
      name,
    },
    promise: new Promise((resolve, reject) => {
      const storedDependency = selectDependency(getState);
      if (storedDependency) {
        resolve({
          ...storedDependency,
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
        });
      }).catch(() => {
        reject(new Error('Problems getting dependency'));
      });
    }),
  },
});

export const removeDepenency = ({ name }) => ({
  type: REMOVE_DEPENDENCY,
  name,
});
