import mongoose from 'mongoose';
import User from '../../model/user';
import Post from '../../model/post';
import Comment from '../../model/comment';
import { jwtverify } from '../../lib/token';
import { addPost, addComment } from '../../lib/process';
import dotenv from 'dotenv';
dotenv.config();

const mongoConfig = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true
};
mongoose.connect(process.env.uri, mongoConfig);


export const post = (async (ctx) => {
  const { title ,category ,preview ,content } = ctx.request.body;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows,ext,fileName;

  if (ctx.request.file != undefined){
    ext = ctx.request.file.originalname.split('.')[1];
    fileName = `${ctx.request.file.filename}`;
  }
  
  if(accesstoken[0]){
    try{
      if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') { fileName = 'default image'; }

      rows = await User.find({id: accesstoken[1], isWriter: true}).limit(1).exec();
      
      if (rows[0] != undefined && title != undefined && category != undefined && preview != undefined && content != undefined) {
        await addPost(accesstoken[1], title ,category ,preview ,content, fileName);

        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_form",
          "errorCode" : "E401",
          "errorDescription" : "잘못된 형식의 요청 또는 중복된 데이터 존재"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const loadPost = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows,rows1;

  if(accesstoken[0]){
    try{
      rows = await Post.find({_id: postid}).limit(1).exec();
      
      if (rows[0] != undefined) {
        rows1 = await User.find({id: rows[0]['userId']}).limit(1).exec();

        status = 200;
        body = {
          "title" : rows[0]['title'],
          "titleImage" : rows[0]['titleImage'], 
          "category" : rows[0]['category'],
          "content" : rows[0]['content'],
          "like" : rows[0]['like'].length,
          "isLike" : rows[0]['like'].includes(accesstoken[1]),
          "date" : rows[0]['publishedDate'],
          "id" : rows[0]['userId'],
          "nickname" : rows1[0]['nickname'],
          "profileImage" : rows1[0]['profileImage'],
          "introduce" : rows1[0]['introduce']
        };
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_post",
          "errorCode" : "E601",
          "errorDescription" : "존재하지 않는 글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const changePost = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  const change = ctx.request.body.change.split(',');
  const options = ['title','category','preview','titleImage','content'];
  let body, status, rows, ext, fileName;
  let sql = {};

  if (ctx.request.file != undefined){
    ext = ctx.request.file.originalname.split('.')[1];
    fileName = `${ctx.request.file.filename}`;
  }

  if(accesstoken[0]){
    try{
      rows = await Post.find({_id: postid}).limit(1).exec();
      sql['_id'] = rows[0]['_id'];
      if(rows[0] != undefined){
        if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') { throw new Error("extention invalid"); }
        
        for (let i=0; i < 5; i++) {
          if (change[i] == 'true'){
            if (options[i] == 'titleImage'){ sql[options[i]] = fileName;
            }else{ sql[options[i]] = ctx.request.body[options[i]]; }
          }else{ sql[options[i]] = rows[0][options[i]]; }
        }
        await Post.update(sql);

        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_post",
          "errorCode" : "E601",
          "errorDescription" : "존재하지 않는 글"
        }; 
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_from",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      }; 
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

export const deletePost = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;

  if(accesstoken[0]){
    try{
      rows = await Post.find({_id: postid}).limit(1).exec();
      
      if (rows[0] != undefined && rows[0]['userId'] == accesstoken[1]) {
        await Post.deleteOne({_id: rows[0]['_id']});
        status = 201;
        body = {};
      }else{
        status = 401;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E109",
          "errorDescription" : "권한 없음"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const subscribe = (async (ctx) => {
  const { writername } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows,rows1;

  if(accesstoken[0]){
    try{
      rows = await User.find({id: writername, isWriter: true}).limit(1).exec();
      rows1 = await User.find({id: accesstoken[1], subscribe: writername}).limit(1).exec();
      
      if (rows[0] != undefined && rows1[0] == undefined && accesstoken[1] != writername) {
        await User.update({ id: accesstoken[1] },{ $push: { subscribe: writername }});
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 계정 또는 이미 구독한 계정"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const loadSubscribeList = (async (ctx) => {
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;

  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();
      
      if (rows[0] != undefined) {
        status = 200;
        body = {"writer" : rows[0]['subscribe']};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 계정"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const unSubscribe = (async (ctx) => {
  const { writername } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;

  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1], subscribe: writername}).limit(1).exec();
      
      if (rows[0] != undefined) {
        await User.update({ id: accesstoken[1] },{ $pull: { subscribe: writername }});
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 계정 또는 구독 취소한 계정"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const like = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;

  if(accesstoken[0]){
    try{
      rows = await Post.find({_id: postid}).limit(1).exec();
      
      if (rows[0] != undefined && rows[0]['like'].includes(accesstoken[1]) == false) {
        await Post.update({ _id: postid },{ $push: { like: accesstoken[1] }});
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 글 또는 이미 좋아요한 글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const unLike = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;

  if(accesstoken[0]){
    try{
      rows = await Post.find({_id: postid, like: accesstoken[1]}).limit(1).exec();
      
      if (rows[0] != undefined) {
        await Post.update({ _id: postid },{ $pull: { like: accesstoken[1] }});
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 글 또는 좋아요하지 않은 글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const comment = (async (ctx) => {
  const { content } = ctx.request.body;
  const { postid } = ctx.request.header;
  const { commentid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,postRows,commentRows, groupId, commentClass, commentOrder,check;


  if(accesstoken[0]){
    try{
      postRows = await Post.findOne({_id: postid}).exec();
      if (postRows != null) {
        
        if (commentid != undefined) { 
          commentRows = await Comment.findOne({groupId: commentid}).sort({ date: -1 }).exec(); 
          if (commentRows != null) {
            groupId = commentRows['groupId'];
            commentClass = commentRows['class'];
            commentOrder = commentRows['order']+1;
          }else{
            commentRows = await Comment.findOne({_id: commentid}).exec(); 
            groupId = commentid;
            commentClass = commentRows['class']+1;
            commentOrder = 1;
          }
          
        }else{
          commentRows = await Comment.findOne({postId: postid, class: 1}).sort({ date: -1 }).exec(); 
          groupId = 'root';
          commentClass = 1;
          if (commentRows != null) { commentOrder = commentRows['order']+1; }
          else{ commentOrder = 1; }
        }
      
        check = await addComment(postid, groupId, content, accesstoken[1], commentClass, commentOrder);
        if (check == false) { throw new Error("형식 에러"); }

        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const loadComment = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows,commentRows;


  if(accesstoken[0]){
    try{
      rows = await Post.findOne({_id: postid}).exec();
      if (rows != null) {
        commentRows = await Comment.find({postId: postid}).sort({ class: 1 }).exec();
        status = 201;
        body = {comments: commentRows};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청"
      };
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

export const updateComment = (async (ctx) => {
  const { content } = ctx.request.body;
  const { commentid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;


  if(accesstoken[0]){
    try{
      rows = await Comment.findOne({_id: commentid}).exec();
      if (rows != null && rows['userId'] == accesstoken[1]) { 
        await Comment.update({_id: commentid, content: content}).exec();
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 댓글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청 또는 권한 없음"
      };
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

export const deleteComment = (async (ctx) => {
  const { commentid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;


  if(accesstoken[0]){
    try{
      rows = await Comment.findOne({_id: commentid}).exec();
      if (rows != null && rows['userId'] == accesstoken[1]) { 
        await Comment.deleteOne({_id: commentid}).exec();
        status = 201;
        body = {};
      }else{
        status = 403;
        body = {
          "errorMessage" : "invalid_account",
          "errorCode" : "E108",
          "errorDescription" : "존재하지 않는 댓글"
        };
      }
    }catch(err){ 
      status = 403;
      body = {
        "errorMessage" : "invalid_form",
        "errorCode" : "E401",
        "errorDescription" : "잘못된 형식의 요청 또는 권한 없음"
      };
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