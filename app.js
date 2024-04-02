const express = require('express');
const nunjucks = require('nunjucks');
const prismaClient = require('./prisma');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const bodyParser = require('body-parser');
const {verifyToken, generateToken} = require('./jwt');
const {validate} = require("google-auth-library/build/src/options");
const session = require('express-session');
const methodOverride = require('method-override');

// Middleware pentru a parsa JSON si form-uri codificate in URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Configurare express-session
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));

// Configurarea directorul pentru fisierele statice
app.use(express.static(path.join(__dirname, '/static')));
nunjucks.configure('static', {
    autoescape: true,
    express: app
});


app.set('view engine', 'njk');


// Hash password before saving user
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

function isLogin(req) {
    return req.session.token !== undefined;
}

// Middleware
function authenticateJWT(req, res, next) {
    const token = req.session.token;

    if (!token) {
        return res.status(401).json({message: 'Unauthorized: Missing JWT token'});
    }
    try {
        const decoded = verifyToken(token); // Verificarea token-ului utilizând funcția verifyToken
        req.session.userId = decoded.userId; // Salvarea ID-ului utilizatorului din token în obiectul req
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized: Invalid JWT token'});
    }
}
app.use(methodOverride(function (req, res) {
    if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        let method = req.body._method
        // console.log(method)
        delete req.body._method
        return method
    }
}))

app.get('/signup', (req, res) => {
    res.render('signup.njk', {messages: res.locals.messages});
});
// User signup
app.post('/signup', async (req, res) => {
    const {email, password, name} = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const user = await prismaClient.user.create({
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
    res.render('login.njk', {messages: res.locals.messages});
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
        const posts = await prismaClient.post.findMany({
            include: {author: true},
        });
        // console.log(req.session.userId)
        res.render('index.njk', {posts: posts, auth: isLogin(req), postAuth: req.session.userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching posts!'});
    }
});
// User CRUD operations

// Read all users (implement access control for admins only)
app.get('/users', async (req, res) => {
    try {
        const users = await prismaClient.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching users!'});
    }
});

// Read a specific user by ID
app.get('/users/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const user = await prismaClient.user.findUnique({where: {id: parseInt(id)}});
        if (!user) {
            return res.status(404).json({message: 'User not found!'});
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching user!'});
    }
});

// Update a user
app.put('/users/:id', async (req, res) => {
    const {id} = req.params;
    const {email, name, role} = req.body;
    try {
        const user = await prismaClient.user.update({
            where: {id: parseInt(id)},
            data: {email, name, role},
        });
        if (!user) {
            return res.status(404).json({message: 'User not found!'});
        }
        res.json({message: 'User updated successfully!', user});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error updating user!'});
    }
});

// Delete a user (implement access control for admins only)
app.delete('/users/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const user = await prismaClient.user.delete({where: {id: parseInt(id)}});
        if (!user) {
            return res.status(404).json({message: 'User not found!'});
        }
        res.json({message: 'User deleted successfully!'});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error deleting user!'});
    }
});

// Post CRUD operations

// Read
app.get('/post', authenticateJWT, async (req, res) => {
    res.render('post.njk');
});
app.post('/post', authenticateJWT, async (req, res) => {
    try {
        // console.log(req.session.userId)
        const {title, content, type} = req.body;
        await prismaClient.post.create({
            data: {
                title,
                content,
                authorId: req.session.userId,
                type
            }
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: 'Error creating post!' });
        res.redirect('/post')
    }
});


// Read a specific post by ID
app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    try {
        const post = await prismaClient.post.findUnique({
            where: {id: parseInt(id)},
            include: {author: true},
        });
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        res.render("post.njk",{post:post, method:"put" })
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post!'});
    }
});

// Update a post
app.put('/post/:id',authenticateJWT, async (req, res) => {
    const {id} = req.params;
    const {title, content, type} = req.body;
    try {
        const post = await prismaClient.post.update({
            where: {id: parseInt(id)},
            data: {title, content, type},
        });
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        console.log('Post updated successfully!');
        res.redirect('/')

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error updating post!'});
    }
});

// Delete a post
app.delete('/post/:id',authenticateJWT, async (req, res) => {
    const {id} = req.params;
    try {
        const post = await prismaClient.post.delete({where: {id: parseInt(id)}});
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        res.redirect("/")
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error deleting post!'});
    }
});

// Comment CRUD operations

app.get('/post/:postId/comment', authenticateJWT, async (req, res) => {
    const {postId} = req.params;
    try {
        res.render('addcomm.njk', {postId:postId});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post for comment form!'});
    }
});
// Create a comment for a specific post
app.post('/post/:postId/comment', authenticateJWT, async (req, res) => {
    const {postId} = req.params;
    const {content} = req.body;
    try {
        const comment = await prismaClient.comment.create({
            data: {
                content,
                postId: parseInt(postId),
                authorId: req.session.userId
            }

        });
        res.redirect(`/post/${postId}/comments`)
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error creating comment!'});
    }
});

// Read all comments for a specific post
app.get('/post/:postId/comments', async (req, res) => {
    const {postId} = req.params;
    try {
        const comments = await prismaClient.comment.findMany({
            where: {postId: parseInt(postId)},
        });
        res.render('comments.njk',{comments:comments});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching comments!'});
    }
});




app.listen(port, () => console.log(`Server listening on port ${port}`));