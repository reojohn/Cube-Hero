/** Local-only visual preference. Never part of AI plans, scramble data or race results. */
export type GraphicsQuality = 'low' | 'medium' | 'high'

export const GRAPHICS_OPTIONS: readonly {
  value: GraphicsQuality
  title: string
  detail: string
  recommendation: string
}[] = [
  { value: 'low', title: 'Low', detail: 'Sticker colors update between moves. No physical turns.', recommendation: 'Best performance' },
  { value: 'medium', title: 'Medium', detail: 'Real 3D layer turns with simpler cube surfaces.', recommendation: 'Balanced' },
  { value: 'high', title: 'High', detail: 'Full detailed pieces and rotating layers, as before.', recommendation: 'Best visuals' },
]

export function graphicsQuality(value: unknown): GraphicsQuality {
  return value === 'low' || value === 'medium' || value === 'high' ? value : 'high'
}
