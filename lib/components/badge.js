'use babel';

/* eslint import/prefer-default-export:0 */

import { el, setAttr } from 'redom';

import {
  getActiveTextEditor,
  getView,
} from '../helpers/atom';
import { cleanDependencyName } from '../helpers/dependencies';

import {
  BADGE,
  TOOLTIP,
} from '../constants/elements';

import {
  removeTooltip,
  removeTooltips,
  addTooltip,
} from './tooltip';

const onBadgeClick = (atom, dependency) => (e) => {
  e.stopPropagation();
  const badge = e.target;

  const {
    data,
  } = dependency;

  if (!data) {
    return undefined;
  }

  // It should be rendered in parent node, but in tests this is not working.
  const targetNode = badge.parentNode || badge;

  if (targetNode.querySelector(`.${TOOLTIP}.${cleanDependencyName(data.name)}`)) {
    return removeTooltip(targetNode, data);
  }

  const textEditor = getActiveTextEditor(atom);
  const view = getView(atom, textEditor);

  // Remove all other existing tooltips
  removeTooltips(view);

  return addTooltip({
    atom,
    dependency,
    inGutter: true,
  }, targetNode);
};

/**
 * Creates a new Badge HTML element.
 * @param {Object} atom
 */
export const addBadge = (atom, dependency) => {
  const {
    data,
  } = dependency;

  const icon = el('div');

  const title = (data && data.name) || '';

  setAttr(icon, {
    className: `${BADGE} icon icon-package`,
    title,
  });

  icon.addEventListener('click', onBadgeClick(atom, dependency), false);

  return icon;
};
