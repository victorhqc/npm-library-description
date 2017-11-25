'use babel';

class MarkerManager {
  constructor(emitter) {
    this.emitter = emitter;
  }

  onDidLoadDependency(callback) {
    return this.emitter.on('did-load-dependency', callback);
  }
}

export default MarkerManager;
