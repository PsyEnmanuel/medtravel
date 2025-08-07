export default {
  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key))
    } catch (error) {
      if(key === 'prescription') {
        return false;
      }
      if(key === 'history') {
        return false;
      }
      if(key === 'cosmiatry') {
        return false;
      }
      return localStorage.getItem(key)
    }
  },
  set(key, action) {
    let stored = localStorage.getItem(key);
    let data = {};

    try {
      data = stored ? JSON.parse(stored) : {};
      if (typeof data !== 'object' || data === null) {
        data = {};
      }
    } catch (e) {
      console.error(`Failed to parse localStorage "${key}"`, e);
      data = {};
    }

    action(data);

    localStorage.setItem(key, JSON.stringify(data));
  },
  remove(key) {
    return localStorage.removeItem(key)
  }
}