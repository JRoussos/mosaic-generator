import React from 'react'
import Attribution from '../attribution/attribution'
import './range_slider_styles.css'

const RangeSlider = ({ scaleValue, map, upadateValue, processing, handleLoaded }) => {
    const vals = [2, 3, 4, 5, 6]
    const isSliderDisabled = map || processing

    const handleChange = (e) => {
        if(isSliderDisabled) return
        navigator.vibrate(3)
        
        const val = e.target.attributes['data-value']?.value || e.target.value
        handleLoaded(parseInt(val))
        upadateValue(parseInt(val))
    }

    return (
        <div className='slider'>
            <div className='values' style={isSliderDisabled ? {pointerEvents: 'none'} : null}>
                {vals.map( (index) => (
                    <span onClick={handleChange} data-value={index} key={index} className={index === scaleValue ? 'active' : null}>1:{index}</span>
                ))}
            </div>
            <input type='range' min={2} max={6} value={scaleValue} onChange={handleChange} disabled={isSliderDisabled}/>
            <div className='desc'>
                <p>Move the slider to control the scale of the mosaic. Note that the smaller the scale, the longer it'll take to produce the final image.</p>
                <Attribution/>
            </div>
        </div>
    )
}

export default RangeSlider