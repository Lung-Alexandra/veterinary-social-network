const prismaClient = require("./../routes/prisma.js");
const getAllComments = async (postId)=> {
    return prismaClient.comment.findMany({
        where: {postId: parseInt(postId)},
        orderBy: {
            createdAt: 'desc'
        },
        include: {author: true},

    });
}
const getComment = async (commentId) => {

    return prismaClient.comment.findUnique({
        where: {
            id: parseInt(commentId)
        }
    });
};
const createComment = async (content, postId, userId) => {
    return prismaClient.comment.create({
        data: {
            content,
            postId: parseInt(postId),
            authorId: userId
        }

    });
}
const updateComment = async (commentId, content) => {
    return prismaClient.comment.update({
        where: {
            id: parseInt(commentId)
        },
        data: {
            content
        }
    });
}
const deleteComment = async (commentId) => {
    return prismaClient.comment.delete({
        where: {
            id: parseInt(commentId)
        }
    });
}
module.exports = {
    getAllComments,
    getComment,
    createComment,
    updateComment,
    deleteComment
}