var express = require('express');
var moment = require('moment');
var filesize = require('filesize');
var router = express.Router();

module.exports = (s3) => {

  // Lists all bucket
  router.get('/', (req, res, next) => {
    s3.listBuckets((err, data) => {
      if (err) {
        res.render('error', {
          error: err,
          message: 'Error while trying to list buckets.'
        });
      }
      else {
        var locals = {
          breadcrumb: [
            {name: 'Home', link: '/'}
          ],
          libraries: {
            moment: moment
          },
          data: data
        };
        res.render('index', locals);
      }
    });
  });

  // Delete bucket
  router.post('/delete-bucket', (req, res, next) => {
    console.log('MASUK SINI COOOOOOY!');
    var bucket_name = req.body.bucket;
    console.log(req.body);

    if (!bucket_name) {
      /*res.render('error', {
        message: 'Bucket name must be specified.'
      });*/
      res.status(400).json({
        message: 'Bucket name must be specified.'
      });
      return;
    }
    s3.deleteBucket({
      Bucket: bucket_name
    }, (err, data) => {
      if (err) {
        /*res.render('error', {
          message: `Error while trying to delete bucket ${bucket_name}`,
          error: err
        });*/
        res.status(500).json({
          message: `Error while trying to delete bucket ${bucket_name}`,
          error: err
        });
      } else{
        res.status(200).send('');
        //res.redirect('/');
      }
    });
  });

  // Create bucket
  router.post('/create-bucket', (req, res, next) => {
    var bucket_name = req.body.bucket;
    if (!bucket_name) {
      /*res.render('error', {
        message: 'Bucket name must be specified.'
      });*/
      res.status(400).json({
        message: 'Bucket name must be specified.'
      });
      return;
    }
    s3.createBucket({
      Bucket: bucket_name,
      ACL: 'public-read-write'
    }, (err, data) => {
      if (err) {
        /*res.render('error', {
          message: `Error while trying to create bucket ${bucket_name}`,
          error: err
        });*/
        res.status(500).json({
          message: `Error while trying to create bucket ${bucket_name}`,
          error: err
        });
      } else {
        res.status(200).send('');
        //res.redirect('/');
      }
    });
  });

  // Lists all objects under a bucket
  router.get('/:bucket', (req, res, next) => {
    var bucket_name = req.params.bucket;

    s3.listObjects({
      Bucket: bucket_name
    }, (err, data) => {
      if (err) {
        res.render('error', {
          message: `Error while trying to access bucket '${bucket_name}'.`,
          error: err
        });
      }
      else {
        var locals = {
          title: data.Name,
          bucketName: data.Name,
          breadcrumb: [
            {name: 'Home', link: '/'},
            {name: data.Name, link: '/' + data.Name},
          ],
          libraries: {
            filesize: filesize,
            moment: moment
          },
          data: data
        };
        res.render('bucket', locals);
      }
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
      if (err) {
        res.render('error', {
          message: `Error while trying to access object '${object_name}' from bucket '${bucket_name}'.`,
          error: err
        });
      }
      else {
        var dataBuffer = data.Body;
        res.writeHead(200, {
          'Content-Type': 'application/force-download',
          'Content-disposition': 'attachment; filename=' + object_name
        });
        res.end(dataBuffer);
        //res.send(data.Body.data);
      }
    });
  });

  // Delete object
  router.post('/delete-object', (req, res, next) => {
    var bucket_name = req.body.bucket;
    var object_name = req.body.object;
    if (!bucket_name || !object_name) {
      res.render('error', {
        message: 'Both bucket name and object name should be specified.'
      });
      return ;
    }

    s3.deleteObject({
      Bucket: bucket_name,
      Key: object_name
    }, (err, data) => {
      if (err) {
        res.render('error', {
          message: `Error while trying to delete object '${object_name}' from bucket '${bucket_name}'.`,
          error: err
        });
      }
      else {
        res.redirect(`/${bucket_name}`);
      }
    });
  });

  // Create object
  router.post('/create-object', (req, res, next) => {
    if (!req.files || !req.files.object || !req.body.bucket) {
      res.render('error', {
        message: 'File and target bucket should be specified.'
      });
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
      if (err) {
        res.render('error', {
          message: `Error while trying to create object '${object_name}' in bucket '${bucket_name}'.`,
          error: err
        });
      }
      else {
        res.redirect(`/${bucket_name}`);
      }
    });
  });

  // Copy object between bucket
  router.post('/copy-object', (req, res, next) => {
    var source_bucket_name = req.body.source_bucket;
    var source_object_name = req.body.source_object;
    var destination_bucket_name = req.body.destination_bucket;
    var destination_object_name = req.body.destination_object;
    if (!source_bucket_name || !source_object_name || !destination_bucket_name || !destination_object_name) {
      res.render('error', {
        message: 'Source target and destination target should be specified.'
      });
      return ;
    }

    s3.copyObject({
      Bucket: destination_bucket_name,
      Key: destination_object_name,
      CopySource: source_bucket_name + '/' + source_object_name
    }, (err, data) => {
      if (err) {
        res.render('error', {
          message: `Error while trying to copy object '${source_object_name}' in bucket '${source_bucket_name}' to object '${destination_object_name}' in bucket '${destination_bucket_name}'.`,
          error: err
        });
      }
      else {
        res.redirect(`/${source_bucket_name}`);
      }
    });
  });

  return router;
};
