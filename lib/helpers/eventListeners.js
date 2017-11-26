'use babel';

import debounce from 'lodash/debounce';
import first from 'lodash/first';

import {
  NPM_LIBRARY_DESCRIPTION,
} from '../constants/elements';

import {
  getView,
} from './atom';

import {
  addTooltip,
} from '../components/tooltip';

import {
  selectDependenctByLine,
} from '../store/selectors/fetchedDependencies';

export const onMouseMove = ({ view, atom, store }) => (event) => {
  const regexp = new RegExp(`${NPM_LIBRARY_DESCRIPTION}`, 'g');
  const element = event.target;

  // Not a valid element
  if (!regexp.test(element.className)) {
    return;
  }

  const position = view.component.screenPositionForMouseEvent(event);
  const line = first(position.toArray());
  const dependency = selectDependenctByLine(store.getState(), line);

  addTooltip({
    dependency,
    atom,
    leftOffset: view.component.getGutterContainerWidth(),
  }, view);
};

export const addMouseEventListener = (params, { textEditor, eventListenerManager }) => {
  const {
    atom,
    preferences,
    store,
  } = params;

  const view = getView(atom, textEditor);
  const {
    showTooltipWithMouseEvent,
    showDelay,
  } = preferences;

  if (!showTooltipWithMouseEvent || !view) {
    return;
  }

  // No need ro register it again.
  const currentEventListener = eventListenerManager.get(textEditor);
  if (currentEventListener) {
    return;
  }

  const eventListener = debounce(
    onMouseMove({ view, atom, store }),
    showDelay,
  );

  eventListenerManager.add(textEditor, {
    element: view,
    eventListener,
  });

  view.addEventListener('mousemove', eventListener);
};
