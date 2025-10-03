import { Suspense, useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import * as THREE from 'three'

function parseAsciiStl(text) {
  const positions = []
  const normals = []
  let nx = 0, ny = 0, nz = 1
  const numRe = /[-+]?\d*\.?\d+(?:[eE][+-]?\d+)?/g
  const lines = String(text).split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim()
    if (!l) continue
    if (l.toLowerCase().startsWith('facet normal')) {
      const nums = l.match(numRe)
      if (nums && nums.length >= 3) {
        nx = parseFloat(nums[0]); ny = parseFloat(nums[1]); nz = parseFloat(nums[2])
      }
    } else if (l.toLowerCase().startsWith('vertex')) {
      const nums = l.match(numRe)
      if (nums && nums.length >= 3) {
        const x = parseFloat(nums[0]); const y = parseFloat(nums[1]); const z = parseFloat(nums[2])
        positions.push(x, y, z)
        normals.push(nx, ny, nz)
      }
    }
  }
  // Ensure triangles (groups of 3 vertices)
  const vertCount = positions.length / 3
  const triCount = Math.floor(vertCount / 3)
  const needed = triCount * 9
  if (positions.length > needed) {
    positions.length = needed
    normals.length = triCount * 9
  }
  const geom = new THREE.BufferGeometry()
  if (positions.length === 0) return null
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  // If normals look invalid, let three compute them
  if (normals.length === positions.length) {
    geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
  }
  return geom
}

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

function proxiedUrl(url) {
  if (!/^https?:\/\//i.test(url)) {
    return url
  }
  try {
    return `/stl-proxy?url=${encodeURIComponent(url)}`
  } catch (error) {
    console.warn('Failed to encode STL proxy URL', error)
  }
  return url
}

function ModelFromUrl({ url }) {
  const src = proxiedUrl(url)
  const geometry = useLoader(STLLoader, src, (loader) => {
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
  const parsed = useMemo(() => {
    try {
      // Robust ASCII STL parsing (tolerant/fall-back)
      const geom = parseAsciiStl(text)
      if (!geom) throw new Error('No triangles parsed')
      return prepareGeometry(geom)
    } catch (e) {
      console.error('STL parse failed', e)
      return null
    }
  }, [text])
  if (!parsed) throw new Error('Invalid or incomplete STL content')
  const { geometry, scale } = parsed
  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial color="#9ca3af" metalness={0.1} roughness={0.8} />
      </mesh>
    </group>
  )
}

export default function STLCanvas({ source, className }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [2.8, 2.2, 2.8], fov: 50 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        shadows={false}
        onCreated={({ gl }) => {
          const canvas = gl.domElement
          const onLost = (e) => {
            e.preventDefault()
          }
          canvas.addEventListener('webglcontextlost', onLost, false)
        }}
      >
        <color attach="background" args={[0, 0, 0]} />
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
