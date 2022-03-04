import React, { useRef, useState, useEffect } from 'react';

import FileUpload from './file_upload/fileUpload';
import RangeSlider from './range_slider/RangeSlider';
import CanvasImage from './canvas_image/canvas_image';
import ImageOverlay from './image_overlay/image_overlay';

import './App.css';
import Toolbar from './toolbar/toolbar';

const App = () => {
  const [data, updateData] = useState([])
  const [scaleValue, upadateValue] = useState(4)
  const [file, updateFile] = useState(null)
  const [map, updateMap] = useState(null)

  const [processing, setProcessing] = useState(false)

  const imageRef = useRef(null)
  const imageSize = 240

  const getImageFromServer = async (url = '', data = {}) => {
    console.log('Sending data to server.. ', url)

    try {
      const post_request = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).then(res => res.json())
      
      const { id } = post_request
      const get_request = await fetch(`${url}?id=${id}`)
        .then(res => res.blob())
        .then(blob => URL.createObjectURL(blob))
        .then(src => updateMap(src))
      
      console.log("done: ", map)

      const delete_request = await fetch(`${url}?id=${id}`, {
        method: 'DELETE'
      }).then(res => console.log('deleted:', res))

    } catch (error) {
      console.log(error)
    }

  }

  const getImageData = (img, scale) => { 
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
  
    canvas.width =  imageSize
    canvas.height = imageSize

    /**
     *  - landscape or portrait pictures dont scale correctly
     *  - scale that are not dividable by the canvas size have wrong average values
     */

    const sWH = Math.min(img.naturalHeight, img.naturalWidth)
    ctx.drawImage(img, 0, 0, sWH, sWH, 0, 0, canvas.width, canvas.height)

    const colors = []
    const maskSize = scale*scale
  
    for (let i = 0; i < imageSize; i += scale) {
      for (let k = 0; k < imageSize; k += scale) {
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

    return colors
  }

  const handleLoaded = () => { 
    const data = getImageData(imageRef.current, scaleValue)
    imageRef.current && updateData(data)
  }

  const handleFiles = file => {
    const blob = URL.createObjectURL(file)
    updateFile(blob)
  }

  const handleClear = () => {
    updateFile(null)
    updateMap(null)
    updateData([])
  }

  const handleProcessImage = () => {
    console.log('handleProcessImage');
    
    // getImageFromServer('http://192.168.1.20:8000/image', data)
    setProcessing(!processing)
  }

  useEffect(() => {
    imageRef.current && handleLoaded()
  }, [imageRef, scaleValue])

  return ( 
    <div className="app">
      <div className='mosaic'>
        <Toolbar file={file} data={data} handleClear={handleClear} handleProcessImage={handleProcessImage}/>
        <CanvasImage data={data} map={map} processing={processing}/>
        {file && <img ref={imageRef} src={file} alt='mosaic' onLoad={handleLoaded}/>}
        <ImageOverlay updateFile={updateFile}/>
        <FileUpload accept=".jpg,.png,.jpeg" handler={handleFiles} />
      </div>
      <RangeSlider scaleValue={scaleValue} upadateValue={upadateValue}/>
    </div>
  );
}

export default App;
