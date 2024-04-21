const prismaClient = require("./../routes/prisma.js");
const postServices = require("./../services/posts.js");
const commentServices = require("./../services/comments.js");
const getUser = async (id) => {

    return prismaClient.user.findUnique({where: {id: id}});

};
const modifyUser = async (id, name, email, bio) => {
    return prismaClient.user.update({
        where: {id: id},
        data: {name, email, bio},
    });
}
const deleteUser = async (id) => {
    const userPosts = await prismaClient.post.findMany({
        where: { authorId: id },
        include: { tags: true, comments: true},
    });
    const userComments = await prismaClient.comment.findMany({
        where: { authorId: id }
    });
    // delete user posts and comments
    for (const comment of userComments) {
        await commentServices.deleteComment(comment.id);
    }
    for (const post of userPosts) {
       await postServices.deletePost(post);
    }

    return prismaClient.user.delete({where: {id: id}});
}
module.exports = {
    getUser,
    modifyUser,
    deleteUser,
}