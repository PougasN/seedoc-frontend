import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1', // Replace with your MinIO region
  endpoint: 'http://127.0.0.1:9000', // MinIO endpoint
  credentials: {
    accessKeyId: 'your-access-key', // Replace with your MinIO access key
    secretAccessKey: 'your-secret-key', // Replace with your MinIO secret key
  },
  forcePathStyle: true, // Required for MinIO
});

export default s3Client;
