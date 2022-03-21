const { createCanvas, loadImage } = require('canvas')
const fs = require('fs')

const utils = require('./utils')
const getSimilarArray = require('./getSimilarArray')
const createImage = require('./createImage')

const JSON_RAW = fs.readFileSync('./assets/photos.json')
const JSON_DATA = JSON.parse(JSON_RAW)

const IMAGE_SIZE = 240

const processImageData = (colorValues, dimensions, options) => {
    const t0 = performance.now()
    
    const similarArray = getSimilarArray(colorValues, JSON_DATA)
    const file = createImage(colorValues.length, JSON_DATA.length, similarArray, dimensions, options)
    
    const t1 = performance.now()
    const performanceInSeconds = (t1 - t0) /1000

    console.log(`Image was created at '\x1b[33m./out/${file}\x1b[0m'`)
    console.log('Time Elapsed: ', performanceInSeconds.toFixed(2)+'s')
}

module.exports = async (path, options) => {
    const scale = parseInt(options.scale)

    try {
        const loaded_image = await loadImage(path)
        
        const { width, height } = loaded_image
        const aspect_ratio  = Math.max(width, height) / Math.min(width, height)
        const canvas_width  = width  >= height ? IMAGE_SIZE : Math.round(IMAGE_SIZE / aspect_ratio)
        const canvas_height = height >= width  ? IMAGE_SIZE : Math.round(IMAGE_SIZE / aspect_ratio)

        const canvas = createCanvas(canvas_width, canvas_height)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(loaded_image, 0, 0, canvas_width, canvas_height)

        const colors = []
        const maskSize = scale*scale
    
        for (let i = 0; i < canvas_height; i += scale) {
            for (let k = 0; k < canvas_width; k += scale) {
                const imgData = ctx.getImageData(k, i, scale, scale)
                const data = Float32Array.from(imgData.data)

                const rgb = [0, 0, 0]
                for (let index = 0; index < data.length/4; index++) {
                rgb[0] += data[index*4+0]
                rgb[1] += data[index*4+1]
                rgb[2] += data[index*4+2]
                } 

                colors.push([
                rgb[0] = Math.floor(rgb[0] / maskSize),
                rgb[1] = Math.floor(rgb[1] / maskSize),
                rgb[2] = Math.floor(rgb[2] / maskSize),
                ])
            }
        }

        const dimensions = {
            WIDTH_SCALED: utils.getNextCommonDivider(canvas_width, scale), 
            HEIGHT_SCALED: utils.getNextCommonDivider(canvas_height, scale), 
            RATIO: aspect_ratio
        }

        processImageData(colors, dimensions, options)

    } catch (error) {
        console.log("\n", error.message)
    }
}