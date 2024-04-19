const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./../routes/cloudinaryConfig");
const path = require('path');


function uploadMiddleware(folderName) {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: (req, file) => {
            const folderPath = `${folderName.trim()}`; // Update the folder path here
            const fileExtension = path.extname(file.originalname).substring(1);
            const publicId = `${file.fieldname}-${Date.now()}`;

            return {
                folder: folderPath,
                public_id: publicId,
                format: fileExtension,
            };
        },
    });

    return multer({
        storage: storage,
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return cb(new Error('Please upload a valid image file'))
            }
            cb(undefined, true)
        }
    });
}

module.exports = uploadMiddleware;