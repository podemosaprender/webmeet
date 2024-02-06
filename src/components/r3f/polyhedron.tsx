import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh } from 'three'

interface PolyhedronProps {
    position: any;
    polyhedron: any;
    color: any;
}
export default function Polyhedron({ position, polyhedron, color }: PolyhedronProps) {
    const ref = useRef<Mesh>(null!);
    const [count, setCount] = useState<number>(0)

    useFrame((_, delta) => {
        ref.current.rotation.x += delta
        ref.current.rotation.y += 0.5 * delta
    })

    useEffect(() => {
        console.log(color);
    }, []);

    return (
        <mesh
            position={position}
            ref={ref}
            onPointerDown={() => {
                setCount((count + 1) % 3)
            }}
            geometry={polyhedron[count]}
        >
            <meshBasicMaterial color={`rgb(${color.r}, ${color.g}, ${color.b})`} wireframe />
        </mesh>
    )
}