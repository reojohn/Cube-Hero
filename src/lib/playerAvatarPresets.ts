import defaultAvatar from '../assets/player-avatars/default-cube-keeper.webp'
import defaultThumb from '../assets/player-avatars/thumbs/default-cube-keeper.webp'
import avatarEmeraldDruid from '../assets/player-avatars/emerald-druid.webp'
import avatarEmeraldDruidThumb from '../assets/player-avatars/thumbs/emerald-druid.webp'
import avatarVioletStarcube from '../assets/player-avatars/violet-starcube.webp'
import avatarVioletStarcubeThumb from '../assets/player-avatars/thumbs/violet-starcube.webp'
import avatarGoldenSunkeeper from '../assets/player-avatars/golden-sunkeeper.webp'
import avatarGoldenSunkeeperThumb from '../assets/player-avatars/thumbs/golden-sunkeeper.webp'
import avatarCobaltFrost from '../assets/player-avatars/cobalt-frost.webp'
import avatarCobaltFrostThumb from '../assets/player-avatars/thumbs/cobalt-frost.webp'
import avatarCrimsonRogue from '../assets/player-avatars/crimson-rogue.webp'
import avatarCrimsonRogueThumb from '../assets/player-avatars/thumbs/crimson-rogue.webp'
import avatarNeonGuardian from '../assets/player-avatars/neon-guardian.webp'
import avatarNeonGuardianThumb from '../assets/player-avatars/thumbs/neon-guardian.webp'
import avatarCosmicDreamer from '../assets/player-avatars/cosmic-dreamer.webp'
import avatarCosmicDreamerThumb from '../assets/player-avatars/thumbs/cosmic-dreamer.webp'
import avatarAmberDesert from '../assets/player-avatars/amber-desert.webp'
import avatarAmberDesertThumb from '../assets/player-avatars/thumbs/amber-desert.webp'
import avatarSilverMoonkeeper from '../assets/player-avatars/silver-moonkeeper.webp'
import avatarSilverMoonkeeperThumb from '../assets/player-avatars/thumbs/silver-moonkeeper.webp'
import avatarMossTraveler from '../assets/player-avatars/moss-traveler.webp'
import avatarMossTravelerThumb from '../assets/player-avatars/thumbs/moss-traveler.webp'

/** Lightweight, bundled player portraits. Names and IDs are stable across deployments. */
export type PlayerAvatarPreset = Readonly<{id: string; name: string; detail: string; src: string; thumb: string}>

export const DEFAULT_PLAYER_AVATAR: PlayerAvatarPreset = {id: 'default', name: 'Original Hero', detail: 'Classic CubeHero', src: defaultAvatar, thumb: defaultThumb}

export const PLAYER_AVATAR_PRESETS: readonly PlayerAvatarPreset[] = [
  {id: 'emerald-druid', name: 'Emerald Druid', detail: 'Nature · green', src: avatarEmeraldDruid, thumb: avatarEmeraldDruidThumb},
  {id: 'violet-starcube', name: 'Violet Starcube', detail: 'Arcane · purple', src: avatarVioletStarcube, thumb: avatarVioletStarcubeThumb},
  {id: 'golden-sunkeeper', name: 'Golden Sunkeeper', detail: 'Solar · gold', src: avatarGoldenSunkeeper, thumb: avatarGoldenSunkeeperThumb},
  {id: 'cobalt-frost', name: 'Cobalt Frost', detail: 'Winter · blue', src: avatarCobaltFrost, thumb: avatarCobaltFrostThumb},
  {id: 'crimson-rogue', name: 'Crimson Rogue', detail: 'Flame · red', src: avatarCrimsonRogue, thumb: avatarCrimsonRogueThumb},
  {id: 'neon-guardian', name: 'Neon Guardian', detail: 'Neon · cyan', src: avatarNeonGuardian, thumb: avatarNeonGuardianThumb},
  {id: 'cosmic-dreamer', name: 'Cosmic Dreamer', detail: 'Galaxy · pink', src: avatarCosmicDreamer, thumb: avatarCosmicDreamerThumb},
  {id: 'amber-desert', name: 'Amber Desert', detail: 'Desert · amber', src: avatarAmberDesert, thumb: avatarAmberDesertThumb},
  {id: 'silver-moonkeeper', name: 'Silver Moonkeeper', detail: 'Lunar · silver', src: avatarSilverMoonkeeper, thumb: avatarSilverMoonkeeperThumb},
  {id: 'moss-traveler', name: 'Moss Traveler', detail: 'Forest · moss', src: avatarMossTraveler, thumb: avatarMossTravelerThumb},
]

export function getPlayerAvatarPreset(id: string): PlayerAvatarPreset | undefined {
  return PLAYER_AVATAR_PRESETS.find(avatar => avatar.id === id)
}
