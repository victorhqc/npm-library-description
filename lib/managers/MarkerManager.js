'use babel';

class MarkerManager {
  constructor(emitter) {
    this.emitter = emitter;
  }

  onDidLoadDependency(key, callback) {
    return this.emitter.on('did-load-dependency', ({
      dependency,
      textEditorKey,
    }) => {
      if (key === textEditorKey) {
        callback(dependency);
      }
    });
  }
}

export default MarkerManager;
