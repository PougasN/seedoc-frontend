import { Client } from 'minio';

// Initialize the MinIO client
const minioClient = new Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'your-access-key', // Replace with your MinIO access key
  secretKey: 'your-secret-key', // Replace with your MinIO secret key
});

export default minioClient;
