const {
  PutObjectCommand,
  DeleteObjectCommand,
  S3,
} = require('@aws-sdk/client-s3');

const s3Client = new S3({
  endpoint: 'https://nyc3.digitaloceanspaces.com',
  region: 'nyc3',
  credentials: {
    accessKeyId: process.env.SPACES_ACCESS_KEY,
    secretAccessKey: process.env.SPACES_SECRET_KEY,
  },
});

exports.upload = async (buffer, fileName, folder, content_type) => {
  try {
    const params = {
      Bucket: process.env.SPACES_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: buffer,
      ACL: 'public-read',
      ContentType: content_type,
    };

    const data = await s3Client.send(new PutObjectCommand(params));
    return params.Key;
  } catch (err) {
    return err;
  }
};

exports.remove = async (Key) => {
  try {
    const params = { Bucket: process.env.SPACES_BUCKET_NAME, Key: Key };

    const data = await s3Client.send(new DeleteObjectCommand(params));
    return data;
  } catch (err) {
    return err;
  }
};
