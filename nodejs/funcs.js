const { createCanvas, loadImage } = require('canvas')
const Jimp = require("jimp")
const fs = require('fs')

const JSON_RAW = fs.readFileSync('./assets/photos5.json')
const JSON_DATA = JSON.parse(JSON_RAW)
const JSON_DATA_LENGTH = JSON_DATA.length

const SIMILARITY_ARRAY_LENGTH = 30
const CACHED_PHOTOS = new Array(JSON_DATA_LENGTH)
const IMAGE_SIZE = 240

const rgb2lab = (rgb) => {
    var r = rgb[0] / 255,
        g = rgb[1] / 255,
        b = rgb[2] / 255,
        x, y, z;
  
    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
    x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
    z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
  
    x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
    y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
    z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;
  
    return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

const deltaE = (labA, labB) => {
    var deltaL = labA[0] - labB[0];
    var deltaA = labA[1] - labB[1];
    var deltaB = labA[2] - labB[2];
    var c1 = Math.sqrt(labA[1] * labA[1] + labA[2] * labA[2]);
    var c2 = Math.sqrt(labB[1] * labB[1] + labB[2] * labB[2]);
    var deltaC = c1 - c2;
    var deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    var sc = 1.0 + 0.045 * c1;
    var sh = 1.0 + 0.015 * c1;
    var deltaLKlsl = deltaL / (1.0);
    var deltaCkcsc = deltaC / (sc);
    var deltaHkhsh = deltaH / (sh);
    var i = deltaLKlsl * deltaLKlsl + deltaCkcsc * deltaCkcsc + deltaHkhsh * deltaHkhsh;
    return i < 0 ? 0 : Math.sqrt(i);
}

const getSimilarArray = (clientImageData) => {
    console.log("Images Available: ", JSON_DATA_LENGTH);

    const sortedDistances = []

    for(let i = 0; i < clientImageData.length; i++){
        const value = rgb2lab(clientImageData[i])
        const labValues = JSON_DATA.map(element => {
            const { count, path, dominantColor } = element
            return { count: count, path: path, distance: deltaE(dominantColor, value) }
        })
        
        
        labValues.sort((a, b) => {
            if (a.distance > b.distance) return 1
            if (a.distance < b.distance) return -1
            return 0; // a must be equal to b
        })

        sortedDistances.push(labValues)
    }
    return sortedDistances
}

/**
 * random index at the imagesSimilarWithThisPixel array.
 * The result is more likely to be closer to zero, following a quartic curve.
 */
const getRandom = (max) => Math.floor(Math.pow(Math.random(), 4) * max) 

const getJimpInstance = (path, count) => {
    if(CACHED_PHOTOS[count]) {
        return CACHED_PHOTOS[count]
    }else {
        const buffer = fs.readFileSync(`./assets${path}`)
        const decoded = Jimp.decoders['image/jpeg'](buffer)
        const baseImg = new Jimp(decoded)

        CACHED_PHOTOS[count] = baseImg
        return baseImg
    }
}

const createImage = (reseivedColorValuesLength, sortedDistances, dimensions, options) => {
    const { HEIGHT_SCALED, WIDTH_SCALED, RATIO } = dimensions
    let {final, thumbs, duplicate } = options

    const THUMBNAIL_IMAGE_SIZE = parseInt(thumbs)
    const DUPLICATE_DEPTH_CHECK = parseInt(duplicate)
    
    const OG_IMAGE_SIZE = {
        w: reseivedColorValuesLength / HEIGHT_SCALED,
        h: reseivedColorValuesLength / WIDTH_SCALED
    }
    const FINAL_IMAGE_SIZE = {
        w: OG_IMAGE_SIZE.w * THUMBNAIL_IMAGE_SIZE,
        h: OG_IMAGE_SIZE.h * THUMBNAIL_IMAGE_SIZE
    }
    
    const emptyNewImage = new Jimp(FINAL_IMAGE_SIZE.w, FINAL_IMAGE_SIZE.h)
    const matrix = []

    for(let i = 0; i < reseivedColorValuesLength; i++) {
        let x = (i%OG_IMAGE_SIZE.w) * THUMBNAIL_IMAGE_SIZE
        let y = Math.floor(i/OG_IMAGE_SIZE.w) * THUMBNAIL_IMAGE_SIZE 

        const images_with_lowest_delta = sortedDistances[i]
        let indx = getRandom(SIMILARITY_ARRAY_LENGTH)

        for(let k = 0; k < DUPLICATE_DEPTH_CHECK; k++) {
            let looping = true
            while(looping) {
                let prevColumnCheck = matrix[i - k] === images_with_lowest_delta[indx].count
                let prevRowLCheck   = matrix[(i - OG_IMAGE_SIZE.w) - k] === images_with_lowest_delta[indx].count
                let prevRowRCheck   = matrix[(i - OG_IMAGE_SIZE.w) + k] === images_with_lowest_delta[indx].count
                
                if(prevColumnCheck || prevRowLCheck || prevRowRCheck) indx = getRandom(SIMILARITY_ARRAY_LENGTH)
                else looping = false
            }
        }
        
        const { path, count } = images_with_lowest_delta[indx]
        matrix.push(count)
        
        const baseImg = getJimpInstance(path, count)
        baseImg.resize(THUMBNAIL_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE)
        emptyNewImage.composite(baseImg, x, y)
    }

    const file_name = `mosaic_${new Date().getTime()}.jpg`
    
    if(final === 'auto') 
        emptyNewImage.write(`./out/${file_name}`)   
    else {
        final = parseInt(final)
        const new_width  = OG_IMAGE_SIZE.w >= OG_IMAGE_SIZE.h ? final : final / RATIO
        const new_height = OG_IMAGE_SIZE.h >= OG_IMAGE_SIZE.w ? final : final / RATIO
    
        emptyNewImage.resize(new_width, new_height).write(`./out/${file_name}`)
    }

    return file_name
}

const processImageData = (colorValues, dimensions, options) => {
    const t0 = performance.now()
    
    const similarArray = getSimilarArray(colorValues)
    const file = createImage(colorValues.length, similarArray, dimensions, options)
    
    const t1 = performance.now()
    const performanceInSeconds = (t1 - t0) /1000

    console.log('eta: ', performanceInSeconds);
    console.log(`Image was created at './out/${file}'`);
}

const getImageData = async (path, options) => {
    const scale = parseInt(options.scale)

    try {
        const loaded_image = await loadImage(`${path}`)
        
        const { width, height } = loaded_image
        const aspect_ratio  = Math.max(width, height) / Math.min(width, height)
        const canvas_width  = width  >= height ? IMAGE_SIZE : Math.round(IMAGE_SIZE / aspect_ratio)
        const canvas_height = height >= width  ? IMAGE_SIZE : Math.round(IMAGE_SIZE / aspect_ratio)

        const canvas = createCanvas(canvas_width, canvas_height)
        const ctx = canvas.getContext('2d')

        console.log("Canvas Size: ",canvas_width, canvas_height);

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

        processImageData(colors, { WIDTH_SCALED: canvas_width/scale, HEIGHT_SCALED: canvas_height/scale, RATIO: aspect_ratio }, options)

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    getImageData: getImageData
}