import Router from '@koa/router';

const auth = new Router();

import {login} from './admin.controller';

auth.get('/', login);



export default auth;
