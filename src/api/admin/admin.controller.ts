import mongoose from 'mongoose';
import redis from 'async-redis';
import crypto from 'crypto';
import User from '../../model/user';
import { findUser, updateUserId } from '../../lib/process';
import { errorCode } from '../../lib/errorcode';
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


