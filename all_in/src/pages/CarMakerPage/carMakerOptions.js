export const CUSTOM_BRAND_VALUE = '__custom__'

export const BRAND_OPTIONS = [
  { value: 'Tesla', label: 'Tesla' },
  { value: 'Lamborghini', label: 'Lamborghini' },
  { value: 'Porsche', label: 'Porsche' },
  { value: 'Mercedes-Benz', label: 'Mercedes-Benz' },
  { value: 'Bugatti', label: 'Bugatti' },
  { value: 'Aston Martin', label: 'Aston Martin' },
  { value: 'Pagani', label: 'Pagani' },
  { value: CUSTOM_BRAND_VALUE, label: 'Custom (follow your prompt)' },
]

export const BODY_STYLE_OPTIONS = [
  { value: 'sleek two-door coupe', label: 'Coupe' },
  { value: 'low-slung roadster', label: 'Roadster' },
  { value: 'wide-body hypercar', label: 'Hypercar' },
  { value: 'muscular grand tourer', label: 'Grand tourer' },
  { value: 'futuristic concept car', label: 'Concept' },
  { value: 'lifted adventure rig', label: 'Adventure rig' },
]

export const CAR_TYPE_OPTIONS = [
  { value: 'production supercar', label: 'Production supercar' },
  { value: 'bespoke concept car', label: 'Concept showpiece' },
  { value: 'vintage-inspired restomod', label: 'Restomod classic' },
  { value: 'electric performance car', label: 'Electric performance' },
  { value: 'off-road performance build', label: 'Off-road performance' },
]

export const FINISH_OPTIONS = [
  { value: 'mirror-gloss paint with crisp reflections', label: 'Mirror gloss' },
  { value: 'satin paint with velvety highlights', label: 'Satin finish' },
  { value: 'matte paint with soft diffused reflections', label: 'Matte finish' },
  { value: 'color-shifting pearlescent paint', label: 'Pearlescent' },
]

export const VIEWPOINT_OPTIONS = [
  { value: 'dramatic three-quarter front view', label: '3/4 front' },
  { value: 'side profile stance shot', label: 'Side profile' },
  { value: 'low angle hero shot', label: 'Low angle hero' },
  { value: 'rear three-quarter tracking shot', label: '3/4 rear' },
  { value: 'top-down showcase of the silhouette', label: 'Top-down' },
]

export const SCENERY_OPTIONS = [
  { value: 'set against a misty mountain landscape', label: 'Mountain landscape' },
  { value: 'coasting beside a neon-lit city center', label: 'City center' },
  { value: 'parked on a coastal seascape overlook', label: 'Seascape overlook' },
  { value: 'charging within a futuristic studio environment', label: 'Futuristic studio' },
  { value: 'sprinting across a desert salt flat', label: 'Desert salt flat' },
]

export const LIGHTING_OPTIONS = [
  { value: 'glowing golden hour lighting with long highlights', label: 'Golden hour' },
  { value: 'moody cinematic lighting with crisp rim lights', label: 'Cinematic' },
  { value: 'soft diffused studio lighting with controlled reflections', label: 'Soft studio' },
  { value: 'nocturnal lighting with neon accents and reflections', label: 'Neon night' },
  { value: 'clear daylight with sharp contrast and defined shadows', label: 'Clear daylight' },
]

export const DETAIL_INTENSITY_OPTIONS = [
  { value: 'subtle', label: 'Subtle' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'bold', label: 'Bold' },
]

export const DETAIL_OPTIONS = [
  { id: 'aero-kit', label: 'Aerodynamic body kit', description: 'splitters, diffusers, and side skirts' },
  { id: 'light-trail', label: 'Motion light trails', description: 'streaks implying speed' },
  { id: 'door-style', label: 'Signature doors open', description: 'gullwing or scissor doors raised' },
  { id: 'wheel-glow', label: 'Illuminated wheel accents', description: 'glowing rims or brake calipers' },
  { id: 'graphic', label: 'Custom livery graphics', description: 'stripes, numbers, or sponsor decals' },
  { id: 'environmental-effects', label: 'Environmental effects', description: 'mist, dust, or water spray' },
]
