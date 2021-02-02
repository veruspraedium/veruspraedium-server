import mongoose from 'mongoose';
import redis from 'async-redis';
import User from '../../model/user';
import { jwtverify } from '../../lib/token';
import dotenv from 'dotenv';
dotenv.config();

const client = redis.createClient();
const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};
mongoose.connect(process.env.uri, mongoConfig);


export const post = (async (ctx) => {
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;
  
  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1], isWriter: true}).limit(1).exec();

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
    }catch(err){ return 'error occured'; }
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
