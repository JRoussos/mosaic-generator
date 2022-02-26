import React from 'react'
import './range_slider_styles.css'

const RangeSlider = ({ scaleValue, upadateValue }) => {
    const vals = [3, 4, 5, 6, 7]

    const handleChange = (e) => {
        upadateValue(parseInt(e.target.value))
    }

    return (
        <div className='slider'>
            <div className='values'>
                {vals.map( (index) => (
                    <span onClick={() => upadateValue(index)} key={index} className={index === scaleValue ? 'active' : null}>1:{index}</span>
                ))}
            </div>
            <input type='range' min={3} max={7} value={scaleValue} onChange={handleChange}/>
            <div className='desc'>
                <p>Control the scale of the area that will be replaced by an image.</p>
                <p>Note that the larger the scale, the bigger the final image.</p>
            </div>
        </div>
    )
}

export default RangeSlider