import React, { useRef, Suspense } from 'react'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

import ServerImage from './server_image'
import DataImage from './data_image'

const CanvasImage = ({ data, map, processing }) => {
    const orbitRef = useRef(null)
    const canvasRef = useRef(null)

    const pixels = data.length 
    const width = Math.sqrt(pixels)

    const pointerList = []
    let timer = null

    const handleTouchStart = (e) => {
        if (pointerList.length >= 1) return
        pointerList.push(e.pointerId)
        
        timer = setTimeout(() => {
            navigator.vibrate(5)
            canvasRef.current?.classList.add('hidden')
        }, 200)
    }

    const handleTouchEnd = () => {
        pointerList.pop()

        clearTimeout(timer)
        timer = null

        canvasRef.current?.classList.remove('hidden')
        orbitRef.current?.reset()
    }

    const cameraProps = {
		fov: Math.atan((width/2)/100) * 2 * (180/Math.PI),
		near: 1,
		far: 100,
		position: [0, 0, 100]
	}

    const canvasStyle = {
        position: 'absolute',
        zIndex: 20,
        cursor: 'pointer'
    } 

    return width > 0 ? (
        <div onPointerDown={handleTouchStart} onPointerUp={handleTouchEnd} onPointerMove={() => clearTimeout(timer)}>
            <Canvas ref={canvasRef} dpr={[window.devicePixelRatio, 2]} camera={cameraProps} style={canvasStyle}>
                <Suspense fallback={null}>
                    { !map ? 
                        <DataImage data={data} pixels={pixels} width={width} processing={processing}/> :
                        <ServerImage map={map}/> }
                </Suspense>
                <OrbitControls ref={orbitRef} enablePan={!processing} enableZoom={!processing} enableRotate={false} enableDamping={false} maxDistance={100}/>
            </Canvas>
        </div>
    ) : null
}

export default CanvasImage