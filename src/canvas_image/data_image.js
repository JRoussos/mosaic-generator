import React, { useRef, useMemo, useLayoutEffect, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector2 } from 'three'
import { gsap } from 'gsap'

import { vertex, fragment } from './shaders'

const DataImage = ({ data, pixels, width, processing }) => {
    const instanceMeshRef = useRef() 
    const { camera } = useThree()

    const { sIndices, sPositions, sColor } = useMemo(() => {
		const sIndices = new Uint16Array(pixels)
		const sPositions = new Float32Array(pixels * 3)
        const sColor = new Float32Array(pixels * 3)

		for (let i = 0; i < pixels; i++) {
			sIndices[i] = i

            sPositions[i*3+0] = 0.5 + (i % width) // (0.5 + (i % width)) - width/2
			sPositions[i*3+1] = (width - 0.5) - Math.floor(i / width) // ((width - 0.5) - Math.floor(i / width)) - width/2

            sColor[i*3+0] = data[i][0] / 255
            sColor[i*3+1] = data[i][1] / 255
            sColor[i*3+2] = data[i][2] / 255
		}

		return { sIndices, sPositions, sColor }
	}, [data, pixels, width])

    useFrame(( {clock} ) => {
		instanceMeshRef.current.material.uniforms.uTime.value = clock.elapsedTime
	})

    useLayoutEffect(() => {
        camera.fov = Math.atan((width/2)/100) * 2 * (180/Math.PI)
        camera.updateProjectionMatrix()

        instanceMeshRef.current.material.uniforms.uTextureSize.value = new Vector2(width, width) 
    }, [camera, width])

    useEffect(() => {
        processing ? 
            gsap.to(instanceMeshRef.current.material.uniforms.uSize, {duration: 1, value: 1.0, ease: 'elastic.out(1, 0.8)'}) :
            gsap.to(instanceMeshRef.current.material.uniforms.uSize, {duration: 1, value: 0.0, ease: 'elastic.in(1, 0.8)'})
    }, [processing])

    const uniforms = useMemo(() => ({
		uSize: { value: 0.0 },
		uTime: { value: 0.0 },
		uTextureSize: { value: [] }
	}), [])

    return(
        <instancedMesh ref={instanceMeshRef} args={[null, null, pixels]}>
            <planeBufferGeometry attach="geometry" args={[1, 1]}>
                <instancedBufferAttribute attachObject={['attributes', 'offset']} args={[sPositions, 3, false]} />
                <instancedBufferAttribute attachObject={['attributes', 'index']} args={[sIndices, 1, false]} />
                <instancedBufferAttribute attachObject={['attributes', 'color']} args={[sColor, 3, false]} />
            </planeBufferGeometry>
            <shaderMaterial attach="material" uniforms={uniforms} fragmentShader={fragment} vertexShader={vertex}/>
        </instancedMesh>
    )
}

export default DataImage