var express = require('express');
var router = express.Router();

module.exports = (s3) => {

  // Lists all bucket
  router.get('/', (req, res, next) => {
    s3.listBuckets((err, data) => {
      console.log('Err ' + err);
      console.log(data);
      if (err) res.send(err);
      else res.send(data);
    });
  });

  // Delete bucket
  router.post('/delete-bucket', (req, res, next) => {
    var bucket_name = req.body.bucket;
    if (bucket_name);
    else {
      res.send('Mana bucketnya');
      return ;
    }
    s3.deleteBucket({
      Bucket: bucket_name
    }, (err, data) => {
      console.log('Err ' + err);
      console.log(data);
      res.redirect('/');
    });
  });

  // Create bucket
  router.post('/create-bucket', (req, res, next) => {
    var bucket_name = req.body.bucket;
    if (bucket_name);
    else {
      res.send('Mana bucketnya');
      return ;
    }
    s3.createBucket({
      Bucket: bucket_name,
      ACL: 'public-read-write'
    }, (err, data) => {
      console.log('Err ' + err);
      console.log(data);
      res.redirect('/');
    });
  });

  // Lists all objects under a bucket
  router.get('/:bucket', (req, res, next) => {
    var bucket_name = req.params.bucket;

    s3.listObjects({
      Bucket: bucket_name
    }, (err, data) => {
      console.log('Err: ' + err);
      console.log(data);
      if (err) res.send(err);
      else res.send(data);
    })
  });

  // Download object
  router.get('/:bucket/:object', (req, res, next) => {
    var bucket_name = req.params.bucket;
    var object_name = req.params.object;

    s3.getObject({
      Bucket: bucket_name,
      Key: object_name
    }, (err, data) => {
      console.log('Err: ' + err);
      console.log(data);
      if (err) res.send(err);
      else res.redirect('/' + bucket_name);
    });
  });

  // Delete object
  router.post('/delete-object', (req, res, next) => {
    var bucket_name = req.body.bucket;
    var object_name = req.body.object;
    if (!bucket_name || !object_name) {
      res.send('Cemana nya');
      return ;
    }

    s3.deleteObject({
      Bucket: bucket_name,
      Key: object_name
    }, (err, data) => {
      console.log('Err: ' + err);
      console.log(data);
      if (err) res.send(err);
      else res.redirect('/' + bucket_name);
    });
  });

  // Create object
  router.post('/create-object', (req, res, next) => {
    if (!req.files || !req.files.object || !req.body.bucket) {
      res.send('Mana filenya');
      return ;
    }
    var object = req.files.object;
    var object_name = req.body.object_name || object.name;
    var bucket_name = req.body.bucket;
    s3.putObject({
      Bucket: bucket_name,
      Key: object_name,
      Body: object.data
    }, (err, data) => {
      console.log('Err ' + err);
      console.log(data);
      res.redirect('/' + bucket_name);
    });
  });

  // Copy object between bucket
  router.post('/copy-object', (req, res, next) => {
    var source_bucket_name = req.body.source_bucket;
    var source_object_name = req.body.source_object;
    var destination_bucket_name = req.body.destination_bucket;
    var destination_object_name = req.body.destination_object;
    if (!source_bucket_name || !source_object_name || !destination_bucket_name || !destination_object_name) {
      res.send('Cemana nya');
      return ;
    }

    s3.copyObject({
      Bucket: destination_bucket_name,
      Key: destination_object_name,
      CopySource: source_bucket_name + '/' + source_object_name
    }, (err, data) => {
      console.log('Err ' + err);
      console.log(data);
      res.redirect('/' + source_bucket_name);
    });
  });

  return router;
};
