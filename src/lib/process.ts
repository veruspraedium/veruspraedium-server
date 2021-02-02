import crypto from 'crypto';
import User from '../model/user';
import Post from '../model/post';
import { sendmail } from './email';
import dotenv from 'dotenv';
dotenv.config();

export const addUser = (async (id, password, nickname, address) =>{
  const cipher = crypto.createCipher('aes-256-cbc', process.env.aessecret);
  let result = cipher.update(id, 'utf8', 'base64');
  password = crypto.createHmac('sha512', process.env.secret).update(password).digest('hex');
  result += cipher.final('base64');
  let check = true;

  try{
  console.log("[system] - 유저추가 시작");
  await sendmail(id,'test',`http://localhost:5000/api/verification/${result}`);

  const user = new User({
    id: id,
    password: password,
    nickname: nickname,
    address: address,
  });
  await user.save();
  console.log("[system] - 유저추가 완료");
  }
  catch(err){
    console.log('[system] - 유효하지 않은 이메일');
    check = false;
  }

  return check;
});


export const findUser = (async (id) =>{
  console.log("[system] - 유저비번찾기 시작");
  
  let newPassword = await Math.random().toString(36).substr(2,11);
  const password = await crypto.createHmac('sha512', process.env.secret).update(newPassword).digest('hex');

  await User.update({id: id}, {password: password});
  await sendmail(id,'비밀번호 찾기',`id 님의 비밀번호는 ${newPassword} 입니다. 로그인 후 변경해주세요.`);
  return;
});


export const updateUserId = (async (id) =>{
  const cipher = crypto.createCipher('aes-256-cbc', process.env.aessecret);
  let result = cipher.update(id, 'utf8', 'base64');
  result += cipher.final('base64');
  let check = true;

    try{
    await sendmail(id,'test',`http://localhost:5000/api/verification/${result}`);
    }catch(err){
    console.log('[system] - 유효하지 않은 이메일');
    check = false;
    }
  
  return check;
});


export const addPost = (async (id, title ,category ,preview ,content, imagePath) =>{
  let check = true;

  try{
  console.log("[system] - 글 추가 시작");

  const post = new Post({
    userId: id,
    title: title,
    category: category,
    preview: preview,
    titleImage: imagePath,
    content: content
  });
  await post.save();
  console.log("[system] - 글 추가 완료");
  }
  catch(err){
    console.log('[system] - 중복글 존재 또는 옳지 않은 형식');
    check = false;
  }

  return check;
});
