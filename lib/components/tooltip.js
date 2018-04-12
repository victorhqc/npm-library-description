'use babel';

import { el, mount, setAttr } from 'redom';
import format from 'date-fns/format';
import map from 'lodash/map';
import isGithubUrl from 'is-github-url'
import isGitlabUrl from 'is-gitlab-url'
import {Directory, File} from 'atom'

import {
  getView,
  getEditorKey,
  getActiveTextEditor,
} from '../helpers/atom';

import { calculatePixelsFromLine } from '../helpers/atom';

import {
  TOOLTIP,
  DATE_FORMAT,
  MIN_HEIGHT,
  ICON_CLASSES,
} from '../constants/elements';

export const removeTooltip = (element, data) => {
  element.querySelector(`.${TOOLTIP}.${data.name}`).remove();
};

export const removeTooltips = (element) => {
  const target = `.${TOOLTIP}`;
  const tooltips = element.querySelectorAll(target);
  map(tooltips, (tooltip) => {
    tooltip.remove();
  });
};

const addLatestVersion = (data) => {
  const version = data['dist-tags'];
  if (!version || !version.latest) {
    return el('p', 'No latest version');
  }

  return el('p',
    el('strong', 'Latest version:'),
    el('span', ` ${version.latest}`),
  );
};

const addReleaseDate = (data) => {
  const version = data['dist-tags'];
  if (!version || !version.latest) {
    return undefined;
  }

  return el('p',
    el('strong', 'Release date:'),
    el('span', ` ${format(data.time[version.latest], DATE_FORMAT)}`),
  );
};

const getRepoIcon = (homepage, iconClass = ICON_CLASSES) => {
  if (isGithubUrl(homepage)) {
    return `${iconClass} github-icon`;
  }

  if (isGitlabUrl(homepage)) {
    return `${iconClass} gitlab-icon`;
  }

  return iconClass;
};

const addAuthor = (data) => {
  if (!data || !data.author || !data.author.name) {
    return undefined;
  }

  return el('p',
    el('strong', 'Author:'),
    el('span', ` ${data.author.name}`),
  );
};

const addWebsiteLink = (data) => {
  if (!data || !data.homepage) {
    return undefined;
  }

  const icon = el('i');
  setAttr(icon, {
    className: getRepoIcon(data.homepage),
    'data-name': '.gitignore',
  });

  const iconWrapper = el('span', icon);
  setAttr(iconWrapper, {
    className: 'tab selected',
  });

  const homepage = el('a', iconWrapper);
  setAttr(homepage, {
    className: 'btn',
    href: data.homepage,
    title: data.homepage,
  });

  return homepage;
};

const addNpmLink = (data) => {
  if (!data || !data.name) {
    return undefined;
  }
  const npmlink = `https://npmjs.com/package/${data.name}`;

  const icon = el('i');
  setAttr(icon, {
    className: 'icon icon-repo npm-icon',
    'data-name': '.npmrc',
  });

  const iconWrapper = el('span', icon);
  setAttr(iconWrapper, {
    className: 'tab selected',
  });

  const npm = el('a', iconWrapper);
  setAttr(npm, {
    className: 'btn btn-primary',
    href: npmlink,
    title: npmlink,
  });

  return npm;
};

const addAtomLink = (data) => {
  if (!data || !data.name) {
    return undefined;
  }

  const dirlink = new Directory(atom.workspace.getActiveTextEditor().buffer.file.getParent().path+"/node_modules/"+data.name)
  const existDirlink = dirlink.existsSync()

  const icon = el('i');
  setAttr(icon, {
    className: 'icon icon-repo atom-icon',
  });

  const atom_el = el('a', icon);
  setAttr(atom_el, {
    className: 'btn' + (existDirlink ? '' : ' btn-disabled'),
    title: data.name,
  });

  if (existDirlink)
     atom_el.addEventListener('click', ()=>{
      atom.project.addPath(dirlink.getPath())
    });

  return atom_el;
};

// Checks if the tooltip should be opened up or down depending on the badge's position relative to
// the screen.
const shouldOpenOnBottom = pixelsToBottom => pixelsToBottom >= MIN_HEIGHT;

const addFooter = (data) => {
  const infoContainer = el(
    'div',
    el('small', addLatestVersion(data)),
    el('small', addReleaseDate(data)),
    el('small', addAuthor(data)),
  );
  setAttr(infoContainer, {
    className: data && data.homepage ? 'info' : 'info incomplete',
  });

  const footer = el('footer',
    infoContainer,
    addAtomLink(data),
    addWebsiteLink(data),
    addNpmLink(data),
  );

  return footer;
};

const addCloseButton = (data, badge) => {
  const icon = el('i');
  setAttr(icon, {
    className: 'close icon icon-x',
  });

  icon.addEventListener('click', () => {
    removeTooltip(badge, data);
  }, false);

  return icon;
};

export const addTooltip = ({
  dependency,
  inGutter,
  // emitter,
  atom,
}, element) => {
  removeTooltips(element);

  const { data, line } = dependency;

  const tooltip = el('div',
    addCloseButton(data, element),
    el('article',
      el('h3', data.name),
      el('p', data.description),
    ),
    addFooter(data),
  );

  const {
    pixelsToBottom,
    pixelsToTop,
    lineHeight,
    leftOffset,
  } = calculatePixelsFromLine(atom, line);

  const shouldRenderOnBottom = shouldOpenOnBottom(pixelsToBottom);
  const positionClass = shouldRenderOnBottom ? 'bottom' : 'top';
  const topOffset = shouldRenderOnBottom ? pixelsToTop + lineHeight : pixelsToTop;

  const x = inGutter ? 20 : leftOffset;
  const y = inGutter ? 0 : topOffset;

  const style = {
    transform: `translate3d(${x}px, ${y}px, 0)`,
  };

  // if (!inGutter) {
  //   tooltip.addEventListener('mouseenter', () => {
  //     emitter.emit('is-in-tooltip', true);
  //   }, false);
  //
  //   tooltip.addEventListener('mouseleave', () => {
  //     emitter.emit('is-in-tooltip', false);
  //   }, false);
  // }

  setAttr(tooltip, {
    className: `${TOOLTIP} ${data.name} ${positionClass}`,
    style,
  });

  mount(element, tooltip);
};
