import { Suspense, useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

function prepareGeometry(geometry) {
  const g = geometry
  g.computeVertexNormals()
  g.computeBoundingBox()
  const bbox = g.boundingBox
  const size = new THREE.Vector3()
  bbox.getSize(size)
  const maxDim = Math.max(size.x, size.y, size.z) || 1
  const scale = 1.8 / maxDim // Fit in view
  const center = new THREE.Vector3()
  bbox.getCenter(center)
  g.translate(-center.x, -center.y, -center.z)
  return { geometry: g, scale }
}

function ModelFromUrl({ url }) {
  const geometry = useLoader(STLLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous')
  })
  const { scale } = useMemo(() => prepareGeometry(geometry), [geometry])
  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  )
}

function ModelFromText({ text }) {
  const { geometry, scale } = useMemo(() => {
    const enc = new TextEncoder()
    const buffer = enc.encode(text).buffer
    const loader = new STLLoader()
    const geom = loader.parse(buffer)
    return prepareGeometry(geom)
  }, [text])
  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  )
}

function Lights() {
  const dirRef = useHelper(() => null)
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight ref={dirRef} position={[3, 5, 4]} intensity={0.8} castShadow />
      <directionalLight position={[-3, -2, -4]} intensity={0.3} />
    </>
  )
}

export default function STLCanvas({ source, className }) {
  return (
    <div className={className}>
      <Canvas camera={{ position: [2.8, 2.2, 2.8], fov: 50 }} shadows>
        <color attach="background" args={[0, 0, 0, 0]} />
        <Suspense fallback={null}>
          {source?.type === 'text' ? (
            <ModelFromText text={source.text} />
          ) : (
            <ModelFromUrl url={source.url} />
          )}
        </Suspense>
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 4]} intensity={0.8} castShadow />
        <directionalLight position={[-3, -2, -4]} intensity={0.3} />
        <OrbitControls enableDamping dampingFactor={0.1} />
        <gridHelper args={[10, 10, '#94a3b8', '#e2e8f0']} position={[0, -1.2, 0]} />
      </Canvas>
    </div>
  )
}
