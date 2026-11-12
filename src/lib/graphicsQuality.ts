/** Local-only visual preference. Never part of AI plans, scramble data or race results. */
export type GraphicsQuality = 'low' | 'medium' | 'high'

export const GRAPHICS_OPTIONS: readonly {
  value: GraphicsQuality
  title: string
  detail: string
  recommendation: string
}[] = [
  { value: 'low', title: 'Low', detail: 'Sticker colors update between moves. No physical turns. Fastest and lightest option.', recommendation: 'Best performance' },
  { value: 'medium', title: 'Medium', detail: 'One smooth physical cube with real 3D turns and lighter rendering. Best for most phones.', recommendation: 'Balanced' },
  { value: 'high', title: 'High', detail: 'Full detailed pieces, richer depth, and the highest visual quality for desktop and stronger devices.', recommendation: 'Best visuals' },
]

export function graphicsQuality(value: unknown): GraphicsQuality {
  return value === 'low' || value === 'medium' || value === 'high' ? value : 'high'
}
