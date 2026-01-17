const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dmmaae04t',
  api_key: '446787152296351',
  api_secret: 'VVyefbkgJmGJU17e-zaj5GJA_8Y',
  timeout: 60000 // 60 seconds timeout
});

module.exports = cloudinary;
