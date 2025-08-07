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
  set(key, item) {
    return localStorage.setItem(key, JSON.stringify(item))
  },
  remove(key) {
    return localStorage.removeItem(key)
  }
}