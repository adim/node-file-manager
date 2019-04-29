const _ = require('lodash');
var fs = require('co-fs');
var path = require('path');
var views = require('co-views');
var origFs = require('fs');
var koaRouter = require('koa-router');
var bodyParser = require('koa-bodyparser');
var formParser = require('co-busboy');

var Tools = require('./tools');
var FilePath = require('./fileMap').filePath;
var FileManager = require('./fileManager');

var router = new koaRouter();
var render = views(path.join(__dirname, './views'), {map: {html: 'ejs'}});

router.get('/', function *() {
  this.redirect('files');
});

router.get('/files', function *() {
    this.body = yield render('files');
});

router.get('/files/(.*)', function *() {
    //this.request.fPath = FilePath(this.params[0]);
    this.body = yield render('files');
});

/*
copy existing folder to a new folder, 2 sections in fpath
1. before "/model/" location of origin
2. after "/model/" location od dest
etc path: /cf/copy/lib/views/model/lib/newviews which will copy lib/views into lib/newviews
 */
router.get('/cf/copy/(.*)', Tools.loadRealPath, function *() {
    // return new Promise( (resolve, reject) => {
        const model = this.request.fPath.split("/model/");
        if (model.length < 2) {
            return;
        }
        C.logger.info(`copying from folder:${"~/var/www/html/" + domainsmodel[0]} to new folder: ${"~/var/www/html/" + domainsmodel[1]}`);
        var ncp = require('ncp').ncp;

        ncp.limit = 16;

        ncp("~/var/www/html/" + domainsmodel[0], "~/var/www/html/domains" + model[1], function (err) {
            if (err) {
                console.log(err);
                this.status = 500;
                // reject(err);
            } else {
                console.log('done!');
                this.body = "done!";
                // resolve();
            }
        });
    // })
    //     .catch( err => { throw err});
});
router.get('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, function *() {
    var file_name = this.request.fPath.split('/').pop();
    var pathOnly = this.request.fPath.replace(file_name,"");

    let p = this.request.fPath;
    const newsetup_domains = ["localhost:8080","ken2lo35.club","adtaststic.com","dontstopmyads.live","freemyserving.club","loads-of-traffic.club","rtbexpertz.com","rtbridge.network","serve4omhere.club","servedwithstyle.online","theservingofthepros.live"];
    if (!_.includes(newsetup_domains, this.header['host'])) {
        console.log("not in newSetup domain! falling back to old code");
        p = this.headers['host'] ? this.request.fPath + "/" + Tools.getCleanHostName(this.headers['host']) : this.request.fPath;
            if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file_name)){
                console.log("is file!!");
                p = this.headers['host'] ? pathOnly + Tools.getCleanHostName(this.headers['host']) + "/" + file_name : this.request.fPath;
            }
    }
    console.log("dddddd",p,"type:",this.query.type);
    const stats = yield fs.stat(p);
    if (stats.isDirectory()) {
      this.body = yield * FileManager.list(p);
    }
    else {
      //this.body = yield fs.createReadStream(p);
      this.body = origFs.createReadStream(p);
    }
});

router.del('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, function *() {
    var file_name = this.request.fPath.split('/').pop();
    var pathOnly = this.request.fPath.replace(file_name,"");

    let p = this.request.fPath;
    const newsetup_domains = ["localhost:8080","ken2lo35.club","adtaststic.com","dontstopmyads.live","freemyserving.club","loads-of-traffic.club","rtbexpertz.com","rtbridge.network","serve4omhere.club","servedwithstyle.online","theservingofthepros.live"];
    if (!_.includes(newsetup_domains, this.header['host'])) {
        p = this.headers['host'] ? this.request.fPath + "/" + Tools.getCleanHostName(this.headers['host']) : this.request.fPath;
        if ((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file_name)) {
            console.log("is file!!");
            p = this.headers['host'] ? pathOnly + Tools.getCleanHostName(this.headers['host']) + "/" + file_name : this.request.fPath;
        }
    }
  yield * FileManager.remove(p);
  this.body = 'Delete Succeed!';
});

router.put('/api/(.*)', Tools.loadRealPath, Tools.checkPathExists, bodyParser(), function* () {
  var type = this.query.type;
  let p = this.request.fPath;
  const newsetup_domains = ["localhost:8080","ken2lo35.club","adtaststic.com","dontstopmyads.live","freemyserving.club","loads-of-traffic.club","rtbexpertz.com","rtbridge.network","serve4omhere.club","servedwithstyle.online","theservingofthepros.live"];
  if (!_.includes(newsetup_domains, this.header['host'])) {
      p = this.headers['host'] ? this.request.fPath + "/" + Tools.getCleanHostName(this.headers['host']) : this.request.fPath;
  }
  if (!type) {
    this.status = 400;
    this.body = 'Lack Arg Type'
  }
  else if (type === 'MOVE') {
    var src = this.request.body.src;
    if (!src || ! (src instanceof Array)) return this.status = 400;
    var src = src.map(function (relPath) {
      return FilePath(relPath, true);
    });
    yield * FileManager.move(src, p);
    this.body = 'Move Succeed!';
  }
  else if (type === 'RENAME') {
    var target = this.request.body.target;
    if (!target) return this.status = 400;
    yield * FileManager.rename(p, FilePath(target, true));
    this.body = 'Rename Succeed!';
  }
  else {
    this.status = 400;
    this.body = 'Arg Type Error!';
  }
});

router.post('/api/(.*)', Tools.loadRealPath, Tools.checkPathNotExists, bodyParser(), function *() {
    var type = this.query.type;
    var file_name = this.request.fPath.split('/').pop();
    var pathOnly = this.request.fPath.replace(file_name,"");
    let p = this.request.fPath;
    const newsetup_domains = ["localhost:8080","ken2lo35.club","adtaststic.com","dontstopmyads.live","freemyserving.club","loads-of-traffic.club","rtbexpertz.com","rtbridge.network","serve4omhere.club","servedwithstyle.online","theservingofthepros.live"];
    if (!_.includes(newsetup_domains, this.header['host'])) {
        p = this.headers['host'] ? pathOnly + Tools.getCleanHostName(this.headers['host']) + "/" + file_name : this.request.fPath;
    }
    console.log("PPPP",p,pathOnly,file_name);

    if (!type) {
    this.status = 400;
    this.body = 'Lack Arg Type!';
  }
  else if (type === 'CREATE_FOLDER') {
    yield * FileManager.mkdirs(p);
    this.body = 'Create Folder Succeed!';
  }
  else if (type === 'UPLOAD_FILE') {
    var formData = yield formParser(this.req);
    if (formData.fieldname === 'upload'){
      var writeStream = origFs.createWriteStream(p);
      formData.pipe(writeStream);
      this.body = 'Upload File Succeed!';
    }
    else {
      this.status = 400;
      this.body = 'Lack Upload File!';
    }
  }
  else if (type === 'CREATE_ARCHIVE') {
    var src = this.request.body.src;
    if (!src) return this.status = 400;
    src = src.map(function(file) {
      return FilePath(file, true);
    })
    var archive = p;
    yield * FileManager.archive(src, archive, C.data.root, !!this.request.body.embedDirs);
    this.body = 'Create Archive Succeed!';
  }
  else {
    this.status = 400;
    this.body = 'Arg Type Error!';
  }
});

module.exports = router.middleware();
