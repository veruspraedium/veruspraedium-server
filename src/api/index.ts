import Router from '@koa/router';
import auth from './admin';

const api = new Router();

import {signUp, loadProfile, changeProfile, userSecession, duplicateCheck, verification, login, logout} from './auth/auth.controller';
//import {} from './post/post.controller';


api.use('/admin', auth.routes());

api.post('/auth', signUp);
api.get('/auth', loadProfile);
api.patch('/auth', changeProfile);
api.delete('/auth', userSecession);
api.get('/duplicate', duplicateCheck);
api.get('/verification/:code', verification);
api.post('/login', login);
api.delete('/logout', logout);



export default api