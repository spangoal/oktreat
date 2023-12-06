const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

exports.upload = function (buffer, fileName, folder, content_type) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${fileName}`,
    Body: buffer,
    ContentType: content_type,
  };
  return new Promise((resolve, reject) => {
    s3.upload(params, async function (err, data) {
      if (err) reject(err);
      resolve({ message: 'File uploaded!', data: data });
    });
  });
};

exports.download = function (key) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) reject(err);
      resolve({ message: 'File downloaded!', data: data });
    });
  });
};
