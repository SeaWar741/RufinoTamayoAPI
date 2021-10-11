
const fs = require('fs');
const path = require('path');
const { uploadMiddleware, reportsPhotoFolder } = require('../middleware/upload');

function deletePhoto(photoPath) {
    let fullPath = path.join(`./${reportsPhotoFolder}/` + photoPath)
    fs.unlink(fullPath, (err) => {
        if (err) {
            console.error(`Error when deleting photo from fs ${err.message}`)
        } else {
            console.log(`Photo ${photoPath} deleted successfully`);
        }
    })
}

module.exports = { deletePhoto };