export const Events = {
  on(target, eventName, callback) {
    const events = target.events && target.events[eventName];
    if (events) {
      target.events[eventName].push(callback);
    }
  },

  off(target, eventName, callback) {
    const events = target.events && target.events[eventName];
    if (!events) return false;
    if (callback) {
      const idx = events.indexOf(callback);
      target.events[eventName].splice(idx, 1);
    } else {
      target.events[eventName] = [];
    }
    return true;
  },

  trigger(target, eventName) {
    const events = target.events && target.events[eventName];
    if (events) {
      const len = events.length;
      for (let i = 0; i < len; i++) {
        events[i](target);
      }
    }
  },
};
