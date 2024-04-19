// const request = require('supertest');
// const express = require('express');
// const router = require('./../routes/index.js');
// const nunjucks = require("nunjucks");
// const prismaClient = require('./../routes/prisma'); // Assuming this is your Prisma client module
//
// const app = express();
// app.use(router);
// nunjucks.configure('static', {
//     autoescape: true,
//     express: app
// });
//
// app.set('view engine', 'njk');
// describe('GET /', () => {
//     test('It should respond with status code 200', async () => {
//         const response = await request(app).get('/');
//         expect(response.statusCode).toBe(200);
//     });
// });
//
//
// describe('POST /signup', () => {
//     test('It should create a new user and redirect to login page', async () => {
//         const response = await request(app)
//             .post('/signup')
//             .send({ email: 'test@example.com', password: 'password', name: 'Test User' });
//         expect(response.statusCode).toBe(302); // Expecting a redirect status code
//         expect(response.header.location).toBe('/login'); // Expecting redirect to login page
//     });
// });
//
// describe('POST /login', () => {
//     test('It should log in the user and redirect to homepage', async () => {
//         const response = await request(app)
//             .post('/login')
//             .send({ email: 'test@example.com', password: 'password' });
//         expect(response.statusCode).toBe(302); // Expecting a redirect status code
//         expect(response.header.location).toBe('/'); // Expecting redirect to homepage
//     });
// });
//
// describe('GET /logout', () => {
//     test('It should log out the user and redirect to login page', async () => {
//         const response = await request(app).get('/logout');
//         expect(response.statusCode).toBe(302); // Expecting a redirect status code
//         expect(response.header.location).toBe('/login'); // Expecting redirect to login page
//     });
// });