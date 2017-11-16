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
  if (!data || !data.author || !data.author.name) {
    return undefined;
  }

  return el('span', `Author: ${data.author.name}`);
};

const addWebsiteLink = (data) => {
  const icon = el('i');
  const homepage = el('a', data.homepage);

  const container = el(
    'div',
    icon,
    homepage,
  );

  setAttr(homepage, {
    href: data.homepage,
  });

  setAttr(icon, {
    className: 'icon icon-globe',
    title: 'Website',
  });

  return el('div', container);
};

const addNpmLink = (data) => {
  const icon = el('i');
  const npmlink = `https://npmjs.com/packages/${data.name}`;
  const npm = el('a', npmlink);

  const container = el(
    'div',
    icon,
    npm,
  );

  setAttr(npm, {
    href: npmlink,
  });

  setAttr(icon, {
    className: 'icon icon-repo',
    title: 'npm',
  });

  return el('div', container);
};

const addBubble = ({ data }, badge) => {
  const bubble = el('div',
    el('h3', data.name),
    el('p', data.description),
    addWebsiteLink(data),
    addNpmLink(data),
    el('small', addLatestVersion(data)),
    el('small', addAuthor(data)),
  );

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

const removeIcon = (element) => {
  const badge = element.querySelector(`.${BADGE}`);
  if (badge) {
    badge.remove();
  }
};

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

  if (badge.parentNode.querySelector(`.${BUBBLE}.${data.name}`)) {
    return removeBubble(badge, data);
  }

  // Remove all other existing bubbles;
  removeBubbles(atom);

  return addBubble(params, badge);
};

export const addBadge = (atom, checkExistingBadge = true) => ({ line, ...params }) => {
  const target = `body /deep/ .${NPM_LIBRARY_DESCRIPTION}.line-${line}`;
  const element = getView(atom).querySelector(target);

  // Already has badge
  if (!element || (checkExistingBadge && element.querySelector(`.${BADGE}`))) {
    return;
  }

  // Remove previous icon
  if (!checkExistingBadge) {
    removeIcon(element);
  }

  const icon = el('div');
  setAttr(icon, {
    className: `${BADGE} icon icon-info`,
  });

  icon.addEventListener('click', onBadgeClick(atom, params), false);

  mount(element, icon);
};
