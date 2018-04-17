'use babel';

import compose from 'lodash/fp/compose';
import debounce from 'lodash/debounce';
import first from 'lodash/first';

import { NPM_LIBRARY_DESCRIPTION } from '../constants/elements';

import {
  getView,
  getEditorKey,
  getActiveTextEditor,
} from './atom';

import { addTooltip, removeTooltips } from '../components/tooltip';

import { selectDependencyByLine } from '../store/selectors/dependencies';

export const onMouseMove = ({ view, atom, store }) => (event) => {
  const regexp = new RegExp(`${NPM_LIBRARY_DESCRIPTION}`, 'g');
  const element = event.target;

  // Not a valid element
  if (!regexp.test(element.className)) {
    return;
  }

  const position = view.component.screenPositionForMouseEvent(event);
  const line = first(position.toArray());
  const textEditorKey = compose(
    getEditorKey,
    getActiveTextEditor,
  )(atom);

  const dependency = selectDependencyByLine(store.getState(), {
    line,
    textEditorKey,
  });

  addTooltip({
    dependency,
    atom,
    leftOffset: view.component.getGutterContainerWidth(),
  }, view);
};

export const onMouseClick = ({ view }) => () => {
  removeTooltips(view);
};

const addMouseClickEventListenerIfNeeded = ({
  preferences,
  textEditor,
  view,
  eventListenerManager,
}) => {
  const {
    hideTooltipOnOutsideClick,
  } = preferences;

  const currentEventListener = eventListenerManager.get(textEditor, 'click');
  if (
    currentEventListener
    || !view
    || !hideTooltipOnOutsideClick
  ) {
    return;
  }

  const eventListener = onMouseClick({ view });

  eventListenerManager.add(textEditor, 'click', {
    element: view,
    eventListener,
  });

  view.addEventListener('click', eventListener);
};

const addMouseOverEventListenerIfNeeded = ({
  preferences,
  view,
  store,
  textEditor,
  eventListenerManager,
}) => {
  const {
    showTooltipWithMouseEvent,
    showDelay,
  } = preferences;

  // No need ro register it again.
  const currentEventListener = eventListenerManager.get(textEditor, 'mousemove');
  if (
    currentEventListener
    || !view
    || !showTooltipWithMouseEvent
  ) {
    return;
  }

  const eventListener = debounce(
    onMouseMove({ view, atom, store }),
    showDelay,
  );

  eventListenerManager.add(textEditor, 'mousemove', {
    element: view,
    eventListener,
  });

  view.addEventListener('mousemove', eventListener);
};

export const addMouseEventListener = (params, { textEditor, eventListenerManager }) => {
  const {
    atom,
    preferences,
    store,
  } = params;

  const view = getView(atom, textEditor);

  addMouseClickEventListenerIfNeeded({
    preferences,
    view,
    textEditor,
    eventListenerManager,
  });

  addMouseOverEventListenerIfNeeded({
    preferences,
    view,
    store,
    textEditor,
    eventListenerManager,
  });
};
