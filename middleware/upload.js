const multer = require('multer')
const reportsPhotoFolder = 'reportsPhotos';

const storageConfig = multer.diskStorage({
    destination: (req, file, callback) => {
        // make sure to create a "reportsPhotos" folder before storing files
        callback(null, reportsPhotoFolder);
    },
    filename: (req, file, callback) => {
        let extension = '.' + file.originalname.split(".").pop();
        callback(null, file.fieldname + '-' + Date.now() + extension);
    }
});
const uploadMiddleware = multer({ storage: storageConfig });

module.exports = {uploadMiddleware, reportsPhotoFolder}