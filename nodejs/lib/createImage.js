const Jimp = require("jimp")
const utils = require('./utils')
const LoadingBar = require('./loadingBar')

module.exports = (COLOR_VALUES_LENGHT, JSON_DATA_LENGTH, sortedDistances, dimensions, options) => {
    const { HEIGHT_SCALED, WIDTH_SCALED, RATIO } = dimensions
    const CACHED_PHOTOS = new Array(JSON_DATA_LENGTH)
    const SIMILARITY_ARRAY_LENGTH = 20

    let {final, thumbs, duplicate} = options
    const THUMBNAIL_IMAGE_SIZE = parseInt(thumbs)
    const DUPLICATE_DEPTH_CHECK = parseInt(duplicate) % 2 === 0 ? parseInt(duplicate) : parseInt(duplicate) -1
    
    const OG_IMAGE_SIZE = {
        w: COLOR_VALUES_LENGHT / HEIGHT_SCALED,
        h: COLOR_VALUES_LENGHT / WIDTH_SCALED
    }
    const FINAL_IMAGE_SIZE = {
        w: OG_IMAGE_SIZE.w * THUMBNAIL_IMAGE_SIZE,
        h: OG_IMAGE_SIZE.h * THUMBNAIL_IMAGE_SIZE
    }
    
    const emptyNewImage = new Jimp(FINAL_IMAGE_SIZE.w, FINAL_IMAGE_SIZE.h)
    const matrix = []

    const Bar = new LoadingBar(COLOR_VALUES_LENGHT)

    for(let i = 0; i < COLOR_VALUES_LENGHT; i++) {
        let x = (i%OG_IMAGE_SIZE.w) * THUMBNAIL_IMAGE_SIZE
        let y = Math.floor(i/OG_IMAGE_SIZE.w) * THUMBNAIL_IMAGE_SIZE 

        const images_with_lowest_delta = sortedDistances[i]
        let indx  = utils.getRandom(SIMILARITY_ARRAY_LENGTH)

        let shouldChange = false
        while(true) {
            for(let k = 1; k < Math.floor((duplicate * duplicate) /2); k++) {
                let dx = k%DUPLICATE_DEPTH_CHECK
                let dy = Math.floor(k/DUPLICATE_DEPTH_CHECK)

                let prevColumnCheck = matrix[i - dy] === images_with_lowest_delta[indx].count
                let prevRowCheck    = matrix[i - (OG_IMAGE_SIZE.w * dy) - dx] === images_with_lowest_delta[indx].count

                shouldChange = (prevColumnCheck || prevRowCheck) ? true : false
                if(shouldChange) break
            }

            if(shouldChange) indx = utils.getRandom(SIMILARITY_ARRAY_LENGTH)
            else break
        }
        
        const { path, count } = images_with_lowest_delta[indx]
        matrix.push(count)
        
        const baseImg = utils.getJimpInstance(path, count, CACHED_PHOTOS)
        baseImg.resize(THUMBNAIL_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE)
        emptyNewImage.composite(baseImg, x, y)

        Bar.update(i)
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

    Bar.complete()
    return file_name
}
