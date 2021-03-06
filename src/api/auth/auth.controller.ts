import mongoose from 'mongoose';
import redis from 'async-redis';
import crypto from 'crypto';
import send from 'koa-send';
import User from '../../model/user';
import { addUser, findUser, updateUserId } from '../../lib/process';
import { errorCode } from '../../lib/errorcode';
import { jwtsign, jwtverify } from '../../lib/token';
import { log } from '../../lib/log';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient();
const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};
mongoose.connect(process.env.uri, mongoConfig);


export const signUp = (async (ctx) => { 
  const {id, nickname, address, password} = ctx.request.body;
  let body,status,rows,check;

  try{
    rows = await User.find({$or: [{id: id}, {nickname: nickname}]}).limit(1).exec();

    if(rows[0] == undefined){
      check =await addUser(id, password, nickname, address)
      if (check) {
        status = 202;
        body = {};
      }else{
        status = 412;
        body = await errorCode(105);
      }
    }else{
      status = 403;
      body = await errorCode(102);
    }
  }catch(err){ 
    status = 403;
    body = await errorCode(401);
  }

  ctx.status = status;
  ctx.body = body;
});

export const loadProfile = (async (ctx) => { 
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;
  
  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();

      if (rows[0] != undefined) {
        status = 200;
        body = {
          "nickname" : rows[0]['nickname'],
          "id" : rows[0]['id'],
          "address" : rows[0]['address'],
          "profileImage" : rows[0]['profileImage'],
          "introduce" : rows[0]['introduce']
        };
      }else{
        status = 403;
        body = await errorCode(108);
      }
    }catch(err){ 
      status = 403;
      body = await errorCode(401); 
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const changeProfile = (async (ctx) => {
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  const change = ctx.request.body.change.split(',');
  const options = ['nickname', 'id', 'password', 'address', 'profileImage', 'introduce'];
  let body, status, rows, mailStatus, ext, fileName;
  let sql = {};

  if (ctx.request.file != undefined){
    ext = ctx.request.file.originalname.split('.')[1];
    fileName = `${ctx.request.file.filename}`;
  }

  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();
      sql['_id'] = rows[0]['_id'];

      if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') { throw new Error("extention invalid"); }
      
      for (let i=0; i < 6; i++) {
        if (change[i] == 'true'){
          if (options[i] == 'id') {
            sql['cert'] = false;
            sql[options[i]] = ctx.request.body[options[i]];
            mailStatus = await updateUserId(ctx.request.body[options[i]]);
            if (mailStatus == false) { throw new Error("email invalid"); }
          }else if (options[i] == 'password'){ sql[options[i]] = await crypto.createHmac('sha512', process.env.secret).update(ctx.request.body[options[i]]).digest('hex');
          }else if (options[i] == 'profileImage'){ sql[options[i]] = fileName;
          }else{ sql[options[i]] = ctx.request.body[options[i]]; }
        }else{ sql[options[i]] = rows[0][options[i]]; }
      }
      await User.updateOne(sql);
      await log('L102',`유저 정보 변경-${accesstoken[1]}`);

      status = 201;
      body = {};
    }catch(err){ 
      status = 403;
      body = await errorCode(401);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }
  ctx.status = status;
  ctx.body = body;
});

export const userSecession = (async (ctx) => { 
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  const { refreshtoken } = ctx.request.header;
  const refreshtokenCheck = await jwtverify(refreshtoken);
  let body,status,rows, redisCheck = false;

  if(await client.get(accesstoken[1]) == refreshtoken){
    redisCheck = true;
  }
  
  if(accesstoken[0] && refreshtokenCheck[0] && redisCheck){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();

      if (rows[0] != undefined) {
        await User.deleteOne({id: accesstoken[1]});
        await log('L103',`유저 삭제-${accesstoken[1]}`);
        status = 201;
        body = {};
      }else{
        status = 403;
        body = await errorCode(108);
      }
    }catch(err){ 
      status = 403;
      body = await errorCode(401); 
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const duplicateCheck = (async (ctx) => { 
  const {id, nickname} = ctx.request.header;
  let body,status,rows,sql;

  if (id != undefined && nickname == undefined) { sql = {id: id}; }
  else if (id == undefined && nickname != undefined){ sql = {nickname: nickname}; }
  else{
    status = 412;
    body = await errorCode(401);
  }

  if (sql != undefined){
    try{
      rows = await User.find(sql).limit(1).exec();

      if (rows[0] == undefined) {
        body = {'isDuplicate': false};
      }else{
        body = {'isDuplicate': true};
      }
      status = 200;
    }catch(err){
      status = 403;
      body = await errorCode(401);
    }
  }
  

  ctx.status = status;
  ctx.body = body;
});

export const verification = (async (ctx) => { 
  const { code } = ctx.params;
  let body,status,rows;

  try{
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.aessecret);
    let result = decipher.update(code, 'base64', 'utf8');
    result += decipher.final('utf8');
      
    rows = await User.find({id:result}).limit(1).exec();

    if (rows[0] != undefined) {
      await User.update({id: result, cert: true});
      status = 201;
      body = {};
    }else{
      status = 412;
      body = await errorCode(108);
    }
  }catch(err){
    status = 403;
    body = await errorCode(402);
  }

  ctx.status = status;
  ctx.body = body;
});

export const login = (async (ctx) => { 
  const { id } = ctx.request.body;
  const password = crypto.createHmac('sha512', process.env.secret).update(ctx.request.body.password).digest('hex');
  let body,status,rows,refreshToken,accessToken;

  try{
    rows = await User.find({$and: [{id: id}, {password: password}]}).limit(1).exec();

    if (rows[0] != undefined) {
      accessToken = await jwtsign(rows[0]['id'], '30m');
      refreshToken = await jwtsign(rows[0]['_id'], '2w');
      await client.set(rows[0]['id'], refreshToken);

      status = 201;
      body = { 
        "accessToken" : accessToken,
        "refreshToken" : refreshToken
      };
    }else{
      status = 403;
      body = await errorCode(101);
    }
  }catch(err){
    status = 403;
    body = await errorCode(401);
  }

  ctx.status = status;
  ctx.body = body;
});

export const logout = (async (ctx) => { 
  let { accesstoken } = ctx.request.header;
  let body,status;
  accesstoken = await jwtverify(accesstoken);

  if (accesstoken[0]) {
    await client.del(accesstoken[1]);

    status = 201;
    body = {};
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const requestAccessToken = (async (ctx) => { 
  let { accesstoken, refreshtoken } = ctx.request.header;
  let refreshtokenCheck = await jwtverify(refreshtoken);
  let body,status;
  accesstoken = await jwtverify(accesstoken);

  if (refreshtokenCheck[0] && refreshtoken == await client.get(accesstoken[1])) {
    accesstoken = await jwtsign(accesstoken[1], '30m');
    status = 201;
    body = { "accessToken" : accesstoken };
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const findPassword = (async (ctx) => { 
  const { id } = ctx.request.body;
  let body,status,rows;

  try{
    rows = await User.find({id: id}).limit(1).exec();

    if (rows[0] != undefined) {
      await findUser(id);

      status = 202;
      body = {};
    }else{
      status = 403;
      body = await errorCode(108);
    }
  }catch(err){
    status = 403;
    body = await errorCode(401); 
  }
  ctx.status = status;
  ctx.body = body;
});

export const loadImage = (async (ctx) => { 
  const { imagepath } = ctx.params;
  
  try {
   await send(ctx, imagepath, { root:  './files/' });
  }catch(err){
    ctx.status = 403;
    ctx.body = await errorCode(501);
  }
});