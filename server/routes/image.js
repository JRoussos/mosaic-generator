const express   = require("express")
const path      = require("path")
const Jimp      = require("jimp")
const fs        = require("fs")

const router = express.Router()

const THRESHOLD = 10
const IMAGE_SIZE = 50

function rgb2lab(rgb){
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

function deltaE(labA, labB){
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

const rgbDistance = (rgb1, rgb2) => {
    // const delta_r = rgb1[0] - rgb2[0]
    // const delta_g = rgb1[1] - rgb2[1]
    // const delta_b = rgb1[2] - rgb2[2]

    // return Math.sqrt( delta_r * delta_r + delta_g * delta_g + delta_b * delta_b )

    const lab1 = rgb2lab(rgb1)
    const lab2 = rgb2lab(rgb2)

    return deltaE(lab1, lab2)
}

const findSimilar  = (clientImageData) => {
    const jsonRaw = fs.readFileSync('./assets/photos.json')
    const jsonData = JSON.parse(jsonRaw)

    console.log("JSON Size: ", jsonData.length);

    const selectedImages = []
    
    for(let i = 0; i < clientImageData.length; i++){
        const mostSimilar = [] 
        let min = Infinity, pos = 0

        for(let k = 0; k < jsonData.length; k++){
            let { dominantColor } = jsonData[k]
            let distance = rgbDistance(clientImageData[i], dominantColor)

            if( distance < THRESHOLD ){
                jsonData[k]["distance"] = distance
                mostSimilar.push( jsonData[k] )
            }

            if( distance < min ){
                min = distance
                pos = k
            }
        }

        if(mostSimilar.length < 1){
            mostSimilar.push(jsonData[pos])
        }

        mostSimilar.sort((a, b) => {
            if (a.distance > b.distance) return 1
            if (a.distance < b.distance) return -1
            return 0; // a must be equal to b
        })

        selectedImages.push(mostSimilar)
    }

    return selectedImages
}

const getRandom = (max) => {
    /**
     * random index at the imagesSimilarWithThisPixel array.
     * the result is more likely to be closer to zero, following a quadratic curve.
     */

    return Math.floor(Math.pow(Math.random(), 2) * max) 
}

const createImage = (reseivedColorValuesLength, sortedDistances) => {
    const THUMBNAIL_IMAGE_SIZE = 50
    const DUPLICATE_DEPTH_CHECK = 2
    
    const THRESHOLD = 10
    const OG_IMAGE_SIZE = Math.sqrt(reseivedColorValuesLength)
    const FINAL_IMAGE_SIZE = THUMBNAIL_IMAGE_SIZE * OG_IMAGE_SIZE
    
    const emptyNewImage = new Jimp(FINAL_IMAGE_SIZE, FINAL_IMAGE_SIZE)
    let index = 0

    const matrix = [[]]

    for(let i = 0; i < OG_IMAGE_SIZE; i++) {
        const row = []

        for(let k = 0; k < OG_IMAGE_SIZE; k++) {
            let x = k * THUMBNAIL_IMAGE_SIZE
            let y = i * THUMBNAIL_IMAGE_SIZE

            const imagesSimilarWithThisPixel = sortedDistances[index++] // array of similar images
            const lengthOfSimilars = imagesSimilarWithThisPixel.length // the length of it

            let at = getRandom(lengthOfSimilars) 
            let looping = true

            for(let d = 1; d <= DUPLICATE_DEPTH_CHECK; d++){ // check neighbor cells for the same image
                
                /**
                 * if we check all the cells of the similarImages array and still don't have a unique image the bail out of the loop
                 * since the results are based on random picks it is possible to miss a cell, but this will most be applies to small arrays so the possiblity is lower
                 */
                
                let counter = 0 
                while(looping && (row[k - d] === imagesSimilarWithThisPixel[at].count || matrix[i - d]?.[k] === imagesSimilarWithThisPixel[at].count) && at < lengthOfSimilars){
                    let c = getRandom(lengthOfSimilars) 
                    console.log('\x1b[35m%s\x1b[0m', 'trying...', at, '->', c, 'length: ', lengthOfSimilars, 'index: ', k);
                    if(counter >= lengthOfSimilars){
                        at = 0
                        looping = false
                    }else {
                        at = c
                        counter++
                    }
                }
            }
            
            let { path, count } = imagesSimilarWithThisPixel[at]
            row.push(count)

            const buffer = fs.readFileSync(`./assets${path}`)
            const decoded = Jimp.decoders['image/jpeg'](buffer)
            const baseImg = new Jimp(decoded)
            baseImg.resize(IMAGE_SIZE, IMAGE_SIZE)

            emptyNewImage.composite(baseImg, x, y)
        }
        matrix.push(row)
    }

    const id = new Date().getTime()
    emptyNewImage.resize(1080, 1080).write(`./out/${id}.jpg`)

    return id
}

router.get('/', (req, res) => {
    const id = req.query.id
    const fileName = `${id}.jpg`

    const options = {
        root: path.join(process.cwd(), 'out')
    }

    res.sendFile(fileName, options, (err) => {
        if (err) res.send({error: err})
    })
    // fs.unlinkSync(path.join(process.cwd(), 'out', fileName))
})

router.post('/', (req, res) => {
    const rgbValues = req.body
    const similarArray = findSimilar(rgbValues)

    const createdImage = createImage(rgbValues.length, similarArray)
    console.log('Image was created, sending now...');

    res.send({ success: true, id: createdImage });
    console.log('DONE: ', createdImage);
})

router.delete('/', (req, res) => {
    const id = req.query.id
    const fileName = `${id}.jpg`

    const pathToFile = path.join(process.cwd(), 'out', fileName)

    fs.unlink(pathToFile, (err) => {
        if (err) res.send({ success: false, error: err })
        else res.send({ success: true, id: id})
    })
})

module.exports = router