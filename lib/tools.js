var fs = require('co-fs');
var FilePath = require('./fileMap').filePath;
function getCleanHostName(hostName){
    var hostClean =hostName;
    hostClean = hostClean.replace("files.","");
    return  hostClean;
}
module.exports = {
    getCleanHostName: function(hostName){
        var hostClean =hostName;
        hostClean = hostClean.replace("files.","");
       return  hostClean;
    } ,
  realIp: function * (next) {
      this.req.ip = this.headers['x-forwarded-for'] || this.ip;
      yield *next;
  },

  handelError: function * (next) {
    try {
      yield * next;
    } catch (err) {
      this.status = err.status || 500;
      this.body = err.message;
      C.logger.error(err.stack);
      this.app.emit('error', err, this);
    }
  },

  loadRealPath: function *(next) {
    // router url format must be /api/(.*)
    this.request.fPath = FilePath(this.params[0]);
    C.logger.info(this.request.fPath);
    yield * next;
  },

  checkPathExists: function *(next) {
    // Must after loadRealPath
      var file_name = this.request.fPath.split('/').pop();
      var pathOnly = this.request.fPath.replace(file_name,"");

//  var path = this.headers['host'] ? pathOnly   + this.headers['host']+"/"+file_name:  this.request.fPath;
      var path = this.headers['host'] ? this.request.fPath +"/"  + getCleanHostName(this.headers['host']):  this.request.fPath;
      if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file_name)){
          console.log("is file!!");
          path = this.headers['host'] ? pathOnly   + getCleanHostName(this.headers['host'])+"/"+file_name:  this.request.fPath;
      }
      //var path = this.headers['host'] ? this.request.fPath +"/"  + this.headers['host']:  this.request.fPath;
      C.logger.info('path',path,"host",this.headers['host'],"type:",this.request.type);
      if (!(yield fs.exists(path))) {
      this.status = 404;
      this.body = 'Path Not Exists! ' +path;
    }
    else {
      yield * next;
    }
  },

  checkPathNotExists: function *(next) {
    // Must after loadRealPath
      var file_name = this.request.fPath.split('/').pop();
      var pathOnly = this.request.fPath.replace(file_name,"");

//  var path = this.headers['host'] ? pathOnly   + this.headers['host']+"/"+file_name:  this.request.fPath;
      var path = this.headers['host'] ? this.request.fPath +"/"  + this.headers['host']:  this.request.fPath;
      if((/\.(gif|jpg|jpeg|tiff|png)$/i).test(file_name)){
          console.log("is file!!");
          path = this.headers['host'] ? pathOnly   + getCleanHostName(this.headers['host'])+"/"+file_name:  this.request.fPath;
      }
      //var path = this.headers['host'] ? this.request.fPath +"/"  + this.headers['host']:  this.request.fPath;
      C.logger.info('path',path,"host",this.headers['host'],"type:",this.request.type);

      if (yield fs.exists(path)) {
      this.status = 400;
      this.body = 'Path Has Exists!';
    }
    else {
      yield * next;
    }
  }

};
