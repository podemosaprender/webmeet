import { BoardControls } from "../components/board-controls"
import { Canvas } from "@react-three/fiber";
import Polyhedron from "../components/r3f/polyhedron";
import * as THREE from 'three';
import { OrbitControls, Stats } from "@react-three/drei";
import { useControls } from "leva";
import { useEffect, useState } from "react";

interface MeshCustomProps {
    type: string;
    position: any;
}
export function BoardView() {
    const polyhedron = [
        new THREE.BoxGeometry(),
        new THREE.SphereGeometry(0.785398),
        new THREE.DodecahedronGeometry(0.785398)
    ];

    const [elements, setElements] = useState<{[meshID: string]: MeshCustomProps}>({});

    const onAddElement = (cmd: string) => {
        const keyName: string = `mesh-${Object.keys(elements).length}`;
        setElements({...elements, [keyName]: {
            type: cmd,
            position: [-1.0 + Math.random()*2.0, -1.0 + Math.random()*2.0, -1.0 + Math.random()*2.0]
        }});
    }

    const {grid, color} = useControls({
        grid: true,
        color: {
            r: 255,
            g: 0,
            b: 0
        }
    });

    return (
        <>
            <div className="h-full">
                <div className="flex flex-row text-center p-3 font-bold h-full">
                    <div className="h-full w-full">
                    <Canvas camera={{ position: [0, 0, 3] }}>
                        {
                            Object.keys(elements).map(meshID => (
                                <Polyhedron key={meshID} position={elements[meshID].position} polyhedron={polyhedron} color={color} />
                            ))
                        }
                        <OrbitControls
                          minAzimuthAngle={-Math.PI / 4}
                          maxAzimuthAngle={Math.PI / 4}
                          minPolarAngle={Math.PI / 6}
                          maxPolarAngle={Math.PI - Math.PI / 6}
                        />
                        <Stats />
                        {
                        grid && <axesHelper args={[5]} />
                        }
                        {
                        grid && <gridHelper />
                        }
                    </Canvas>
                    </div>
                </div>
            </div>
            <BoardControls onCommand={onAddElement}></BoardControls>
        </>
    )
}
