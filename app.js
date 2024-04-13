const express = require("express");
const nunjucks = require( 'nunjucks');
const path = require( 'path');
// import dotenv from "dotenv";
// import swaggerUi from "swagger-ui-express";
// import swaggerJsdoc from "swagger-jsdoc";
const routes = require( "./src/routes/index.js");


const port = process.env.PORT || 3000;

var app = express();

// Configurarea directorul pentru fisierele statice
app.use(express.static(path.join(__dirname, '/static')));
nunjucks.configure('static', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');

app.use(routes);

// app.use(errorHandler);
app.listen(port, () =>
    console.log(
        `Server adresa http://localhost:${port}`
    )
);
