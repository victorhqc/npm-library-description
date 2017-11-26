'use babel';

import filter from 'lodash/filter';
import map from 'lodash/map';
import find from 'lodash/find';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../lib/constants/elements';

const mockFetch = new MockAdapter(axios);

export const saveEditor = editor => editor.save();

export const openTestFile = (atom, name = 'valid/package.json') =>
  atom.workspace.open(`${__dirname}/${name}`);

export const mockPackageResponse = (packageDetails) => {
  mockFetch.onGet(`https://registry.npmjs.org/${packageDetails.name}`).replyOnce(200, packageDetails);
};

export const mockPackageFailedResponse = (packageName) => {
  mockFetch.onGet(`https://registry.npmjs.org/${packageName}`).replyOnce(404, {});
};

export const activatePackage = atom => atom.packages.activatePackage(NPM_LIBRARY_DESCRIPTION);

export const findDecorations = (editor) => {
  const decorations = editor.getDecorations({
    type: 'gutter',
  });

  return filter(
    decorations,
    decoration => decoration.properties.class.match(new RegExp(NPM_LIBRARY_DESCRIPTION)) !== null,
  );
};

export const findBadges = editor => map(findDecorations(editor), decoration =>
  decoration.getProperties().item,
);

export const findBadgeByName = (editor, name) => {
  const badges = findBadges(editor);

  return find(badges, badge => badge.title === name);
};

export const elementToString = (element) => {
  const tmp = document.createElement('div');
  tmp.appendChild(element);

  return tmp.innerHTML;
};

export const mockDependencies = () => {
  mockPackageResponse({
    name: 'axios',
    description: 'foo',
    author: {
      name: 'Michael Fassbender',
      email: 'michael@fassbender',
    },
    time: {
      '0.0.1': '2017-01-01',
      '0.0.2': '2017-02-01',
      '0.0.3': '2017-03-01',
      '0.0.4': '2017-04-01',
      '0.0.5': '2017-05-01',
    },
    'dist-tags': {
      latest: '0.0.5',
    },
    homepage: 'http://foo.bar',
  });
  mockPackageResponse({
    name: 'redom',
    description: 'foo',
    author: {
      name: 'Benedict Cumberbatch',
      email: 'benedict@cumberbatch',
    },
    time: {
      '0.0.1': '2017-01-01',
      '0.0.2': '2017-02-01',
      '0.0.3': '2017-03-01',
      '0.0.4': '2017-04-01',
      '0.0.5': '2017-05-01',
    },
    'dist-tags': {
      latest: '0.0.5',
    },
    homepage: 'http://foo.bar',
  });
  mockPackageResponse({
    name: 'react',
    description: 'foo',
    time: {
      '0.0.1': '2017-01-01',
      '0.0.2': '2017-02-01',
      '0.0.3': '2017-03-01',
      '0.0.4': '2017-04-01',
      '0.0.5': '2017-05-01',
    },
    'dist-tags': {
      latest: '0.0.5',
    },
  });
  mockPackageResponse({
    name: 'babel',
    description: 'foo',
    homepage: 'http://foo.bar',
  });
  mockPackageResponse({
    name: 'webpack',
    description: 'foo',
  });
  mockPackageResponse({
    name: 'babel',
    description: 'foo',
  });
  mockPackageResponse({
    name: 'lint',
    description: 'foo',
  });
  mockPackageResponse({
    name: 'jest',
    description: 'foo',
    time: {
      '0.0.1': '2017-01-01',
      '0.0.2': '2017-02-01',
      '0.0.3': '2017-03-01',
      '0.0.4': '2017-04-01',
      '0.0.5': '2017-05-01',
    },
    'dist-tags': {
      latest: '0.0.5',
    },
    homepage: 'http://foo.bar',
  });
  mockPackageFailedResponse('enzyme');
};
