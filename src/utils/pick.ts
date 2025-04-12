/**
 * Create an object composed of the picked object properties
 * @param {Object} object - The source object to pick properties from
 * @param {string[]} keys - Array of keys to pick from the object
 * @returns {Object} A new object containing only the picked properties
 */
export function pick<T extends Record<string, any>, K extends keyof T>(
  object: T,
  keys: K[]
): Pick<T, K> {
  if (!object) {
    return {} as Pick<T, K>;
  }
  
  return keys.reduce((acc, key) => {
    if (object && Object.prototype.hasOwnProperty.call(object, key)) {
      acc[key] = object[key];
    }
    return acc;
  }, {} as Pick<T, K>);
}