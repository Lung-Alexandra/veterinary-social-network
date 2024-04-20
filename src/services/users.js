const prismaClient = require("./../routes/prisma.js");
const postServices = require("./../services/posts.js");
const commentServices = require("./../services/comments.js");
const getUser = async (id) => {

    return prismaClient.user.findUnique({where: {id: parseInt(id)}});

};
const modifyUser = async (id, name, email, bio) => {
    return prismaClient.user.update({
        where: {id: parseInt(id)},
        data: {name, email, bio},
    });
}
const deleteUser = async (id) => {
    const userPosts = await prismaClient.post.findMany({
        where: { authorId: parseInt(id) }
    });
    const userComments = await prismaClient.comment.findMany({
        where: { authorId: parseInt(id) }
    });
    // delete user posts and comments
    for (const comment of userComments) {
        await commentServices.deleteComment(comment.id);
    }
    for (const post of userPosts) {
       await postServices.deletePost(post.id);
    }

    return prismaClient.user.delete({where: {id: parseInt(id)}});
}
module.exports = {
    getUser,
    modifyUser,
    deleteUser,
}