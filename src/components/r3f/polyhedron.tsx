import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface PolyhedronProps {
    position: any;
    polyhedron: any;
}
export default function Polyhedron({ position, polyhedron }: PolyhedronProps) {
    const ref = useRef<Mesh>(null!);
    const [count, setCount] = useState<number>(0)

    useFrame((_, delta) => {
        ref.current.rotation.x += delta
        ref.current.rotation.y += 0.5 * delta
    })

    return (
        <mesh
            position={position}
            ref={ref}
            onPointerDown={() => {
                setCount((count + 1) % 3)
            }}
            geometry={polyhedron[count]}
        >
            <meshBasicMaterial color={'lime'} wireframe />
        </mesh>
    )
}