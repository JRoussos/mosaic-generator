const Jimp = require("jimp")
const fs = require('fs')

/**
 * Random index at the imagesSimilarWithThisPixel array.
 * 
 * @param {Number} max - The number of which the random number won't be greater than
 * @returns {Number} The result is more likely to be closer to zero, following a quartic curve.
 */

exports.getRandom = (max) => { 
    return Math.floor(Math.pow(Math.random(), 4) * max)
} 

/**
 * Get the next common divisor of the side of the image and the scale. 
 * 
 * @param {Number} side - The length of the width/height of the image
 * @param {Number} scale - The number of which the side would be divided by
 * @returns {Number} The next number that is exactly divided by the scale
 */

exports.getNextCommonDivider = (side, scale) => {
    return (side%scale === 0) ? side/scale : getNextCommonDivider (side+1, scale)
}

/**
 * Get a Jimp instace of an image from cache or if not exist in cache create it and push it to it.
 * 
 * @param {String} path - The path to an image
 * @param {Number} count - The unique ID of the image
 * @param {Array} CACHED_PHOTOS - The array of the caches images
 * @returns A jimp instance of that image
 */

exports.getJimpInstance = (path, count, CACHED_PHOTOS) => {
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
 