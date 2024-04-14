const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');
const methodOverride = require('method-override');
const prismaClient = require('./prisma.js');
const {verifyToken, generateToken} = require('./jwt.js');
const passport = require('./oauth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'static/uploads/');
    },
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload a valid image file'))
        }
        cb(undefined, true)
    }
});

const upload = multer({storage: storage});


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
        const decoded = verifyToken(token); // Verificarea token-ul
        req.session.userId = decoded.userId;
        next();
    } catch (error) {
        return res.status(401).json({message: 'Unauthorized: Invalid JWT token'});
    }
}

async function isAdmin(req, res, next) {

    if (req.session.role === "ADMIN") {
        next();
    } else {
        return res.status(401).json({message: 'Unauthorized: Not an admin'});
    }

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

// Read a specific user by ID
app.get('/user/:id', authenticateJWT, async (req, res) => {
    const {id} = req.params;
    if (req.session.userId === parseInt(id)) {
        try {
            const user = await prismaClient.user.findUnique({where: {id: parseInt(id)}});
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }

            res.render('views/user.njk', {user: user});

        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error fetching user!'});
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
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
// Update a user
app.put('/user/:id', authenticateJWT, async (req, res) => {
    const {id} = req.params;
    const {name, email, bio} = req.body;
    if (req.session.userId === parseInt(id) || req.session.role === "ADMIN") {
        try {
            const user = await prismaClient.user.update({
                where: {id: parseInt(id)},
                data: {name, email, bio},
            });
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }
            // res.json({message: 'User updated successfully!', user});
            res.redirect(`/user/${id}`)
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error updating user!'});
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
});

// Delete a user (implement access control for admins only)
app.delete('/user/:id', authenticateJWT, async (req, res) => {
    const {id} = req.params;
    if (req.session.userId === parseInt(id) || req.session.role === "ADMIN") {
        try {
            const user = await prismaClient.user.delete({where: {id: parseInt(id)}});
            if (!user) {
                return res.status(404).json({message: 'User not found!'});
            }
            console.log('User deleted successfully!');
            res.redirect('/users');
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Error deleting user!'});
        }
    } else {
        return res.status(403).json({message: 'Unauthorized access'});
    }
});

// Post CRUD operations

// Read
app.get('/post', authenticateJWT, async (req, res) => {
    res.render('views/post.njk');
});
app.post('/post', authenticateJWT, upload.single('imagePath'), async (req, res) => {
    try {

        const {title, content, tags, type} = req.body;

        let imagePath = null;
        if (type === "TEXTIMAGE") {
            if (req.file) {
                imagePath =  (req.file.path.replace(/^static/, '')).replace(/\\/g, '/');
            }
        }

        const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "" && tag !== undefined);
        // console.log(tagNames);
        const tagRecords = await Promise.all(tagNames.map(async tagName => {
            return prismaClient.tag.upsert({
                where: {name: tagName},
                update: {},
                create: {name: tagName}
            });
        }));

        await prismaClient.post.create({
            data: {
                title,
                content,
                authorId: req.session.userId,
                tags: {connect: tagRecords.map(tag => ({id: tag.id}))},
                type,
                imagePath: imagePath
            },
            include: {tags: true}
        });
        res.redirect('/');
    } catch (error) {
        console.error(error);
        // res.status(500).json({ message: 'Error creating post!' });
        res.redirect('/post')
    }
});


// Read a specific post by ID
app.get('/post/:id', authenticateJWT, upload.single('imagePath'), async (req, res) => {
    const {id} = req.params;

    try {
        const post = await prismaClient.post.findUnique({
            where: {id: parseInt(id)},
            include: {author: true, tags: true},
        });
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }
        req.session._method = "put";
        res.render('views/post.njk', {post: post,method:"put"})
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post!'});
    }

});

// Update a post
app.put('/post/:id', authenticateJWT, upload.single('imagePath'), async (req, res) => {
    const {id} = req.params;
    const {title, content, tags, type} = req.body;

    try {
        const post = await prismaClient.post.findUnique({where: {id: parseInt(id)}});
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }
        let imagePath = null;
        if (type === "TEXTIMAGE") {
            if (req.file) {
                imagePath = (req.file.path.replace(/^static/, '')).replace(/\\/g, '/');
            }
        }

        const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "" && tag !== undefined);
        // console.log(tags)
        const tagRecords = await Promise.all(tagNames.map(async tagName => {
            return prismaClient.tag.upsert({
                where: {name: tagName},
                update: {},
                create: {name: tagName}
            });
        }));
        await prismaClient.post.update({
            where: {id: parseInt(id)},
            data: {
                title,
                content,
                tags: {connect: tagRecords.map(tag => ({id: tag.id}))},
                type,
                imagePath: imagePath
            },
            include: {tags: true}
        });

        console.log('Post updated successfully!');
        res.redirect('/')

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error updating post!'});
    }

});

// Delete a post
app.delete('/post/:id', authenticateJWT, async (req, res) => {
    const {id} = req.params;
    try {
        const post = await prismaClient.post.findUnique({where: {id: parseInt(id)}, include:{comments:true, tags:true}});
        if (!post) {
            return res.status(404).json({message: 'Post not found!'});
        }
        if (post.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this post'});
        }

        if (post.comments) {
            await Promise.all(post.comments.map(async (comment) => {
                await prismaClient.comment.delete({where: {id: comment.id}});
            }));
        }
        // Remove the associations with tags
        if (post.tags) {
            await Promise.all(post.tags.map(async (tag) => {
                await prismaClient.tag.update({
                    where: {id: tag.id},
                    data: {posts: {disconnect: {id: post.id}}}
                });
            }));
        }

        await prismaClient.post.delete({where: {id: parseInt(id)}});


        res.redirect("/")
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error deleting post!'});
    }

})

// Comment CRUD operations

app.get('/post/:postId/comment', authenticateJWT, async (req, res) => {
    const {postId} = req.params;
    try {
        res.render('views/addcomm.njk', {postId: postId});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post for comment form!'});
    }
});
// Read a specific comment by ID
app.get('/post/:postId/comment/:commentId', authenticateJWT, async (req, res) => {
    const {postId, commentId} = req.params;

    try {
        const comment = await prismaClient.comment.findUnique({
            where: {
                id: parseInt(commentId)
            }
        });
        if (!comment) {
            return res.status(404).json({message: 'Comment not found'});
        }
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this comment'});
        }
        res.render('views/addcomm.njk', {postId: postId, comment: comment, method: "put"})

    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching post!'});
    }

})

