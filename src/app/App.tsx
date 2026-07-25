import { AnimatePresence } from 'framer-motion'
import { Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from '../pages/HomePage'
import { ProductViewerPage } from '../experiences/product-viewer/ProductViewerPage'
import { MotionSynthesizerPage } from '../experiences/motion-synthesizer/MotionSynthesizerPage'
import { SpatialGalleryPage } from '../experiences/spatial-gallery/SpatialGalleryPage'
import { MotionVisualizerPage } from '../experiences/motion-visualizer/MotionVisualizerPage'
import { KineticFieldPage } from '../experiences/kinetic-field/KineticFieldPage'
export function App() { const location = useLocation(); return <AnimatePresence mode="wait"><Routes location={location} key={location.pathname}><Route path="/" element={<HomePage />} /><Route path="/orbital-balance" element={<SpatialGalleryPage />} /><Route path="/spatial-gallery" element={<SpatialGalleryPage />} /><Route path="/motion-synthesizer" element={<MotionSynthesizerPage />} /><Route path="/product-viewer" element={<ProductViewerPage />} /><Route path="/motion-visualizer" element={<MotionVisualizerPage />} /><Route path="/kinetic-field" element={<KineticFieldPage />} /></Routes></AnimatePresence> }
