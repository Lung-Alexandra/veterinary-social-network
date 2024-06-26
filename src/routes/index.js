const express = require('express');
const { code } = require("http-status-codes");
const { req, res } = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require("method-override");
const prismaClient = require('../utils/prisma.js');
const passport = require('../utils/oauth');
//functions
const {generateToken} = require('./../utils/jwt.js');
const {isLogin,hashPassword, comparePassword} = require('../utils/util.js');
// routes
const postRouter = require("./../routes/posts.js");
const userRouter = require("./../routes/users.js");
const commentRouter = require("./../routes/comments.js");
// middleware
const {extractPostId} = require("./../middlewares/extractParamsMiddleware");
const {authenticateJWT} = require('./../middlewares/jwtMiddleware.js');
const {isAdmin} = require('./../middlewares/adminMiddleware.js');
const {logger} = require('./../utils/logger.js');

const app = express.Router();


// Middleware pentru a parsa JSON si form-uri codificate in URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Configurare express-session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Middleware pentru autentificarea cu Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        // console.log(method)
        delete req.body._method
        return method
    }
    if(req.session._method){
        let method = req.session._method
        // console.log(method)
        delete req.session._method
        return method
    }
}))

// Rute pentru autentificarea OAuth cu Google
app.get('/auth/google',
    passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function (req, res) {
        req.session.token = generateToken(req.user.id);
        req.session.userId = req.user.id;
        req.session.role = req.user.role;

        logger.info(`Successfully authenticated with Google Drive API! ${req.user.id},${req.user.email} `);
        res.redirect('/');
    });


app.get('/signup', (req, res) => {
    res.render('views/signup.njk', {messages: res.locals.messages});
});
// User signup
app.post('/signup', async (req, res) => {
    const {email, password, name} = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        let user = await prismaClient.user.create({
            data: {email, password: hashedPassword, name},
        });
        logger.info(`User created successfully!${user.id},${user.email}`);
        res.redirect('/login');
    } catch (error) {
        logger.info('Error creating user!');
        res.redirect('/signup');
    }

});


app.get('/login', (req, res) => {
    res.render('views/login.njk', {messages: res.locals.messages});
});

// User login (replace with JWT based authentication for production)
app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    try {
        const user = await prismaClient.user.findUnique({where: {email}});
        if (!user) {
            logger.info('Invalid email!');
            return res.redirect('/login');

        }
        const passwordMatch =  await comparePassword(password,user.password);
        if (!passwordMatch) {
            logger.info('Invalid password!');
            return res.redirect('/login');

        }
        logger.info(`Login successful! ${user.id}`);
        req.session.userId = user.id;
        req.session.token = generateToken(user.id)
        req.session.role = user.role;
        res.redirect('/');
    } catch (error) {
        logger.error(error + ' Error logging in!');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    // sterge informatiile de autentificare stocate in sesiune
    req.logout(function(err){
        req.session.destroy((err) => {
            if (err) {
                logger.info('Error destroying session:', err);
                return res.status(500).json({message: 'Error logging out'});
            }
            logger.info('Session destroyed successfully!');
            logger.info('Logout user!');
            res.redirect('/login');
        });
    });
});

app.get('/', async (req, res) => {
    try {
        const {page = 1, sortOption, tagFilter} = req.query;
        const perPage = 3
        const offset = (page - 1) * perPage;
        const totalCount = await prismaClient.post.count({
            where: {
                tags: tagFilter ? { some: { name: { contains: tagFilter } } } : undefined
                // author: authorFilter ? {
                //     name: {contains: authorFilter}
                // } : undefined
            }
        });
        const totalPages = Math.ceil(totalCount / perPage);
        let posts = await prismaClient.post.findMany({
            include: {author: true, tags: true},
            orderBy: {
                createdAt: sortOption === 'createdAtAsc' ? 'asc' : 'desc'
            },
            where: {
                tags: tagFilter ? { some: { name: { contains: tagFilter } } } : undefined
                // author: authorFilter ? {
                //     name: {contains: authorFilter}
                // } : undefined
            },
            skip: offset,
            take: perPage
        });
        // console.log(req.session.userId)
        res.render('views/index.njk', {
            posts: posts,
            auth: isLogin(req),
            currentPage: parseInt(page),
            sortOption,
            tagFilter,
            totalPages,
            userId: req.session.userId,
            role: req.session.role
        });
    } catch (error) {
        logger.info(error);
        res.status(500).json({message: 'Error fetching posts!'});
    }
});

// User CRUD operations
app.use("/user",userRouter);

// Read all users (implement access control for admins only)
app.get('/users', authenticateJWT, isAdmin, async (req, res) => {
    try {
        const users = await prismaClient.user.findMany();
        logger.info("Displayed users!");
        res.render('views/users.njk', {users: users});
    } catch (error) {
        logger.info(error);
        res.status(500).json({message: 'Error fetching users!'});
    }
});


// Comment CRUD operations
app.use("/post/:postId",extractPostId,commentRouter)

// Post CRUD operations
app.use("/post",postRouter);



module.exports = app;