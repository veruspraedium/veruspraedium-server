import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const jwtsign = (async (id, time) => {
  const token = jwt.sign({id: id}, process.env.jwtsecret, {expiresIn: time});
  return token;
});

export const jwtverify = (async (token) => {
  let check;
  jwt.verify(token, process.env.jwtsecret, (error, decoded) => {
    console.log(decoded);
    
    if(error){ check = ''; }
    else{ check = decoded['id']; }
  });
  return check;
});