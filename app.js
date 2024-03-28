
const express = require('express');
const session = require('express-session')
const nunjucks = require('nunjucks');
const prisma = require('@prisma/client');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const prismaClient = new prisma.PrismaClient();
const bodyParser = require('body-parser');
const connectFlash = require('connect-flash');


// Middleware pentru a parsa JSON si form-uri codificate in URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurarea directorul pentru fisierele statice
app.use(express.static(path.join(__dirname, '/static')));
nunjucks.configure('static', {
    autoescape: true,
    express: app
});


app.set('view engine', 'njk');
// Session management setup
app.use(
    session({
        secret: 'your_secret_key_here', // Replace with a strong secret key
        resave: false,
        saveUninitialized: true,
    })
);

// Flash message middleware
app.use(connectFlash());


// Hash password before saving user
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}


app.get('/signup', (req, res) => {
    res.render('signup.njk', { messages: res.locals.messages });
});
// User signup
app.post('/signup', async (req, res) => {
    console.log(req.body)
    const { email, password, name } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const user = await prismaClient.user.create({
            data: { email, password: hashedPassword, name },
        });
        res.locals.messages= 'User created successfully!';
        res.redirect('/login');
    } catch (error) {
        res.locals.messages='Error creating user!';
        res.redirect('/signup');
    }
});


app.get('/login',(req,res)=>{
    res.render('login.njk', { messages: res.locals.messages });
});

// User login (replace with JWT based authentication for production)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prismaClient.user.findUnique({ where: { email } });
        if (!user) {
            res.locals.messages= 'Invalid email or password!';
            return res.redirect('/login');

        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.locals.messages= 'Invalid email or password!';
            return   res.redirect('/login');

        }
        res.locals.messages='Login successful!';
        res.redirect('/');
    } catch (error) {
        res.locals.messages= 'Error logging in!';
        res.redirect('/login');
    }
});


// User CRUD operations

// Create user
app.post('/users', async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const user = await prismaClient.user.create({
            data: { email, password: hashedPassword, name, role },
        });
        res.json({ message: 'User created successfully!', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating user!' });
    }
});

// Read all users (implement access control for admins only)
app.get('/users', async (req, res) => {
    try {
        const users = await prismaClient.user.findMany();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching users!' });
    }
});

// Read a specific user by ID
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prismaClient.user.findUnique({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching user!' });
    }
});

// Update a user
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { email, name, role } = req.body;
    try {
        const user = await prismaClient.user.update({
            where: { id: parseInt(id) },
            data: { email, name, role },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.json({ message: 'User updated successfully!', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating user!' });
    }
});

// Delete a user (implement access control for admins only)
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prismaClient.user.delete({ where: { id: parseInt(id) } });
        if (!user) {
            return res.status(404).json({ message: 'User not found!' });
        }
        res.json({ message: 'User deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting user!' });
    }
});

// Post CRUD operations

// Read all posts
app.get('/posts', async (req, res) => {
    try {
        const posts = await prismaClient.post.findMany({
            include: { author: true },
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching posts!' });
    }
});

// Read a specific post by ID
app.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prismaClient.post.findUnique({
            where: { id: parseInt(id) },
            include: { author: true },
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found!' });
        }
        res.json(post);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching post!' });
    }
});

// Update a post
app.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content, type } = req.body;
    try {
        const post = await prismaClient.post.update({
            where: { id: parseInt(id) },
            data: { title, content, type },
        });
        if (!post) {
            return res.status(404).json({ message: 'Post not found!' });
        }
        res.json({ message: 'Post updated successfully!', post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating post!' });
    }
});

// Delete a post
app.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const post = await prismaClient.post.delete({ where: { id: parseInt(id) } });
        if (!post) {
            return res.status(404).json({ message: 'Post not found!' });
        }
        res.json({ message: 'Post deleted successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting post!' });
    }
});

// Comment CRUD operations

// Create a comment
app.post('/comments', async (req, res) => {
    const { content, authorId, postId } = req.body;
    try {
        const comment = await prismaClient.comment.create({
            data: { content, authorId, postId },
        });
        res.json({ message: 'Comment created successfully!', comment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating comment!' });
    }
});

// Read all comments
app.get('/comments', async (req, res) => {
    try {
        const comments = await prismaClient.comment.findMany({
            include: { author: true, post: true },
        });
        res.json(comments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching comments!' });
    }
});

// Read a specific comment by ID
app.get('/comments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const comment = await prismaClient.comment.findUnique({
            where: { id: parseInt(id) },
            include: { author: true, post: true },
        });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found!' });
        }
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching comment!' });
    }
});


app.listen(port, () => console.log(`Server listening on port ${port}`));