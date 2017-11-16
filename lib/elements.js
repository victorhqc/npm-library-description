'use babel';

/* eslint import/prefer-default-export: 0 */

import { el, mount, setAttr } from 'redom';
import format from 'date-fns/format';
import map from 'lodash/map';

import {
  NPM_LIBRARY_DESCRIPTION,
  BADGE,
  BUBBLE,
  DATE_FORMAT,
} from '../constants/elements';

const getView = atom => atom.views.getView(atom.workspace);

const getLatestVersion = (data) => {
  const version = data['dist-tags'];
  if (!version || !version.latest) {
    return {
      description: 'No latest version',
    };
  }

  return {
    description: `Latest version: ${version.latest}`,
    releaseDate: `, Released on ${format(data.time[version.latest], DATE_FORMAT)}`,
  };
};

const addLatestVersion = (data) => {
  const version = getLatestVersion(data);
  const latest = el('span', version.description);
  const releaseDate = version.releaseDate ? el('span', version.releaseDate) : undefined;

  return el('div', latest, releaseDate);
};

const addAuthor = (data) => {
  if (!data.author && !data.author.name) {
    return undefined;
  }

  return el('span', `Author: ${data.author.name}`);
};

const addBubble = ({ data }, badge) => {
  const link = el('a', data.homepage);

  const bubble = el('div',
    el('h3', data.name),
    el('p', data.description),
    link,
    el('small', addLatestVersion(data)),
    el('small', addAuthor(data)),
  );

  setAttr(link, {
    href: data.homepage,
  });

  setAttr(bubble, {
    className: `${BUBBLE} ${data.name}`,
  });

  mount(badge.parentNode, bubble);
};

const removeBubble = (badge, data) => {
  badge.parentNode.querySelector(`.${BUBBLE}.${data.name}`).remove();
};

const removeBubbles = (atom) => {
  const target = `body /deep/ .${NPM_LIBRARY_DESCRIPTION} .${BUBBLE}`;
  const bubbles = getView(atom).querySelectorAll(target);
  map(bubbles, (bubble) => {
    bubble.remove();
  });
};

const onBadgeClick = (atom, params) => (e) => {
  e.stopPropagation();
  const badge = e.target;

  const {
    data,
  } = params;

  if (badge.parentNode.querySelector(`.${BUBBLE}.${data.name}`)) {
    return removeBubble(badge, data);
  }

  // Remove all other existing bubbles;
  removeBubbles(atom);

  return addBubble(params, badge);
};

export const addBadge = atom => ({ line, ...params }, checkExistingBadge) => {
  const target = `body /deep/ .${NPM_LIBRARY_DESCRIPTION}.line-${line}`;
  const element = getView(atom).querySelector(target);

  // Already has badge
  if (checkExistingBadge && element.querySelector(`.${BADGE}`)) {
    return;
  }

  const icon = el('div');
  setAttr(icon, {
    className: `${BADGE} icon icon-info`,
  });

  icon.addEventListener('click', onBadgeClick(atom, params), false);

  mount(element, icon);
};
