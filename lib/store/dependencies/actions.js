'use babel';

import fetch from '../../helpers/fetch';

import {
  ADD_DEPENDENCY,
  REMOVE_DEPENDENCY,
} from './constants';

import { selectDependency } from './selectors';

const getHeaders = (npmToken) => {
  if (!npmToken) {
    return {};
  }

  return {
    authorization: `Bearer ${npmToken}`,
  };
};

export const addDependency = ({
  textEditorKey,
  line,
  name,
  npmToken,
}) => (dispatch, getState) => dispatch({
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
          updatedAt: Date.now(),
        });
        return;
      }

      fetch({
        url: name,
        method: 'get',
        headers: getHeaders(npmToken),
      }).then(({ data }) => {
        resolve({
          name,
          data,
          line,
          textEditorKey,
          updatedAt: Date.now(),
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
