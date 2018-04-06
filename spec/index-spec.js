'use babel';

import { expectxml } from 'jasmine-snapshot';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import {
  saveEditor,
  openTestFile,
  activatePackage,
  findDecorations,
  mockPackageResponse,
  mockDependencies,
  findBadgeByName,
  elementToString,
} from './helpers';

const invalidJson = `{
  "name": "foobar",
  "it": "has an invalid json",
  "dependencies": {
    "invalid": "bar",
  }
}
`;

const validJson = `{
  "name": "foobar",
  "it": "has an invalid json",
  "dependencies": {
    "invalid": "bar"
  }
}
`;

describe('NpmLibraryDescription', () => {
  let mockFetch;

  beforeEach(() => {
    waitsForPromise(() => activatePackage(atom));
    mockFetch = new MockAdapter(axios);
  });

  afterEach(() => {
    mockFetch.restore();
  });

  it('should activate package', () => {
    expect(atom.packages.isPackageActive('npm-library-description')).toBeTruthy();
  });

  it('should render the information badges for dependencies', () => {
    mockDependencies(mockFetch);
    waitsForPromise(() => openTestFile(atom).then(() => {
      const editor = atom.workspace.getActiveTextEditor();

      waits(0);
      runs(() => {
        // There should be a decoration per dependency
        const decorations = findDecorations(editor);
        // There's a failing dependency, so it only renders 7
        expect(decorations.length).toBe(7);
      });
    }));
  });

  it('should render NPM information when clicking a badge', () => {
    const snapshot = `{
      "div": {
        "_class": "npm-library-tooltip axios top",
        "_style": "transform: translate3d(20px, 0px, 0px);",
        "article": {
          "h3": "axios",
          "p": "foo"
        },
        "footer": {
          "a": [
            {
              "_class": "btn",
              "_href": "http://foo.bar",
              "_title": "http://foo.bar",
              "i": {
                "_class": "icon icon-globe"
              }
            },
            {
              "_class": "btn btn-primary",
              "_href": "https://npmjs.com/package/axios",
              "_title": "https://npmjs.com/package/axios",
              "i": {
                "_class": "icon icon-repo"
              }
            }
          ],
          "div": {
            "_class": "info",
            "small": [
              {
                "p": {
                  "span": "0.0.5",
                  "strong": "Latest version:"
                }
              },
              {
                "p": {
                  "span": "May 1st, 2017",
                  "strong": "Release date:"
                }
              },
              {
                "p": {
                  "span": "Michael Fassbender",
                  "strong": "Author:"
                }
              }
            ]
          }
        },
        "i": {
          "_class": "close icon icon-x"
        }
      }
    }`;

    mockDependencies(mockFetch);
    waitsForPromise(() => openTestFile(atom).then(() => {
      const editor = atom.workspace.getActiveTextEditor();

      waits(0);
      runs(() => {
        const badge = findBadgeByName(editor, 'axios');
        badge.click();

        // NOTE: In the tests, the tooltip is rendered inside the badge. In the real life use,
        // it is rendered as a sibling.
        const tooltip = badge.firstChild;

        expectxml(elementToString(tooltip)).toMatchSnapshot(snapshot);
      });
    }));
  });

  it('should render NPM incomplete information (only name and description)', () => {
    const snapshot = `{
      "div": {
        "_class": "npm-library-tooltip webpack top",
        "_style": "transform: translate3d(20px, 0px, 0px);",
        "article": {
          "h3": "webpack",
          "p": "foo"
        },
        "footer": {
          "a": {
            "_class": "btn btn-primary",
            "_href": "https://npmjs.com/package/webpack",
            "_title": "https://npmjs.com/package/webpack",
            "i": {
              "_class": "icon icon-repo"
            }
          },
          "div": {
            "_class": "info incomplete",
            "small": [
              {
                "p": "No latest version"
              },
              "",
              ""
            ]
          }
        },
        "i": {
          "_class": "close icon icon-x"
        }
      }
    }`;

    mockDependencies(mockFetch);
    waitsForPromise(() => openTestFile(atom).then(() => {
      const editor = atom.workspace.getActiveTextEditor();

      waits(0);
      runs(() => {
        const badge = findBadgeByName(editor, 'webpack');
        badge.click();

        // NOTE: In the tests, the tooltip is rendered inside the badge. In the real life use,
        // it is rendered as a sibling.
        const tooltip = badge.firstChild;
        expectxml(elementToString(tooltip)).toMatchSnapshot(snapshot);
      });
    }));
  });

  it('should warn user that file is not correctly parsed', () => {
    waitsForPromise(() => openTestFile(atom, 'invalid/package.json').then(() => {
      const notifications = atom.notifications.getNotifications();
      expect(notifications).toHaveLength(1);

      expect(notifications[0].message)
        .toBe('npm-library-description: There was a problem reading package.json');

      expect(notifications[0].type).toBe('warning');
    }));
  });

  it('should warn when updating file', () => {
    waitsForPromise(() => openTestFile(atom, 'valid/package.json').then(() => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(invalidJson);

      waitsForPromise(() => saveEditor(editor).then(() => {
        // Just move this to the end of the function stack.
        waits(0);
        runs(() => {
          const notifications = atom.notifications.getNotifications();
          expect(notifications).toHaveLength(1);

          expect(notifications[0].message)
            .toBe('npm-library-description: There was a problem reading package.json');

          expect(notifications[0].type).toBe('warning');

          // Put the file as it was
          editor.setText(`{
  "name": "some-test",
  "scripts": {
    "foo": "bar",
    "start": "./index.js",
    "test": "jest"
  },
  "keywords": [
    "foo",
    "bar",
    "test"
  ],
  "dependencies": {
    "axios": "0.0.5",
    "redom": "0.0.5",
    "react": "0.0.5"
  },
  "devDependencies": {
    "babel": "0.0.5",
    "webpack": "0.0.5",
    "lint": "0.0.5",
    "jest": "0.0.5",
    "enzyme": "0.0.5"
  }
}
`);
          saveEditor(editor);
        });
      }));
    }));
  });

  it('should render on file save', () => {
    mockPackageResponse(mockFetch, {
      name: 'invalid',
      description: 'foo',
    });

    waitsForPromise(() => openTestFile(atom, 'invalid/package.json').then(() => {
      const editor = atom.workspace.getActiveTextEditor();
      editor.setText(validJson);
      waitsForPromise(() => saveEditor(editor).then(() => {
        // Just move this to the end of the function stack.
        waits(0);
        runs(() => {
          const decorations = findDecorations(editor);
          expect(decorations.length).toBe(1);
          // Put the file as it was
          editor.setText(invalidJson);
          saveEditor(editor);
        });
      }));
    }));
  });
});
