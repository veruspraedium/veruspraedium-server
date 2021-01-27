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

export const addUser = (async (id, password, nickname, address) =>{
  const cipher = crypto.createCipher('aes-256-cbc', process.env.aessecret);
  let result = cipher.update(id, 'utf8', 'base64');
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


export const findUser = (async (id) =>{
  console.log("[system] - 유저비번찾기 시작");
  
  let newPassword = await Math.random().toString(36).substr(2,11);
  const password = await crypto.createHmac('sha512', process.env.secret).update(newPassword).digest('hex');

  await User.update({id: id}, {password: password});
  await sendmail(id,'비밀번호 찾기',`id 님의 비밀번호는 ${newPassword} 입니다. 로그인 후 변경해주세요.`);
  return;
});