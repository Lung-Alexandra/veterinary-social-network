const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const prismaClient = require('./prisma.js');
const {verifyToken, generateToken} = require('./jwt.js');
const passport = require('./oauth');
const uploadMiddleware = require("./../middlewares/uploadMiddleware");
const {authenticateJWT} = require('./../middlewares/jwtMiddleware.js');
const {isLogin,isAdmin} = require('./../routes/util.js');
const postRouter = require("./../routes/posts.js");
const userRouter = require("./../routes/users.js");
const commentRouter = require("./../routes/comments.js");
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


// Hash password before saving user
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}




// Rute pentru autentificarea OAuth cu Google
app.get('/auth/google',
    passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect: '/login'}),
    function (req, res) {
        req.session.token = generateToken(req.user.id);
        req.session.userId = req.user.id;
        req.session.role = req.user.role;

        console.log("Successfully authenticated with Google Drive API!")
        res.redirect('/');
    });


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

app.get('/signup', (req, res) => {
    res.render('views/signup.njk', {messages: res.locals.messages});
});
// User signup
app.post('/signup', async (req, res) => {
    const {email, password, name} = req.body;

    try {
        const hashedPassword = await hashPassword(password);
        await prismaClient.user.create({
            data: {email, password: hashedPassword, name},
        });
        console.log('User created successfully!');
        res.redirect('/login');
    } catch (error) {
        console.log('Error creating user!');
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
            console.log('Invalid email or password!');
            return res.redirect('/login');

        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            console.log('Invalid email or password!');
            return res.redirect('/login');

        }
        console.log('Login successful!');
        req.session.userId = user.id;
        req.session.token = generateToken(user.id)
        req.session.role = user.role;
        res.redirect('/');
    } catch (error) {
        console.log(error + ' Error logging in!');
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    // sterge informatiile de autentificare stocate in sesiune
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({message: 'Error logging out'});
        }
        res.redirect('/login');
    });
});

app.get('/', async (req, res) => {
    try {
        const {page = 1, sortOption, authorFilter} = req.query;
        const perPage = 3
        const offset = (page - 1) * perPage;
        const totalCount = await prismaClient.post.count({
            where: {
                author: authorFilter ? {
                    name: {contains: authorFilter}
                } : undefined
            }
        });
        const totalPages = Math.ceil(totalCount / perPage);
        let posts = await prismaClient.post.findMany({
            include: {author: true, tags: true},
            orderBy: {
                createdAt: sortOption === 'createdAtAsc' ? 'asc' : 'desc'
            },
            where: {
                author: authorFilter ? {
                    name: {contains: authorFilter}
                } : undefined
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
            authorFilter,
            totalPages,
            userId: req.session.userId,
            role: req.session.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching posts!'});
    }
});
// User CRUD operations
app.use("/user",userRouter);
// Read all users (implement access control for admins only)
app.get('/users', authenticateJWT, isAdmin, async (req, res) => {
    try {
        const users = await prismaClient.user.findMany();
        res.render('views/users.njk', {users: users});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching users!'});
    }
});
app.get('/editprofile/:id', authenticateJWT, async (req, res) => {
    const {id} = req.params;
    if (req.session.userId === parseInt(id) || req.session.role === "ADMIN") {
        try {
            const user = await prismaClient.user.findUnique({where: {id: parseInt(id)}});
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }
            res.render('views/editProfile.njk', {user: user});
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error fetching user!'});
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
});

// Comment CRUD operations
app.use("/post",commentRouter)

// Post CRUD operations
app.use("/post",postRouter);



module.exports = app;