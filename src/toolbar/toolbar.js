import React, { useRef, useEffect, useState } from 'react'

import './toolbar_styles.css'

const Toolbar = ({file, processing, logMsg, handleClear, handleProcessImage}) => {
    const msgRef = useRef(null)
    const [index, updateIndex] = useState(0)

    const messages = [
        'Waking up the server..',
        'Finding the best images to match..',
        'We are almost done..',
        'Stitching up the final image..'
    ]

    return file ? (
        <div className='toolbar-container'>
            <div className='toolbar'>
                <button id='mosaic' onClick={handleProcessImage} disabled={processing}/>
                <button id='clear' onClick={handleClear}/>
            </div>
            {(processing || logMsg) && <div className='info-messages fade-in'>
                <p ref={msgRef}>{logMsg || messages[index]}</p>
            </div>}
        </div>
  ) : null
}

export default Toolbar


// {file && }