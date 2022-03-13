const express   = require("express")
const path      = require("path")
const Jimp      = require("jimp")
const fs        = require("fs")

const router = express.Router()

const JSON_RAW = fs.readFileSync('./assets/photos5.json')
const JSON_DATA = JSON.parse(JSON_RAW)
const JSON_DATA_LENGTH = JSON_DATA.length

const SIMILARITY_ARRAY_LENGTH = 30

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

const getJimpInstance = (path, count, CACHED_PHOTOS) => {
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

const createImage = (reseivedColorValuesLength, sortedDistances, CACHED_PHOTOS) => {
    const THUMBNAIL_IMAGE_SIZE = 50
    const DUPLICATE_DEPTH_CHECK = 2
    
    const OG_IMAGE_SIZE = Math.sqrt(reseivedColorValuesLength)
    const FINAL_IMAGE_SIZE = THUMBNAIL_IMAGE_SIZE * OG_IMAGE_SIZE
    
    const emptyNewImage = new Jimp(FINAL_IMAGE_SIZE, FINAL_IMAGE_SIZE)
    const matrix = []

    for(let i = 0; i < reseivedColorValuesLength; i++) {
        let x = (i%OG_IMAGE_SIZE) * THUMBNAIL_IMAGE_SIZE
        let y = Math.floor(i/OG_IMAGE_SIZE) * THUMBNAIL_IMAGE_SIZE 

        const images_with_lowest_delta = sortedDistances[i]
        let indx = getRandom(SIMILARITY_ARRAY_LENGTH)

        for(let k = 0; k < DUPLICATE_DEPTH_CHECK; k++) {
            let looping = true
            while(looping) {
                let prevColumnCheck = matrix[i - k] === images_with_lowest_delta[indx].count
                let prevRowLCheck   = matrix[(i - OG_IMAGE_SIZE) - k] === images_with_lowest_delta[indx].count
                let prevRowRCheck   = matrix[(i - OG_IMAGE_SIZE) + k] === images_with_lowest_delta[indx].count
                
                if(prevColumnCheck || prevRowLCheck || prevRowRCheck) indx = getRandom(SIMILARITY_ARRAY_LENGTH)
                else looping = false
            }
        }
        
        const { path, count } = images_with_lowest_delta[indx]
        matrix.push(count)
        
        const baseImg = getJimpInstance(path, count, CACHED_PHOTOS)
        baseImg.resize(THUMBNAIL_IMAGE_SIZE, THUMBNAIL_IMAGE_SIZE)
        emptyNewImage.composite(baseImg, x, y)
    }

    const id = new Date().getTime()
    emptyNewImage.resize(1080, 1080).write(`./out/${id}.jpg`)

    return id
}

const saveLog = (reseivedColorValuesLength, performanceInSeconds) => {
    const rData = fs.readFileSync('logs.json')
    const logs = JSON.parse(rData)

    let avg = logs.find(element => element.scale === reseivedColorValuesLength)
    if (avg) {
        avg['count'] ++
        avg['eta'] = (avg['eta'] + performanceInSeconds) / avg['count']
    }else logs.push({ "scale": reseivedColorValuesLength, "count": 1, "eta": performanceInSeconds })

    const wData = JSON.stringify(logs)
    fs.writeFileSync('logs.json', wData)
}

router.get('/times', (req, res) => {
    const scale = req.query.scale
    const rData = fs.readFileSync('logs.json')

    const logs = JSON.parse(rData)
    const avg  = logs.find(element => element.scale === scale)
    res.send({ success: true, average: avg.eta || -1})
})

router.get('/', (req, res) => {
    const id = req.query.id
    
    const fileName = `${id}.jpg`
    const pathToFile = path.join(process.cwd(), 'out', fileName)

    res.sendFile(pathToFile, (error) => {
        if (error) res.status(404).send({ success: false, error: error })
    })
})

router.post('/', (req, res) => {
    const CACHED_PHOTOS = new Array(JSON_DATA_LENGTH)

    const reseivedColorValues = req.body
    console.log('Request body length: ', reseivedColorValues.length);
    const t0 = performance.now()
    
    const similarArray = getSimilarArray(reseivedColorValues)
    const id = createImage(reseivedColorValues.length, similarArray, CACHED_PHOTOS)
    
    console.log('Image was created, sending now...')
    const t1 = performance.now()
    const performanceInSeconds = (t1 - t0) /1000

    setTimeout(() => {
        res.send({ success: true, id: id, eta: performanceInSeconds })
        console.log('DONE: ', id, 'eta: ', performanceInSeconds)
    }, 500)
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