/* eslint-disable no-undef */
import supertest from 'supertest';
import {addUser} from '../src/lib/process';
import {server} from '../src/index';
jest.setTimeout(30000);

let accessToken, refreshToken, id, password, nickname, address;

console.log("9--------------------------------------------------------------------------------------");
console.log(process.env.uri);


beforeAll(async () => {
  id = `${await Math.random().toString(36).substr(2,11)}@liamg.moc`;
  password = await Math.random().toString(36).substr(2,11);
  nickname = `testclient-jest-${await Math.random().toString(36).substr(2,11)}`;
  address = 'localhost';

  await addUser(id, password, nickname, address);
});

test('duplicate Check id', async (done) => {
  const response = await supertest(server.callback())
  .get('/api/duplicate')
  .set('Accept', 'application/json')
  .set({'id': id});

  await expect(response.status).toBe(200);
  done();
});

test('duplicate Check nickname', async (done) => {
  const response = await supertest(server.callback())
  .get('/api/duplicate')
  .set('Accept', 'application/json')
  .set({'nickname': nickname});

  await expect(response.status).toBe(200);
  done();
});

test('login', async (done) => {
  const response = await supertest(server.callback())
  .post('/api/login')
  .send({id: id, password: password});

  accessToken = response.body['accessToken'];
  refreshToken = response.body['refreshToken'];

  await expect(response.status).toBe(201);
  done();
});

test('load Profile', async (done) => {
  const response = await supertest(server.callback())
  .get('/api/auth')
  .set('Accept', 'application/json')
  .set({ 'accessToken': accessToken});

  await expect(response.status).toBe(200);
  done();
});

test('request AccessToken', async (done) => {
  const response = await supertest(server.callback())
  .get('/api/token')
  .set('Accept', 'application/json')
  .set({'accessToken': accessToken, 'refreshToken': refreshToken});

  accessToken = response.body['accessToken'];

  await expect(response.status).toBe(201);
  done();
});

test('user Secession', async (done) => {
  const response = await supertest(server.callback())
  .delete('/api/auth')
  .set('Accept', 'application/json')
  .set({'accessToken': accessToken, 'refreshToken': refreshToken});

  await expect(response.status).toBe(201);
  done();
});