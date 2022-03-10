import React, { useRef } from 'react'

import './toolbar_styles.css'

const Toolbar = ({file, map, processing, logMsg, handleClear, handleProcessImage}) => {
    const msgRef = useRef(null)
    const handleDownload = () => {
        navigator.vibrate(5)

        const download_anchor = document.createElement('a')
        download_anchor.href = map
        download_anchor.setAttribute('download', 'mosaic.jpg')

        document.body.appendChild(download_anchor)
        download_anchor.click()
        document.body.removeChild(download_anchor)
    }

    return file ? (
        <div className='toolbar-container'>
            <div className='toolbar'>
                {map ? 
                    <button id='download' onClick={handleDownload} disabled={!map}/> :
                    <button id='mosaic' onClick={handleProcessImage} disabled={processing}/> }
                <button id='clear' onClick={handleClear}/>
            </div>
            {(processing || logMsg.msg) && <div className='info-messages fade-in'>
                <p ref={msgRef} className={logMsg.loading_dots ? 'loading-anim' : null}>{logMsg.msg || 'Waking up the server'}</p>
            </div>}
        </div>
  ) : null
}

export default Toolbar


// {file && }