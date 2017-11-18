'use babel';

import { el, mount, setAttr } from 'redom';
import format from 'date-fns/format';
import map from 'lodash/map';

import {
  NPM_LIBRARY_DESCRIPTION,
  TOOLTIP,
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
  if (!data || !data.homepage) {
    return undefined;
  }

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
  if (!data || !data.name) {
    return undefined;
  }

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

export const addTooltip = ({ data }, badge) => {
  const tooltip = el('div',
    el('h3', data.name),
    el('p', data.description),
    addWebsiteLink(data),
    addNpmLink(data),
    el('small', addLatestVersion(data)),
    el('small', addAuthor(data)),
  );

  setAttr(tooltip, {
    className: `${TOOLTIP} ${data.name}`,
  });

  mount(badge.parentNode, tooltip);
};

export const removeTooltip = (badge, data) => {
  badge.parentNode.querySelector(`.${TOOLTIP}.${data.name}`).remove();
};

export const removeTooltips = (atom) => {
  const target = `body /deep/ .${NPM_LIBRARY_DESCRIPTION} .${TOOLTIP}`;
  const tooltips = getView(atom).querySelectorAll(target);
  map(tooltips, (tooltip) => {
    tooltip.remove();
  });
};
