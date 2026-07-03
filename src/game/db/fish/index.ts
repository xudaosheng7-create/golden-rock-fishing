import type { FishDef } from "../../types"
import { BOHAI_FISH } from "./bohai"
import { HUANGHAI_FISH } from "./huanghai"
import { DONGHAI_FISH } from "./donghai"
import { NANHAI_FISH } from "./nanhai"

export const FISH_DB: FishDef[] = [
  ...BOHAI_FISH,
  ...HUANGHAI_FISH,
  ...DONGHAI_FISH,
  ...NANHAI_FISH,
]

export { BOHAI_FISH, HUANGHAI_FISH, DONGHAI_FISH, NANHAI_FISH }
