import mongoose from 'mongoose';
import redis from 'async-redis';
import crypto from 'crypto';
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
  console.log("asdasdasdad");
  

  ctx.status = 200;
  ctx.body = 'body';
});
