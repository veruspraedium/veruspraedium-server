import Router from '@koa/router';

const api = new Router();

import auth from './auth';

api.use('/auth', auth.routes());


export default api