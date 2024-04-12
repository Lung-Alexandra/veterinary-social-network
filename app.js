const express = require("express");
const nunjucks = require( 'nunjucks');
const path = require( 'path');
// import dotenv from "dotenv";
// import swaggerUi from "swagger-ui-express";
// import swaggerJsdoc from "swagger-jsdoc";
const routes = require( "./src/routes/index.js");


const port = process.env.PORT || 3000;
// import errorHandler from "./src/middlewares/error-handler.js";

// dotenv.config();

//
// app.use(express.json());
//
// const options = {
//     definition: {
//         openapi: "3.0.0",
//         info: {
//             title: "Todos",
//             version: "1.0.0",
//         },
//     },
//     apis: ["./src/routes/**.js", "./swagger/schemas.yaml"], // files containing annotations as above
// };
//
// const openapiSpecification = swaggerJsdoc(options);
//
// if (process.env.NODE_ENV !== "production") {
//     app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));
// }

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
