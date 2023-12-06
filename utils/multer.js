const multer = require('multer');
const AppError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const storage = function (fileType) {
  let multerFilter;

  if (fileType) {
    multerFilter = (req, file, cb) => {
      if (file.mimetype.startsWith(fileType)) {
        cb(null, true);
      } else {
        cb(
          new AppError(
            `Not an ${fileType}! Please upload only ${fileType}s.`,
            400
          ),
          false
        );
      }
    };
  }

  return multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });
};

const upload = storage();

exports.uploadSingle = upload.fields([{ name: 'file', maxCount: 1 }]);
