import { RODS } from './rods'
import { LINES } from './lines'
import { HOOKS } from './hooks'
import { FLOATS } from './floats'
import { REELS } from './reels'
import { NETS } from './nets'
import { BAITS } from './baits'
import { CHUMS } from './chums'
import type { EquipDef, ChumDef } from '../../types'

export const EQUIP_DB: EquipDef[] = [
  ...RODS, ...LINES, ...HOOKS, ...FLOATS, ...REELS, ...NETS, ...BAITS, ...CHUMS,
]

export { RODS, LINES, HOOKS, FLOATS, REELS, NETS, BAITS, CHUMS }
export type { EquipDef, ChumDef }
