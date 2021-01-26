import mongoose from 'mongoose';
import redis from 'async-redis';
import crypto from 'crypto';
import User from '../../model/user';
import { add } from '../../lib/addUser';
import { jwtsign, jwtverify } from '../../lib/token';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient();
const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};
mongoose.connect(process.env.uri, mongoConfig);


export const signUp = (async (ctx,next) => { // 0
  const {id, nickname, address} = ctx.request.body;
  const password = crypto.createHmac('sha512', process.env.secret).update(ctx.request.body.password).digest('hex');
  let body,status,rows;

  try{
    rows = await User.find({$or: [{id: id}, {nickname: nickname}]}).limit(1).exec();

    if (rows[0] == undefined) {
      add(id, password, nickname, address)
      .then(async () =>{ console.log("[system] - 유저추가 완료"); });
      status = 202;
      body = {};
    }else{
      status = 403;
      body = {
        "errorMessage" : "invalid_account",
        "errorCode" : "E102",
        "errorDescription" : "이미 존재하는 계정"
      };
    }
  }catch(err){
    return 'error occured';
  }


  ctx.status = status;
  ctx.body = body;
});

export const loadProfile = (async (ctx,next) => { // 0
  let { accesstoken } = ctx.request.header;
  accesstoken = await jwtverify(accesstoken);
  let body,status,rows;

  
  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken}).limit(1).exec();

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
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 계정"
        };
      }
    }catch(err){
      return 'error occured';
    }
  }else{
    status = 412;
    body = {
      "errorMessage" : "invalid_grant",
      "errorCode" : "E302",
      "errorDescription" : "잘못되거나 만료된 access_token"
    };
  }

  ctx.status = status;
  ctx.body = body;
});

export const changeProfile = (async (ctx,next) => {
  const { accesstoken } = ctx.request.header;
  const { nickname, id, password, address, profileImage, introduce } = ctx.request.body;
  let body,status,rows;

  ctx.status = status;
  ctx.body = body;
});

export const userSecession = (async (ctx,next) => { // 0
  let { accesstoken, refreshtoken } = ctx.request.header;
  let body,status,rows, redisCheck = false;
  let refreshtokenCheck = await jwtverify(refreshtoken);
  accesstoken = await jwtverify(accesstoken);

  if(await client.get(accesstoken[1]) == refreshtoken){
    redisCheck = true;
  }
  
  if(accesstoken[0] && refreshtokenCheck[0] && redisCheck){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();

      if (rows[0] != undefined) {
        await User.deleteOne({id: accesstoken[1]});
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 계정"
        };
      }
    }catch(err){
      return 'error occured';
    }
  }else{
    status = 412;
    body = {
      "errorMessage" : "invalid_grant",
      "errorCode" : "E302",
      "errorDescription" : "잘못되거나 만료된 token"
    };
  }

  ctx.status = status;
  ctx.body = body;
});

export const duplicateCheck = (async (ctx,next) => { // 0
  const {id, nickname} = ctx.request.header;
  let body,status,rows,sql;

  if (id != undefined && nickname == undefined) { sql = {id: id}; }
  else if (id == undefined && nickname != undefined){ sql = {nickname: nickname}; }
  else{
    status = 412;
    body = {
      "errorMessage" : "invalid_from",
      "errorCode" : "E401",
      "errorDescription" : "잘못된 형식의 요청"
    };
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
      console.log(err);
    }
  }
  

  ctx.status = status;
  ctx.body = body;
});

export const verification = (async (ctx,next) => { // 0
  const { code } = ctx.params;
  let body,status,rows,sql;

  try{
    const decipher = crypto.createDecipher('aes-256-cbc', process.env.aessecret);
    let result : any = decipher.update(code, 'base64', 'utf8');
    result += decipher.final('utf8');
      
    rows = await User.find({id:result}).limit(1).exec();

    if (rows[0] != undefined) {
      await User.update({id: result}, {cert: true});
      status = 201;
      body = {};
    }else{
      status = 412;
      body = {
        "errorMessage" : "invalid_account",
        "errorCode" : "E108",
        "errorDescription" : "존재하지 않는 계정"
      };
    }
  }catch(err){
    status = 403;
    body = {
      "errorMessage" : "invalid_from",
      "errorCode" : "E402",
      "errorDescription" : "잘못되거나 만료된 요청"
    };
  }

  ctx.status = status;
  ctx.body = body;
});

export const login = (async (ctx,next) => { // 0
  const { id } = ctx.request.body;
  const password = crypto.createHmac('sha512', process.env.secret).update(ctx.request.body.password).digest('hex');
  let body,status,rows,sql,refreshToken,accessToken;

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
      body = {
        "errorMessage" : "invalid_account",
        "errorCode" : "E101",
        "errorDescription" : "id 및 password가 일치하지 않음"
      };
    }
  }catch(err){
    console.log(err);
  }

  ctx.status = status;
  ctx.body = body;
});

export const logout = (async (ctx,next) => { // 0
  let { accesstoken } = ctx.request.header;
  let body,status,rows, redisCheck = false;
  accesstoken = await jwtverify(accesstoken);

  if (accesstoken[0]) {
    await client.del(accesstoken[1]);

    status = 201;
    body = {};
  }else{
    status = 412;
    body = {
      "errorMessage" : "invalid_grant",
      "errorCode" : "E302",
      "errorDescription" : "잘못되거나 만료된 access_token"
    };
  }

  ctx.status = status;
  ctx.body = body;
});