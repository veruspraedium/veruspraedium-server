import Log from '../model/log';
import dotenv from 'dotenv';
dotenv.config();

export const log = (async (code, content) =>{

  try{
    const log = new Log({
      code: code,
      content: content
    });
    
    await log.save();
  }
  catch(err){ console.log('로그 에러'); }

  return;
});
