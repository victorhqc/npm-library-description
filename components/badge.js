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
  } = params;

  if (isFetching || !data) {
    return undefined;
  }

  if (badge.parentNode.querySelector(`.${TOOLTIP}.${data.name}`)) {
    return removeTooltip(badge, data);
  }

  // Remove all other existing tooltips
  removeTooltips(atom);

  return addTooltip(params, badge);
};

/**
 * Creates a new Badge HTML element.
 * @param {Object} atom
 */
export const addBadge = (atom, { line, ...params }) => {
  const icon = el('div');
  setAttr(icon, {
    className: `${BADGE} icon icon-info`,
  });

  icon.addEventListener('click', onBadgeClick(atom, params), false);

  return icon;
};
