'use babel';

import axios from 'axios';

const fetch = config => axios({
  ...config,
  url: `https://registry.npmjs.org/${config.url}`,
  responseType: 'json',
});

export default fetch;
