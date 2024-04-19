const express = require("express");
const postsController = require("./../controllers/posts.js");
const router = express.Router();
const {authenticateJWT} = require("./../middlewares/jwtMiddleware.js");
const uploadMiddleware = require("./../middlewares/uploadMiddleware");
const upload = uploadMiddleware("upload");

//
// router.get('/', async (req, res) => {
//     try {
//         const {page = 1, sortOption, authorFilter} = req.query;
//         const perPage = 3
//         const offset = (page - 1) * perPage;
//         const totalCount = await prismaClient.post.count({
//             where: {
//                 author: authorFilter ? {
//                     name: {contains: authorFilter}
//                 } : undefined
//             }
//         });
//         const totalPages = Math.ceil(totalCount / perPage);
//         let posts = await prismaClient.post.findMany({
//             include: {author: true, tags: true},
//             orderBy: {
//                 createdAt: sortOption === 'createdAtAsc' ? 'asc' : 'desc'
//             },
//             where: {
//                 author: authorFilter ? {
//                     name: {contains: authorFilter}
//                 } : undefined
//             },
//             skip: offset,
//             take: perPage
//         });
//         // console.log(req.session.userId)
//         res.render('views/index.njk', {
//             posts: posts,
//             auth: isLogin(req),
//             currentPage: parseInt(page),
//             sortOption,
//             authorFilter,
//             totalPages,
//             userId: req.session.userId,
//             role: req.session.role
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({message: 'Error fetching posts!'});
//     }
// });
// Read
router.route('/').get( authenticateJWT, async (req, res) => {
    res.render('views/post.njk');
});
router.route('/').post( authenticateJWT, upload.single('imagePath'),postsController.createPost);


// Read a specific post by ID
router.route("/:id").get( authenticateJWT, upload.single('imagePath'),postsController.getPost);

// Update a post
router.route("/:id").put( authenticateJWT, upload.single('imagePath'), postsController.modifyPost);

// Delete a post
router.route("/:id").delete( authenticateJWT, postsController.deletePost);

module.exports = router;