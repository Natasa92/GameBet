export const createRoute = (route, params) => {
  let result = route;
  const keys = Object.keys(params);

  keys.forEach((key, index) => {
    if (index === 0 ) {
      result = `${result}?${key}=${params[key]}`;
    } else {
      result = `${result}&${key}=${params[key]}`;
    }
  });

  return result;
};

export const getParams = (searchString) => {
  const result = {};
  
  if (searchString) {
    const strings = searchString
      .substr(1)
      .split('&');
    strings.forEach(str => {
      const param = str.split('=');
      result[param[0]] = param[1];
    });
  }

  return result;
}