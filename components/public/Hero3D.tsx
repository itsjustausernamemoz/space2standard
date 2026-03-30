'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Float, MeshDistortMaterial, MeshWobbleMaterial } from '@react-three/drei'
import { useRef, useMemo } from 'react'
import * as THREE from 'three'

function WoodPiece({ position, rotation, scale, color = '#e8d5b7' }: any) {
  const meshRef = useRef<THREE.Mesh>(null!)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    meshRef.current.rotation.x = Math.cos(t / 4) / 4 + rotation[0]
    meshRef.current.rotation.y = Math.sin(t / 4) / 4 + rotation[1]
    meshRef.current.position.y = position[1] + Math.sin(t / 2) / 10
  })

  return (
    <mesh ref={meshRef} position={position} rotation={rotation} scale={scale}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.1} />
    </mesh>
  )
}

function FloatingScene() {
  const pieces = useMemo(() => [
    { position: [-2, 0.5, 0], rotation: [0.5, 0.2, 0.1], scale: [1.2, 0.1, 0.8], color: '#c9a84c' },
    { position: [2, -0.5, 1], rotation: [-0.2, 0.5, 0.3], scale: [0.8, 1.2, 0.1], color: '#e8d5b7' },
    { position: [0.5, 1.5, -1], rotation: [0.1, 0.1, 0.5], scale: [0.4, 0.4, 0.4], color: '#16213e' },
    { position: [-1.5, -1.2, 2], rotation: [0.4, 0.4, 0.1], scale: [2, 0.05, 0.5], color: '#c9a84c' },
    { position: [1.8, 1.2, 0.5], rotation: [0.2, -0.4, -0.2], scale: [0.1, 0.6, 0.6], color: '#e8d5b7' },
  ], [])

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#c9a84c" />
      <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />

      {pieces.map((props, i) => (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} key={i}>
          <WoodPiece {...props} />
        </Float>
      ))}

      <mesh position={[0, 0, -5]} scale={10}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial color="#1a1a2e" speed={2} distort={0.2} radius={1} />
      </mesh>
    </>
  )
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <color attach="background" args={['#1a1a2e']} />
        <fog attach="fog" args={['#1a1a2e', 5, 15]} />

        <FloatingScene />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>
    </div>
  )
}
