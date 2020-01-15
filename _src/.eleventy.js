const terser = require('terser');
const postcss = require('postcss');
const precss = require('precss');
const cssnano = require('cssnano');

module.exports = function(eleventyConfig) {
  eleventyConfig.addWatchTarget('./css');
  eleventyConfig.addWatchTarget('./js');
  eleventyConfig.addWatchTarget('./img');

  eleventyConfig.addPassthroughCopy('./ads.txt');

  eleventyConfig.addPassthroughCopy('./img');

  eleventyConfig.addTransform("postcss", async function(content, outputPath) {
    if(outputPath.endsWith(".css") ) {
      let lazy = await postcss([precss]).process(content, { from: outputPath, to: outputPath });
      return lazy.css;
    }

    return content;
  });

  // eleventyConfig.addTransform("terser", function(content, outputPath) {
  //   if(outputPath.endsWith(".js") ) {
  //     let minified = terser.minify(content);
  //     return minified.code;
  //   }

  //   return content;
  // });
  
  return {
    dir: {
      output: "../"
    },
    templateFormats: ['pug', 'njk']
  }
}