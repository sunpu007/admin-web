const glob = require('glob');
const path = require('path');
// const axios = require('axios');
const fs = require('fs');

class UploadSourceMapWebpackPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.done.tap('upload-sourcemap-plugin', async status => {
      const list = glob.sync(path.join(status.compilation.outputOptions.path, './**/*.{js.map,}'));
      for (let filename of list) {
        this.upload(filename);
      }
    });
  }

  upload(filename) {
    // 上传文件
    console.log('filename====>', filename);
    // 上传完成后，删除当前文件
    fs.unlinkSync(filename);
  }
}

module.exports = UploadSourceMapWebpackPlugin;