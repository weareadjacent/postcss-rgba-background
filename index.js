'use strict';

const PNG = require('pngjs').PNG;
const postcss = require('postcss');

const PIXELS = 5;
const PIXELS_SQUARED = Math.pow(PIXELS, 2);

const RGBA_REGEX = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/;

function rgbaBackground(options) {
  return function (root) {
    options = options || {};

    root.walkDecls('background', decl => {
      let matches = RGBA_REGEX.exec(decl.value);

      if (!matches) {
        return;
      }

      let png = new PNG({
        width: PIXELS,
        height: PIXELS
      });

      // Fill in all the pixels
      for (let i=0; i<=PIXELS_SQUARED; i++) {
        let idx = i * 4;

        // These four values are R, G, B, A
        png.data[idx] = matches[1];
        png.data[idx+1] = matches[2];
        png.data[idx+2] = matches[3];
        png.data[idx+3] = matches[4];
      }

      // Get PNG as a base64 encoded string.
      let pngAsString = PNG.sync.write(png).toString('base64');

      // Add new background declaration before with the inline image.
      var newDecl = decl.cloneBefore({
        value: `\nurl(data:image/png;base64,${pngAsString});`
      });
    });
  }
}

module.exports = postcss.plugin('rgba-background', rgbaBackground);