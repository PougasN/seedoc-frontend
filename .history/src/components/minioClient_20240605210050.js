import { Client } from 'minio/dist/esm/index.js';

// Initialize the MinIO client
const minioClient = new Client({
  endPoint: '127.0.0.1',
  port: 9000,
  useSSL: false,
  accessKey: 'PougasN', 
  secretKey: 'minioadmin', 
});

export default minioClient;
