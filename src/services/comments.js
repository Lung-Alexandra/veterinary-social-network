const prismaClient = require("../utils/prisma.js");
const getAllComments = async (postId)=> {
    return prismaClient.comment.findMany({
        where: {postId: postId},
        orderBy: {
            createdAt: 'desc'
        },
        include: {author: true},

    });
}
const getComment = async (commentId) => {

    return prismaClient.comment.findUnique({
        where: {
            id: commentId
        }
    });
};
const createComment = async (content, postId, userId) => {
    return prismaClient.comment.create({
        data: {
            content,
            postId: postId,
            authorId: userId
        }

    });
}
const updateComment = async (commentId, content) => {
    return prismaClient.comment.update({
        where: {
            id: commentId
        },
        data: {
            content
        }
    });
}
const deleteComment = async (commentId) => {
    return prismaClient.comment.delete({
        where: {
            id: commentId
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