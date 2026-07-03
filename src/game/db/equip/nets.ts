import type { EquipDef } from '../../types'

export const NETS: EquipDef[] = [
  {
    id: 'net_001',
    name: '便携抄网',
    type: 'net',
    brand: undefined,
    power: undefined,
    rareBonus: 0,
    maxDurability: 80,
    price: 300,
    unlockLevel: 1,
    maxWeight: 10,
    desc: '铝合金伸缩柄，网口40cm，轻便易携，适合岸钓中小型鱼。',
  },
  {
    id: 'net_002',
    name: '碳合金大抄网',
    type: 'net',
    brand: undefined,
    power: undefined,
    rareBonus: 5,
    maxDurability: 150,
    price: 800,
    unlockLevel: 10,
    maxWeight: 50,
    desc: '碳素合金框架，网口60cm，承重力强，专为大物起鱼设计。',
  },
]
