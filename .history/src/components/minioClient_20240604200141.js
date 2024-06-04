import AWS from 'aws-sdk';
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Modal from './Modal';
import s3 from './minioClient';
import './PatientDetails.css';

// Configure the AWS SDK with MinIO credentials and endpoint
const s3 = new AWS.S3({
  endpoint: 'http://localhost:9000', // MinIO endpoint
  accessKeyId: 'PougasN', // Replace with your MinIO access key
  secretAccessKey: 'minioadmin', // Replace with your MinIO secret key
  s3ForcePathStyle: true, // Needed for MinIO to work with AWS SDK
  signatureVersion: 'v4',
});

export default s3;
