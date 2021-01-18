import Router from '@koa/router';
import auth from './admin';

const api = new Router();

import {login} from './auth/auth.controller';
//import {} from './post/post.controller';


api.use('/admin', auth.routes());

api.get('/', login);



export default api