const { program } = require('commander');
const tools = require('./funcs')

program
  .name('mosaica')
  .description('CLI tool to generate a mosaic from a set of images')
  .version('1.0.0')

program
  .argument('<path_to_file>', 'path to image file')
  .option('-s, --scale <number>', 'scaling factor', 4)
  .action((str, options) => {
    tools.getImageData(str, parseInt(options.scale))
  });

program.parse();