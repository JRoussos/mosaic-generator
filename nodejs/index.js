const { program } = require('commander');
const tools = require('./funcs')

program
  .name('mosaica')
  .description('CLI tool to generate a mosaic from a set of images')
  .version('1.0.0')

program
  .argument('<path_to_file>', 'path to image file')
  .option('-s, --scale <number>', 'Scaling factor', 4)
  .option('-d, --duplicate <number>', 'Duplicate depth check', 2)
  .option('-t, --thumbs <number>', 'Thumbnail size', 50)
  .option('-f, --final <number | auto>', 'Final dimensions of mosaic', 1080)
  .action((str, options) => {
    tools.getImageData(str, options)
  });

program.parse();