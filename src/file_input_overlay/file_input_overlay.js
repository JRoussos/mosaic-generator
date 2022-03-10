import React from 'react'
import image from '../assets/img/demo_photo.jpg';

const FileInputOverlay = ({ updateFile }) => {

  return (
    <div className='image-overlay'>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" role="img">
            <path d="M9 16H16M16 16H23M16 16V23M16 16V9M31 16C31 24.2843 24.2843 31 16 31C7.71573 31 1 24.2843 1 16C1 7.71573 7.71573 1 16 1C24.2843 1 31 7.71573 31 16Z" stroke="white" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        <p>Upload one of your photos or use the <span onClick={() => updateFile(image)}>demo</span></p>
        <p>Drag n' Drop or {'ontouchstart' in window ? 'Tap' : 'Click'}</p>
    </div>
  )
}

export default FileInputOverlay