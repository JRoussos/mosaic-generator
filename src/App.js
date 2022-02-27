import React, { useRef, useState, useEffect } from 'react';

import FileUpload from './file_upload/fileUpload';
import RangeSlider from './range_slider/RangeSlider';
import CanvasImage from './canvas_image/canvas_image';

import image from './assets/img/photo303.jpg';

import './App.css';
import Toolbar from './toolbar/toolbar';

const App = () => {
  const [data, updateData] = useState([])
  const [scaleValue, upadateValue] = useState(4)
  const [file, updateFile] = useState(null)

  const imageRef = useRef(null)
  const bitsRef  = useRef(null)

  const imageSize = 200
  const pointerList = []
  let timer = null

  const getImageFromServer = async (data) => {
    console.log('Sending data to server..')

    const post_request = await fetch('http://localhost:8000/image', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(res => res.json())
    
    const { id } = post_request
    const get_request = await fetch(`http://localhost:8000/image?id=${id}`).then(res => res.blob()).then(blob => URL.createObjectURL(blob))

    updateFile(get_request)
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

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

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
    updateData([])
  }

  const handleTouchStart = (e) => {
    if (e.target.tagName === 'BUTTON' || pointerList.length >= 1) return
    if(e.pointerType === "touch") pointerList.push(e.pointerId)

    timer = setTimeout(() => {
      file && bitsRef.current?.classList.add('hidden')
    }, 200)
  }

  const handleTouchEnd = (e) => {
    if(e.pointerType === "touch") pointerList.pop()

    clearTimeout(timer)
    file && bitsRef.current?.classList.remove('hidden')
  }

  const handleProcessImage = () => {
    console.log('handleProcessImage');
  }

  useEffect(() => {
    imageRef.current && handleLoaded()
  }, [imageRef, scaleValue])

  return ( 
    <div className="app">
      <div className='mosaic' onPointerDown={handleTouchStart} onPointerUp={handleTouchEnd} onPointerMove={() => clearTimeout(timer)}>
        <Toolbar file={file} data={data} handleClear={handleClear} handleProcessImage={handleProcessImage}/>
        <CanvasImage ref={bitsRef} data={data}/>
        {file && <img ref={imageRef} src={file} alt='mosaic' onLoad={handleLoaded}/>}
        <div className='image-overlay'>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" role="img">
            <path d="M9 16H16M16 16H23M16 16V23M16 16V9M31 16C31 24.2843 24.2843 31 16 31C7.71573 31 1 24.2843 1 16C1 7.71573 7.71573 1 16 1C24.2843 1 31 7.71573 31 16Z" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>Upload one of your photos or use the <span onClick={() => updateFile(image)}>demo</span></p>
          <p>Drag n Drop or Click</p>
        </div>
        <FileUpload accept=".jpg,.png,.jpeg" handler={handleFiles} />
      </div>
      <RangeSlider scaleValue={scaleValue} upadateValue={upadateValue}/>
    </div>
  );
}

export default App;
