const express = require("express");
const nunjucks = require( 'nunjucks');
const path = require( 'path');
const routes = require( "./src/routes/index.js");


const port = process.env.PORT || 3000;

let app = express();

// Configurarea directorul pentru fisierele statice
app.use(express.static(path.join(__dirname, '/static')));
nunjucks.configure('static', {
    autoescape: true,
    express: app
});

app.set('view engine', 'njk');

app.use(routes);

app.listen(port, () =>
    console.log(
        `Server adresa http://localhost:${port}`
    )
);

// module.exports = { app };
