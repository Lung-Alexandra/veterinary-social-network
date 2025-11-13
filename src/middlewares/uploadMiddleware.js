const multer = require("multer");
const streamifier = require("streamifier");
const path = require("path");
const cloudinary = require("../utils/cloudinaryConfig");

function uploadToCloudinary(folderName = "default-folder", fieldName = "file") {
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter(req, file, cb) {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/i)) {
                return cb(new Error("Please upload a valid image file"));
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB limit
        }
    });

    return [
        upload.single(fieldName),
        (req, res, next) => {
            if (!req.file) return next();

            const fileExt = path.extname(req.file.originalname).substring(1);
            const publicId = `${fieldName}-${Date.now()}`;

            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folderName.trim(),
                    public_id: publicId,
                    resource_type: "image",
                },
                (err, result) => {
                    if (err) return next(err);
                    req.uploadResult = result;
                    next();
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        }
    ];
}

module.exports = uploadToCloudinary;
