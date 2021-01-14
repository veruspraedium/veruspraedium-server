import Router from '@koa/router';

const auth = new Router();

import {login} from './auth.controller';

auth.get('/', login);



export default auth;
