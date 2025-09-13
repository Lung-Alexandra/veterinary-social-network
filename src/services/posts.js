const prismaClient = require("../utils/prisma.js");
const commentServices = require("./../services/comments.js");
const createPost = async (postInfo) => {

    const {title, content, tags, type, imagePath, userId} = postInfo;

    let imgPath = type === "TEXTIMAGE" ? imagePath : null;

    const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "" && tag !== undefined);
    // console.log(tagNames);
    const tagRecords = await Promise.all(tagNames.map(async tagName => {
        return prismaClient.tag.upsert({
            where: {name: tagName},
            update: {},
            create: {name: tagName}
        });
    }));

    return prismaClient.post.create({
        data: {
            title,
            content,
            authorId: userId,
            tags: {connect: tagRecords.map(tag => ({id: tag.id}))},
            type,
            imagePath: imgPath
        },
        include: {tags: true}
    });


};
const getPost = async (id) => {
    return prismaClient.post.findUnique({
        where: {id: id},
        include: {author: true, tags: true, comments: true},
    });
}
const modifyPost = async (old_post, postInfo) => {
    const { title, content, tags, type, imagePath, id } = postInfo;

    let imgPath = type === "TEXTIMAGE" ? (imagePath ? imagePath : old_post.imagePath) : null;

    const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag !== "" && tag !== undefined);

    const tagRecords = await Promise.all(tagNames.map(async tagName => {
        return prismaClient.tag.upsert({
            where: { name: tagName },
            update: {},
            create: { name: tagName }
        });
    }));


    // Find tag IDs that need to be disconnected
    const tagsToRemove = old_post.tags.filter(tag => !tagNames.includes(tag.name));

    // Disconnect tags from the post
    await Promise.all(tagsToRemove.map(async tagToRemove => {
        return prismaClient.post.update({
            where: { id: id },
            data: {
                tags: { disconnect: { id: tagToRemove.id } }
            }
        });
    }));

    return prismaClient.post.update({
        where: { id: id },
        data: {
            title,
            content,
            tags: { connect: tagRecords.map(tag => ({ id: tag.id })) },
            type,
            imagePath: imgPath
        },
        include: { tags: true }
    });
}

const deletePost =async (post)=>{
    if (post.comments) {
        await Promise.all(post.comments.map(async (comment) => {
            await commentServices.deleteComment(comment.id);
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

    return prismaClient.post.delete({where: {id: post.id}});

}
module.exports = {
    createPost,
    getPost,
    modifyPost,
    deletePost
}