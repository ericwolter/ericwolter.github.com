var path = require('path');
var mkdirp = require('mkdirp');
var fs = require('fs');

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}

fs.readdir(__dirname, function(err, files) {
  posts = files.filter(function(file) {
    return /\.md$/g.test(file);
  });

  posts.forEach(function(post) {
    var date = post.substring(0, 8);
    var year = date.substring(0, 4);
    var month = date.substring(4, 6);
    var day = date.substring(6, 8);
    var title = post.substring(9, post.length - 3);

    var src = path.join(__dirname, post);
    var dest_dir = path.join(__dirname, '../contents/posts/', year, month, day, title);
    var dest_file = path.join(dest_dir, 'index.md');

    mkdirp(dest_dir, function(err) {
      if (err) {
        console.error(err);
      } else {
        copyFile(src, dest_file, function(err) {
          if (err) {
            console.error(err);
          } else {
            console.log('Copied ' + post);
          }
        });
      }
    });
  });
});