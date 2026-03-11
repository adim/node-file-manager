var path = require('path');

var DATA_ROOT = C.data.root;

exports.safeguardPath = function (p) {
  var resolved = path.resolve(p);
  if (resolved.indexOf(path.resolve(DATA_ROOT)) !== 0) {
    var e = new Error('Path traversal detected!');
    e.status = 400;
    throw e;
  }
  return resolved;
};

exports.filePath = function (relPath, decodeURI) {
  if (decodeURI) relPath = decodeURIComponent(relPath);
  var resolved = path.resolve(DATA_ROOT, relPath);
  if (resolved.indexOf(path.resolve(DATA_ROOT)) !== 0) {
    var e = new Error('Path traversal detected!');
    e.status = 400;
    throw e;
  }
  return resolved;
};
