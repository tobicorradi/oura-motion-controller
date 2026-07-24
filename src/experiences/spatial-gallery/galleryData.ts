export type GalleryCard = { id: string; index: string; title: string; category: string; description: string; x: number; y: number; visual: string; meta: string }

export const galleryCards: GalleryCard[] = [
  { id: 'motion-synth', index: '01', title: 'Motion Synth', category: 'Sound study', description: 'An instrument shaped by quiet, directional movement.', x: -390, y: -270, visual: 'ripple', meta: 'C3 — E4' },
  { id: 'kinetic-type', index: '02', title: 'Kinetic Type', category: 'Editorial system', description: 'Typography that finds a rhythm through motion.', x: 0, y: -270, visual: 'type', meta: 'Variable' },
  { id: 'ambient-ui', index: '03', title: 'Ambient UI', category: 'Interface study', description: 'A softer surface for low-attention moments.', x: 390, y: -270, visual: 'glow', meta: 'Quiet mode' },
  { id: 'light-field', index: '04', title: 'Light Field', category: 'Spatial system', description: 'A shifting field of restrained, responsive illumination.', x: -390, y: 0, visual: 'field', meta: '02:36' },
  { id: 'digital-matter', index: '05', title: 'Digital Matter', category: 'Material study', description: 'Objects with a tangible sense of weight, depth, and pause.', x: 0, y: 0, visual: 'matter', meta: 'Titanium' },
  { id: 'neural-garden', index: '06', title: 'Neural Garden', category: 'Generative space', description: 'An organic collection that grows from a single signal.', x: 390, y: 0, visual: 'garden', meta: 'Cultivated' },
  { id: 'spatial-audio', index: '07', title: 'Spatial Audio', category: 'Sound study', description: 'Sound arranged as a place to gently move through.', x: -390, y: 270, visual: 'audio', meta: '8 channels' },
  { id: 'future-objects', index: '08', title: 'Future Objects', category: 'Product language', description: 'Small objects that ask for less and return more.', x: 0, y: 270, visual: 'object', meta: 'Series 01' },
  { id: 'gravity-canvas', index: '09', title: 'Gravity Canvas', category: 'Motion study', description: 'A canvas where form settles toward a living center.', x: 390, y: 270, visual: 'canvas', meta: '9 bodies' },
]
