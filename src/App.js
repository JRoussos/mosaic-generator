import React, { useRef, useState } from 'react';
import FileUpload from './file_upload/fileUpload';

import image from './assets/img/photo303.jpg';

import './App.css';

const App = () => {
  const [done, updateStatus] = useState([])
  const [file, updateFile] = useState('')

  const imageRef = useRef(null)

  const imageSize = 200

    const getImageData = (img, scale=4) => { 
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
    
      canvas.width =  imageSize
      canvas.height = imageSize
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
      const data = getImageData(imageRef.current, 4)
      imageRef.current && updateStatus(data)
    }

    const handleFiles = file => {
      const blob = URL.createObjectURL(file)
      updateFile(blob)
    }

    const handleClear = () => {
      updateFile(null)
      updateStatus([])
    }

    return ( 
        <div className="app">
          <div className='mosaic'>
            {file && <button onClick={handleClear}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" role="img">
                <path d="M12.2049 13.692C12.6156 14.1027 13.2814 14.1027 13.692 13.692C14.1027 13.2814 14.1027 12.6156 13.692 12.2049L8.48711 7L13.692 1.7951C14.1027 1.38445 14.1027 0.718646 13.692 0.307991C13.2814 -0.102663 12.6156 -0.102663 12.2049 0.307991L7 5.51289L1.7951 0.307991C1.38445 -0.102663 0.718646 -0.102664 0.307991 0.307991C-0.102663 0.718646 -0.102663 1.38445 0.307991 1.7951L5.51289 7L0.307991 12.2049C-0.102664 12.6156 -0.102663 13.2814 0.307991 13.692C0.718646 14.1027 1.38445 14.1027 1.7951 13.692L7 8.48711L12.2049 13.692Z" fill="white" fillOpacity='0.8'/>
              </svg>
            </button>}
            <div className='bits' style={{gridTemplateColumns: `repeat(${Math.sqrt(done.length)}, 1fr)`}}>
              {done.length > 0 && done.map( (color, index) => (
                <div key={index} style={{backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`}}></div>
              ))}
            </div>
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
        </div>
    );
}

export default App;
