import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './uploads'); 
    },
    filename: (req, file, callback) => {
        const filename = `image-${Date.now()}-${file.originalname}`; // File name
        callback(null, filename);
    }
});

const fileFilter = (req, file, callback) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        callback(null, true);
    } else {
        callback(null, false);
        return callback(new Error("Please upload files with the following extensions: jpg, jpeg, or png.File Size must be below 5mb"));
    }
};

const multerConfig = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5 MB
});

export default multerConfig
