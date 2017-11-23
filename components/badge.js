'use babel';

/* eslint import/prefer-default-export:0 */

import { el, setAttr } from 'redom';

import {
  BADGE,
  TOOLTIP,
} from '../constants/elements';

import {
  removeTooltip,
  removeTooltips,
  addTooltip,
} from './tooltip';

const onBadgeClick = (atom, params) => (e) => {
  e.stopPropagation();
  const badge = e.target;

  const {
    data,
    isFetching,
  } = params.dependency;

  if (isFetching || !data) {
    return undefined;
  }

  // It should be rendered in parent node, but in tests this is not working.
  const targetNode = badge.parentNode || badge;

  if (targetNode.querySelector(`.${TOOLTIP}.${data.name}`)) {
    return removeTooltip(targetNode, data);
  }

  const textEditor = atom.workspace.getActiveTextEditor();
  const view = atom.views.getView(textEditor);

  // Remove all other existing tooltips
  removeTooltips(view);

  return addTooltip(params, targetNode);
};

/**
 * Creates a new Badge HTML element.
 * @param {Object} atom
 */
export const addBadge = (atom, params) => {
  const {
    data,
  } = params.dependency;

  const icon = el('div');

  const title = (data && data.name) || '';

  setAttr(icon, {
    className: `${BADGE} icon icon-package`,
    title,
  });

  icon.addEventListener('click', onBadgeClick(atom, params), false);

  return icon;
};
