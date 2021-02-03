import Koa from 'koa';
import Router from '@koa/router';
import cors from '@koa/cors';
import logger from 'koa-logger';
import koaBody from 'koa-body';
import helmet from 'koa-helmet';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

import api from './api';

const app = new Koa();
const router = new Router();

app.use(helmet())
.use(cors())
.use(logger())
.use(koaBody())
.use(router.routes()).use(router.allowedMethods());

router.use('/api', api.routes());

let serverCallback = app.callback();
let httpServer = http.createServer(serverCallback);

httpServer.listen(process.env.port || 6000, ()=>{console.log("success 5000")});

export const server = app;