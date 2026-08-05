import { ContactShadows, Environment, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { ProcessedMotion } from '../../motion/types'

type Props = { motion: ProcessedMotion; resetSignal: number; onProgress: (value: number) => void }
type Wall = { x: number; y: number; width: number; height: number }

const boardSize = 8
const mazeColumns = 9
const mazeRows = 9
const mazeInset = .06
const mazeWidth = (1 - mazeInset * 2) / mazeColumns
const mazeHeight = (1 - mazeInset * 2) / mazeRows
const mazeStart = { x: mazeInset + mazeWidth / 2, y: mazeInset + mazeHeight * (mazeRows - .5) }
const mazeExit = { x: mazeInset + mazeWidth * (mazeColumns - .5), y: mazeInset + mazeHeight / 2 }

function createMazeWalls(): Wall[] {
  const cells = Array.from({ length: mazeRows }, () => Array.from({ length: mazeColumns }, () => ({ top: true, right: true, bottom: true, left: true, visited: false })))
  let seed = 2417
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  const stack: Array<[number, number]> = [[0, mazeRows - 1]]
  cells[mazeRows - 1][0].visited = true
  const directions = [{ dx: 0, dy: -1, wall: 'top', opposite: 'bottom' }, { dx: 1, dy: 0, wall: 'right', opposite: 'left' }, { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' }, { dx: -1, dy: 0, wall: 'left', opposite: 'right' }] as const
  while (stack.length) {
    const [column, row] = stack[stack.length - 1]
    const choices = directions.filter(direction => { const nextColumn = column + direction.dx; const nextRow = row + direction.dy; return nextColumn >= 0 && nextColumn < mazeColumns && nextRow >= 0 && nextRow < mazeRows && !cells[nextRow][nextColumn].visited })
    if (!choices.length) { stack.pop(); continue }
    const direction = choices[Math.floor(random() * choices.length)]
    const nextColumn = column + direction.dx; const nextRow = row + direction.dy
    cells[row][column][direction.wall] = false; cells[nextRow][nextColumn][direction.opposite] = false; cells[nextRow][nextColumn].visited = true; stack.push([nextColumn, nextRow])
  }
  const thickness = .014
  const result: Wall[] = []
  cells.forEach((row, rowIndex) => row.forEach((cell, columnIndex) => {
    const x = mazeInset + columnIndex * mazeWidth; const y = mazeInset + rowIndex * mazeHeight
    if (cell.top) result.push({ x, y: y - thickness / 2, width: mazeWidth + thickness, height: thickness })
    if (cell.left) result.push({ x: x - thickness / 2, y, width: thickness, height: mazeHeight + thickness })
    if (rowIndex === mazeRows - 1 && cell.bottom) result.push({ x, y: y + mazeHeight - thickness / 2, width: mazeWidth + thickness, height: thickness })
    if (columnIndex === mazeColumns - 1 && cell.right) result.push({ x: x + mazeWidth - thickness / 2, y, width: thickness, height: mazeHeight + thickness })
  }))
  return result
}

const walls = createMazeWalls()
const touchesWall = (x: number, y: number, radius: number) => walls.some(wall => { const nearX = Math.max(wall.x, Math.min(x, wall.x + wall.width)); const nearY = Math.max(wall.y, Math.min(y, wall.y + wall.height)); return Math.hypot(x - nearX, y - nearY) < radius })
const toBoard = (value: number) => (value - .5) * boardSize

function MazeWalls() { return <>{walls.map((wall, index) => <mesh key={index} position={[toBoard(wall.x + wall.width / 2), .35, toBoard(wall.y + wall.height / 2)]} castShadow receiveShadow><boxGeometry args={[wall.width * boardSize, .62, wall.height * boardSize]} /><meshStandardMaterial color="#98613d" roughness={.58} metalness={.05} /></mesh>)}</> }

function MazeScene({ motion, resetSignal, onProgress }: Props) {
  const motionRef = useRef(motion); const resetRef = useRef(resetSignal); const mazeRef = useRef<THREE.Group>(null); const ballRef = useRef<THREE.Mesh>(null); const haloRef = useRef<THREE.Mesh>(null); const exitRef = useRef<THREE.Mesh>(null); const game = useRef({ x: mazeStart.x, y: mazeStart.y, vx: 0, vy: 0, completed: false, reset: resetSignal })
  motionRef.current = motion; resetRef.current = resetSignal
  useEffect(() => () => onProgress(0), [onProgress])
  useFrame((state, delta) => {
    const current = game.current; const input = motionRef.current
    if (mazeRef.current) { mazeRef.current.rotation.z = THREE.MathUtils.damp(mazeRef.current.rotation.z, -input.normalizedRoll * .18, 3.4, delta); mazeRef.current.rotation.x = THREE.MathUtils.damp(mazeRef.current.rotation.x, input.normalizedPitch * .15, 3.4, delta) }
    if (current.reset !== resetRef.current) { Object.assign(current, { x: mazeStart.x, y: mazeStart.y, vx: 0, vy: 0, completed: false, reset: resetRef.current }); onProgress(0) }
    if (!current.completed) { const step = Math.min(.04, delta); current.vx += input.normalizedRoll * 1.75 * step; current.vy += input.normalizedPitch * 2.15 * step; current.vx *= Math.pow(.12, step); current.vy *= Math.pow(.12, step); const radius = .027; const nextX = Math.max(.055, Math.min(.945, current.x + current.vx * step)); if (!touchesWall(nextX, current.y, radius)) current.x = nextX; else current.vx *= -.28; const nextY = Math.max(.055, Math.min(.945, current.y + current.vy * step)); if (!touchesWall(current.x, nextY, radius)) current.y = nextY; else current.vy *= -.28; if (Math.hypot(current.x - mazeExit.x, current.y - mazeExit.y) < .058) { current.completed = true; onProgress(1) } }
    if (ballRef.current) { ballRef.current.position.set(toBoard(current.x), .42, toBoard(current.y)); ballRef.current.rotation.x += current.vy * .18; ballRef.current.rotation.z -= current.vx * .18 }
    if (haloRef.current) { haloRef.current.position.set(toBoard(current.x), .06, toBoard(current.y)); haloRef.current.scale.setScalar(1 + input.energy * .45) }
    if (exitRef.current) { exitRef.current.rotation.z = state.clock.elapsedTime * .7; exitRef.current.scale.setScalar(current.completed ? 1.25 : 1 + Math.sin(state.clock.elapsedTime * 2.3) * .08) }
  })
  const exitX = toBoard(mazeExit.x); const exitZ = toBoard(mazeExit.y)
  return <><color attach="background" args={['#061025']} /><ambientLight intensity={.58} /><directionalLight position={[5, 8, 4]} intensity={4.2} castShadow shadow-mapSize={[1024, 1024]} /><pointLight position={[exitX, 1.4, exitZ]} intensity={9} distance={3.3} color="#70f6ff" /><group ref={mazeRef}><mesh position={[0, -.14, 0]} receiveShadow><boxGeometry args={[8.8, .28, 8.8]} /><meshStandardMaterial color="#573d31" roughness={.68} /></mesh><mesh position={[0, .03, 0]} receiveShadow><boxGeometry args={[8.14, .08, 8.14]} /><meshStandardMaterial color="#bd7d4f" roughness={.53} metalness={.03} /></mesh><MazeWalls /><mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.22, .31, 36]} /><meshBasicMaterial color="#50dfff" transparent opacity={.25} /></mesh><mesh ref={ballRef} castShadow><sphereGeometry args={[.22, 32, 32]} /><meshPhysicalMaterial color="#eafcff" emissive="#39bfff" emissiveIntensity={.45} metalness={.38} roughness={.12} clearcoat={1} /></mesh><group position={[exitX, .1, exitZ]}><mesh ref={exitRef} rotation={[-Math.PI / 2, 0, 0]}><torusGeometry args={[.27, .045, 16, 48]} /><meshStandardMaterial color="#8effe0" emissive="#33d7b5" emissiveIntensity={1.3} /></mesh><mesh rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[.17, 32]} /><meshBasicMaterial color="#0f3c53" /></mesh></group></group><ContactShadows position={[0, -.27, 0]} opacity={.45} scale={13} blur={2.4} far={5} /><Environment preset="warehouse" /><OrbitControls target={[0, 0, 0]} enablePan={false} enableZoom={false} minPolarAngle={.72} maxPolarAngle={.72} minAzimuthAngle={-.35} maxAzimuthAngle={.35} /></>
}

export function BalanceBoard(props: Props) { return <div className="balance-board" role="img" aria-label="A three-dimensional motion-controlled maze with raised walls, a glowing ball, start and exit."><Canvas shadows dpr={[1, 1.6]} camera={{ position: [7.4, 8.4, 8.8], fov: 42 }} gl={{ antialias: true, powerPreference: 'high-performance' }}><MazeScene {...props} /></Canvas></div> }
