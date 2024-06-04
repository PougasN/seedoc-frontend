import { Client } from 'minio/dist/esm/index.js';

// Initialize the MinIO client
const minioClient = new Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'PougasN', // Replace with your MinIO access key
  secretKey: 'minioadmin', // Replace with your MinIO secret key
});

export default minioClient;
