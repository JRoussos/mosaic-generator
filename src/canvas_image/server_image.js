import React, { useLayoutEffect } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { TextureLoader } from 'three'

const ServerImage = ({ map }) => {
    const texture = useLoader(TextureLoader, map)
    const { camera, size } = useThree()
    
    useLayoutEffect(() => {
        camera.fov = Math.atan((size.width/2)/100) * 2 * (180/Math.PI)
        camera.updateProjectionMatrix()
        
    }, [camera, size])

    return(
        <mesh>
            <planeBufferGeometry attach="geometry" args={[size.width, size.height]}/>
            <meshBasicMaterial attach="material" map={texture}/>
        </mesh>   
    )
}

export default ServerImage