// Create a comment for a specific post
app.post('/post/:postId/comment', authenticateJWT, async (req, res) => {
    const {postId} = req.params;
    const {content} = req.body;
    try {
        await prismaClient.comment.create({
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

// Update a comment
app.put('/post/:postId/comment/:commentId', authenticateJWT, async (req, res) => {
    const {postId, commentId} = req.params;
    const {content} = req.body;

    try {
        let comment = await prismaClient.comment.findUnique({
            where: {
                id: parseInt(commentId)
            }
        });
        if (!comment) {
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to update the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to update this comment'});
        }

        // Update the comment
        await prismaClient.comment.update({
            where: {
                id: parseInt(commentId)
            },
            data: {
                content
            }
        });

        res.redirect(`/post/${postId}/comments`);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error updating comment'});
    }
});


app.delete('/post/:postId/comment/:commentId', authenticateJWT, async (req, res) => {
    const {postId, commentId} = req.params;
    try {
        const comment = await prismaClient.comment.findUnique({
            where: {
                id: parseInt(commentId)
            }
        });
        if (!comment) {
            return res.status(404).json({message: 'Comment not found'});
        }

        // Check if the user is authorized to delete the comment
        if (comment.authorId !== req.session.userId && req.session.role !== "ADMIN") {
            return res.status(403).json({message: 'Unauthorized to delete this comment'});
        }

        // Delete the comment
        await prismaClient.comment.delete({
            where: {
                id: parseInt(commentId)
            }
        });

        res.redirect(`/post/${postId}/comments`);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error deleting comment'});
    }

});

// Read all comments for a specific post
app.get('/post/:postId/comments', async (req, res) => {
    const {postId} = req.params;
    try {
        const comments = await prismaClient.comment.findMany({
            where: {postId: parseInt(postId)},
            orderBy: {
                createdAt: 'desc'
            },
            include: {author: true},

        });
        res.render('views/comments.njk', {
            comments: comments,
            auth: isLogin(req),
            userId: req.session.userId,
            role: req.session.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: 'Error fetching comments!'});
    }
});


module.exports = app;