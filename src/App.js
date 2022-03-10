import React, { useRef, useState } from 'react';
import { io } from 'socket.io-client';

import Toolbar from './toolbar/toolbar';
import CanvasImage from './canvas_image/canvas_image';
import FileInputOverlay from './file_input_overlay/file_input_overlay';
import FileUpload from './file_upload/fileUpload';
import RangeSlider from './range_slider/RangeSlider';

import './App.css';

const App = () => {
  const [data, updateData] = useState([])
  const [scaleValue, upadateValue] = useState(4)
  const [file, updateFile] = useState(null)
  const [map, updateMap] = useState(null)

  const [processing, updateProcessing] = useState(false)
  const [logMsg, updateLogMsg] = useState({loading_dots: true, msg: null})

  const imageRef = useRef(null)
  const imageSize = 240

  const getFromWebSocket = (url = '', data = {}) => {
    console.log('trying to connect..', url)
    const socket = io(url)

    socket.on("connect", () => {
      console.log("connected:", socket.id)
      updateLogMsg({loading_dots: true, msg: 'Finding the best images to match'})
      socket.emit('data', data)
    })

    socket.on("image_id", id => socket.emit('image', id))

    socket.on("image_buffer", image => {
      const {buffer, id} = image 
      const file = URL.createObjectURL(new Blob([buffer], { type: 'image/jpeg'}))
      
      updateLogMsg({loading_dots: false, msg: null})
      updateProcessing(false)
      updateMap(file)
      
      socket.emit('delete', id)
      socket.close()
    })

    socket.on("connect_error", error => {
      updateProcessing(false)
      updateLogMsg({loading_dots: false, msg: 'An error occurred while trying talking to server.'})
      
      console.log(error)
      socket.close()
    })

    socket.on("disconnect", () => {
      console.log("Socket Disconnected")
    })
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

  const handleLoaded = (scale) => { 
    imageRef.current && updateData(getImageData(imageRef.current, scale))
  }

  const handleClear = () => {
    navigator.vibrate(5)

    updateFile(null)
    updateMap(null)
    updateLogMsg({loading_dots: false, msg: null})
    updateProcessing(false)
    updateData([])
  }

  const handleProcessImage = () => {
    navigator.vibrate(5)
    
    updateLogMsg({loading_dots: true, msg: null})
    updateProcessing(true)

    getFromWebSocket('http://192.168.1.16:8000/', data)
  }

  return ( 
    <div className="app">
      <div className='mosaic'>
        <Toolbar file={file} map={map} processing={processing} logMsg={logMsg} handleClear={handleClear} handleProcessImage={handleProcessImage}/>
        <CanvasImage data={data} map={map} processing={processing}/>
        {file && <img ref={imageRef} src={file} alt='uploaded file' onLoad={() => handleLoaded(scaleValue)}/>}
        <FileInputOverlay updateFile={updateFile}/>
        <FileUpload accept=".jpg, .png, .jpeg" updateFile={updateFile} />
      </div>
      <RangeSlider scaleValue={scaleValue} map={map} processing={processing} upadateValue={upadateValue} handleLoaded={handleLoaded}/>
    </div>
  );
}

export default App;
