'use babel';

/* eslint import/prefer-default-export: 0 */

import { el, mount, setAttr } from 'redom';

import {
  NPM_LIBRARY_DESCRIPTION,
  BADGE,
} from '../constants/elements';

export const addBadge = atom => ({ line }, checkExistingBadge) => {
  const target = `body /deep/ .${NPM_LIBRARY_DESCRIPTION}.line-${line}`;
  const view = atom.views.getView(atom.workspace);
  const element = view.querySelector(target);

  // Already has badge
  if (checkExistingBadge && element.querySelector(`.${BADGE}`)) {
    return;
  }

  const icon = el('div');
  setAttr(icon, {
    className: `${BADGE} icon icon-info`,
  });

  mount(element, icon);
};
