import React, { useRef, useMemo } from 'react'
// import { gsap } from 'gsap'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Vector2 } from 'three'

import { vertex, fragment } from './shaders';

const DataImage = ({ data, pixels, width }) => {
    const instanceMeshRef = useRef() 

    const { sIndices, sPositions, sColor } = useMemo(() => {
		const sIndices = new Uint16Array(pixels)
		const sPositions = new Float32Array(pixels * 3)
        const sColor = new Float32Array(pixels * 3)

		for (let i = 0; i < pixels; i++) {
			sIndices[i] = i

			sPositions[i*3+0] = 0.5 + (i % width)
			sPositions[i*3+1] = (width - 0.5) - Math.floor(i / width)

            sColor[i*3+0] = data[i][0] / 255
            sColor[i*3+1] = data[i][1] / 255
            sColor[i*3+2] = data[i][2] / 255
		}

		return { sIndices, sPositions, sColor }
	}, [data, pixels, width])

    useFrame( ({clock}) => {
		instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime
	})

    // setTimeout(() => {
    //     gsap.to(instanceMeshRef.current.material.uniforms.uSize, { duration: 1, value: 1.0, ease: 'power3.out'})
    // }, 2000);

    const uniforms = useMemo(() => ({
		uSize: { value: 0.0 },
		uTime: { value: 0.0 },
		uTextureSize: { value: new Vector2(width, width) }
	}), [width])

    return(
        <instancedMesh ref={instanceMeshRef} args={[null, null, pixels]}>
            <planeBufferGeometry attach="geometry" args={[1, 1]}>
                <instancedBufferAttribute attachObject={['attributes', 'offset']} args={[sPositions, 3, false]} />
                <instancedBufferAttribute attachObject={['attributes', 'index']} args={[sIndices, 1, false]} />
                <instancedBufferAttribute attachObject={['attributes', 'color']} args={[sColor, 3, false]} />
            </planeBufferGeometry>
            <shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragment} vertexShader={vertex} transparent={true} depthTest={false} depthWrite={false}/>
        </instancedMesh>
    )
}

const CanvasImage = React.forwardRef(({ data }, ref) => {
    const pixels = data.length
    const width = Math.sqrt(pixels)

    const cameraProps = {
		fov: Math.atan((width/2)/100) * 2 * (180/Math.PI), //24, 
		near: 1,
		far: 2000,
		position: [0, 0, 100]
	}

    const canvasStyle = {
        position: 'absolute',
        zIndex: 20,
        cursor: 'pointer',
        background: 'rgba(0, 0, 0, 0.25)'
    } 

    return data.length > 0 ? (
        <Canvas ref={ref} dpr={[window.devicePixelRatio, 2]} camera={cameraProps} style={canvasStyle}>
            <DataImage data={data} pixels={pixels} width={width}/>
            <OrbitControls enablePan={true} enableZoom={true} enableRotate={false} />
        </Canvas>
    ) : null
})

export default CanvasImage