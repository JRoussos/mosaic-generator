const express   = require("express")
const Jimp      = require("jimp")
const fs        = require("fs")

const router = express.Router()

const THRESHOLD = 30
const IMAGE_SIZE = 50

const rgbDistance = (rgb1, rgb2) => {
    const delta_r = rgb1[0] - rgb2[0]
    const delta_g = rgb1[1] - rgb2[1]
    const delta_b = rgb1[2] - rgb2[2]

    return Math.sqrt( delta_r * delta_r + delta_g * delta_g + delta_b * delta_b )
}

const findSimilar  = (clientImageData) => {
    const jsonRaw = fs.readFileSync('./assets/photos.json')
    const jsonData = JSON.parse(jsonRaw)

    const selectedImages = []
    
    for(let i = 0; i < clientImageData.length; i++){
        const mostSimilar = [] 
        let min = Infinity, pos = 0

        for(let k = 0; k < jsonData.length; k++){
            let { dominantColor } = jsonData[k]
            let distance = rgbDistance(clientImageData[i], dominantColor)
            
            /**
             *  There's an issue here when the minimum distance 
             *  are higher then the threshold, then
             *  the mostSimilar array will be empty
             */

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

const createImage = (jsonLength, similarArray) => {
    const OG_IMAGE_SIZE = Math.sqrt(jsonLength)
    const NEW_IMAGE_SIZE = IMAGE_SIZE * OG_IMAGE_SIZE
    
    const emptyNewImage = new Jimp(NEW_IMAGE_SIZE, NEW_IMAGE_SIZE)
    let index = 0

    // console.log(OG_IMAGE_SIZE, similarArray.length, NEW_IMAGE_SIZE, IMAGE_SIZE);


    for(let i = 0; i < OG_IMAGE_SIZE; i++) {
        for(let k = 0; k < OG_IMAGE_SIZE; k++) {
            let x = k * IMAGE_SIZE
            let y = i * IMAGE_SIZE

            let imagesSimilarWithThisPixel = similarArray[index++]
            let lengthOfSimilars = imagesSimilarWithThisPixel.length

            let theChoosenOne = imagesSimilarWithThisPixel[index % lengthOfSimilars]

            const buffer = fs.readFileSync(`./assets${theChoosenOne.path}`)
            const decoded = Jimp.decoders['image/jpeg'](buffer)
            const baseImg = new Jimp(decoded)

            emptyNewImage.composite(baseImg, x, y)
        }
    }

    return emptyNewImage.write(`./out/img_${new Date().getTime()}.jpg`)
}

router.get('/', (req, res) => {
    console.log(req)
})

router.post('/', (req, res) => {
    const rgbValues = req.body
    const similarArray = findSimilar(rgbValues)

    const createdImage = createImage(rgbValues.length, similarArray)
    console.log('Image was created, sending now...');

    createdImage.getBase64(createdImage.getMIME(), (err, str) => {
        if(err) throw err
        res.send({ success: "ok", base64: str });
    })
})



module.exports = router