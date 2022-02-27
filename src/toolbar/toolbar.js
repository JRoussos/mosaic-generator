import React from 'react'

import './toolbar_styles.css'

const Toolbar = ({file, data, handleClear, handleProcessImage}) => {

    return file ? (
    <div className='toolbar-container'>
        <div className='toolbar'>
            <button id='mosaic' onClick={handleProcessImage} disabled={!data.length > 0}/>
            <button id='clear' onClick={handleClear}/>
        </div>
    </div>
  ) : null
}

export default Toolbar


// {file && }