import { BoardControls } from "../components/board-controls"
import { Canvas } from "@react-three/fiber";
import Polyhedron from "../components/r3f/polyhedron";
import * as THREE from 'three';
import { OrbitControls, Stats } from "@react-three/drei";

export function BoardView() {
    const polyhedron = [
        new THREE.BoxGeometry(),
        new THREE.SphereGeometry(0.785398),
        new THREE.DodecahedronGeometry(0.785398)
    ];

    return (
        <>
            <div className="h-full">
                <div className="flex flex-row text-center p-3 font-bold h-full">
                    <div className="h-full w-full">
                    <Canvas camera={{ position: [0, 0, 3] }}>
                        <Polyhedron position={[-0.75, -0.75, 0]} polyhedron={polyhedron} />
                        <Polyhedron position={[0.75, -0.75, 0]} polyhedron={polyhedron} />
                        <Polyhedron position={[-0.75, 0.75, 0]} polyhedron={polyhedron} />
                        <Polyhedron position={[0.75, 0.75, 0]} polyhedron={polyhedron} />
                        <OrbitControls
                          minAzimuthAngle={-Math.PI / 4}
                          maxAzimuthAngle={Math.PI / 4}
                          minPolarAngle={Math.PI / 6}
                          maxPolarAngle={Math.PI - Math.PI / 6}
                        />
                        <Stats />
                    </Canvas>
                    </div>
                </div>
            </div>
            <BoardControls onCommand={() => {}}></BoardControls>
        </>
    )
}
