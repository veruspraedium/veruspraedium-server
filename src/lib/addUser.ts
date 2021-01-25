import mongoose from 'mongoose';
import crypto from 'crypto';
import User from '../model/user';
import { sendmail } from './email';
import dotenv from 'dotenv';
dotenv.config();

const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};

export const add = (async (id, password, nickname, address) =>{
  const cipher = crypto.createCipher('aes-256-cbc', process.env.aessecret);
  let result : any = cipher.update(id, 'utf8', 'base64');
  result += cipher.final('base64');
  mongoose.connect(process.env.uri, mongoConfig);

  console.log("[system] - 유저추가 시작");
  
  const user = new User({
    id: id,
    password: password,
    nickname: nickname,
    address: address,
  });

  await user.save();

  await sendmail(id,'test',`http://localhost:5000/api/verification/${result}`);

  return;
});