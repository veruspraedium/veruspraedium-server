import MongoClient from 'mongodb';
MongoClient.MongoClient;
const url = process.env.url;
const db;

MongoClient.connect(url, function (err, database) {
   if (err) {
      console.error('MongoDB 연결 실패', err);
      return;
   }

   db = database;
});

export const login = (async (ctx,next) => {
  console.log("asdasdasdad");
  

  ctx.status = 200;
  ctx.body = 'body';
});
