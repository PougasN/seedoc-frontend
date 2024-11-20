import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: 'us-east-1',
  endpoint: 'http://127.0.0.1:9000',
  credentials: {
    accessKeyId: 'PougasN',
    secretAccessKey: 'minioadmin',
  },
  forcePathStyle: true,
});

export default s3Client;
