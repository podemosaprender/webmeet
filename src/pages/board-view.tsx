import { BoardControls } from "../components/board-controls"
import * as THREE from 'three';
import { SVGRenderer } from 'three/examples/jsm/Addons.js';
import { useEffect, useRef, MutableRefObject } from 'react';
import { BoardType, BoardElement } from "../types/content";
import { callMgr } from "../services/call";

let currentBoard: BoardType | null = null;

function start3DScene(renderElement: HTMLElement) {

    if (currentBoard) return currentBoard;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, renderElement.clientWidth/renderElement.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(renderElement.clientWidth, renderElement.clientHeight);
    camera.position.z = 5;

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }

    function windowResize() {
        renderer.setSize(renderElement.clientWidth, renderElement.clientHeight);
        camera.aspect = renderElement.clientWidth / renderElement.clientHeight;
        camera.updateProjectionMatrix();
    }

    window.addEventListener('resize', windowResize)
    animate();

    renderElement.appendChild(renderer.domElement);

    return {scene, camera, renderer} as BoardType;
}


function boardAddElement(board: BoardType | null, element: BoardElement) {
    board = board ? board : currentBoard as BoardType;

    switch(element.data.name) {
        case 'cube':

            const geometry = new THREE.BoxGeometry( element.data.width, element.data.height, 1);
            const material = new THREE.MeshBasicMaterial( { color: element.data.color } );
            const cube = new THREE.Mesh( geometry, material );
            cube.position.x = element.data.x;
            cube.position.y = element.data.y;
            cube.position.z = element.data.z;
            console.log(board);
            board.scene!.add( cube );
        break;
    }
}

function boardAction(board: BoardType | null, action: string, element: BoardElement) {
    board = board ? board : currentBoard;

    switch(action) {
        case 'add':
            boardAddElement(board, element);
        break;
    }
}

export function BoardView() {

    const refContainer: MutableRefObject<HTMLDivElement | null> = useRef(null);

    const onBoardCommand= (cmd: string) => {
        switch(cmd) {
            case 'cube':
                let element: BoardElement = {
                    id: 1, //XXX: auto increment
                    data: {
                        name: 'cube',
                        x: (Math.random()-0.5)*5.0,
                        y: (Math.random()-0.5)*5.0,
                        z: (Math.random()-0.5)*5.0,
                        width: 0.5+Math.random()*2.0,
                        height: 0.5+Math.random()*2.0,
                        color: new THREE.Color(Math.random(), Math.random(), Math.random())
                    }
                };
                console.log("ADDING CUBE");
//                callMgr.sendToAll({t:'draw', elem:element});
                boardAddElement(currentBoard, element);
            break;
        }
    }

    useEffect(() => {
        currentBoard = start3DScene(refContainer.current as HTMLElement)
//        callMgr.on('draw', (element: BoardElement) => {
//            boardAddElement(currentBoard, element);
//       });
    }, []);

    return (
        <>
            <div className="h-full">
                <div className="flex flex-row text-center p-3 font-bold h-full">
                    <div className="h-full w-full" ref={refContainer}>
                        
                    </div>
                </div>
            </div>
            <BoardControls onCommand={onBoardCommand}></BoardControls>
        </>
    )
}
