/**
 * Takes an Array and a grouping function
 * and returns a Map of the array grouped by the grouping function.
 */
export const groupBy = (list, keyGetter) => {
  const map = new Map();
  list.forEach(item => {
    const key = keyGetter(item);
    const collection = map.get(key);
    if (!collection) {
      map.set(key, [item]);
    } else {
      collection.push(item);
    }
  });
  return map;
}
  
/**
 * Sort function with single sort parameter.
 */
export const dynamicSort = (property) => {
  let sortOrder = 1;
  if (property[0] === '-') {
    sortOrder = -1;
    property = property.substr(1);
  }
  return (a, b) => {
    const result = a[property] < b[property]
      ? -1
      : a[property] > b[property]
        ? 1
        : 0;
    return result * sortOrder;
  };
}

/**
 * Sort function with multiple sort parameters.
 */
export const dynamicSortMultiple = () => {
  const props = arguments;
  return (obj1, obj2) => {
    let i = 0,
      result = 0,
      numberOfProperties = props.length;
    while (result === 0 && i < numberOfProperties) {
      result = dynamicSort(props[i])(obj1, obj2);
      i++;
    }
    return result;
  };
}