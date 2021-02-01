import Router from '@koa/router';
import multer from '@koa/multer';
import auth from './admin';

const api = new Router();
const storage = multer.diskStorage({
  destination: async (req, file, cb) => { cb(null, './files/') },
  filename: async (req, file, cb) => { cb(null,`${Date.now()}-${file.originalname}`) }
});
const upload = multer({ storage: storage });


import {signUp, loadProfile, changeProfile, userSecession, duplicateCheck, verification, login, logout, requestAccessToken, findPassword, loadImage} from './auth/auth.controller';
import {post} from './post/post.controller';

api.use('/admin', auth.routes());

api.post('/auth', signUp);
api.get('/auth', loadProfile);
api.put('/auth', upload.single('profileImage'), changeProfile);
api.delete('/auth', userSecession);
api.get('/duplicate', duplicateCheck);
api.get('/verification/:code', verification);
api.post('/login', login);
api.delete('/logout', logout);
api.get('/token', requestAccessToken);
api.post('/findpassword', findPassword);
api.get('/loadimage/:imagepath', loadImage);

api.post('/post', post);


export default api