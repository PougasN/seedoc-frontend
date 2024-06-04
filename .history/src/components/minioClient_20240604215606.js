import AWS from 'aws-sdk';

// Configure the AWS SDK with MinIO credentials and endpoint
const s3 = new AWS.S3({
  endpoint: 'http://127.0.0.1:9000', // MinIO endpoint
  accessKeyId: 'PougasN', // Replace with your MinIO access key
  secretAccessKey: 'minioadmin', // Replace with your MinIO secret key
  s3ForcePathStyle: true, // Needed for MinIO to work with AWS SDK
  signatureVersion: 'v4',
});

export default s3;
