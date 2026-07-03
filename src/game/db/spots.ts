import type { SpotDef } from '../types'

/**
 * 钓场数据库 — 8 个中国沿海真实钓场
 * 从北到南：渤海 → 黄海 → 东海 → 南海
 */
export const SPOTS: SpotDef[] = [
  {
    id: 'spot_001', name: '长海县', region: '渤海', province: '辽宁',
    unlockLevel: 1, entryFee: 0,
    fish: ['fish_001','fish_002','fish_003','fish_004','fish_005','fish_006','fish_007','fish_008','fish_009','fish_010','fish_011','fish_012','fish_013','fish_014','fish_015','fish_016','fish_017','fish_018','fish_019','fish_020','fish_021','fish_022','fish_023','fish_024','fish_025'],
    waterColor: '#8B9A6E', bgUrl: '/spots/spot_001_new.png', depthRange: [5, 25],
    description: '辽东半岛东南海岛县，渤海湾天然渔场。水质肥沃，海底平坦，新手理想起点。',
  },
  {
    id: 'spot_002', name: '东港市', region: '渤海', province: '辽宁',
    unlockLevel: 1, entryFee: 50,
    fish: ['fish_010','fish_011','fish_012','fish_013','fish_014','fish_015','fish_016','fish_017','fish_018','fish_019','fish_020','fish_021','fish_022','fish_023','fish_024','fish_025','fish_026','fish_027','fish_028','fish_029','fish_030','fish_031','fish_032','fish_033','fish_034','fish_035'],
    waterColor: '#7A8B6A', bgUrl: '/spots/spot_002.webp', depthRange: [8, 30],
    description: '鸭绿江入海口，咸淡水交汇，饵料丰富。鲈鱼、鲅鱼等洄游性鱼类闻名。',
  },
  {
    id: 'spot_003', name: '长岛', region: '黄海', province: '山东',
    unlockLevel: 1, entryFee: 100,
    fish: ['fish_020','fish_021','fish_022','fish_023','fish_024','fish_025','fish_026','fish_027','fish_028','fish_029','fish_030','fish_031','fish_032','fish_033','fish_034','fish_035','fish_036','fish_037','fish_038','fish_039','fish_040','fish_041','fish_042','fish_043','fish_044','fish_045'],
    waterColor: '#6B8E6B', bgUrl: '/spots/spot_003.webp', depthRange: [10, 40],
    description: '32个岛屿组成的群岛，礁石密布、水流湍急，真鲷、黑鲷等底栖鱼绝佳钓场。',
  },
  {
    id: 'spot_004', name: '青岛近海', region: '黄海', province: '山东',
    unlockLevel: 1, entryFee: 200,
    fish: ['fish_030','fish_031','fish_032','fish_033','fish_034','fish_035','fish_036','fish_037','fish_038','fish_039','fish_040','fish_041','fish_042','fish_043','fish_044','fish_045','fish_046','fish_047','fish_048','fish_049','fish_050','fish_051','fish_052','fish_053','fish_054','fish_055'],
    waterColor: '#5A7B5A', bgUrl: '/spots/spot_004.webp', depthRange: [10, 45],
    description: '山东半岛南岸海滨城市，近海岩礁和人工鱼礁众多，黄海综合性钓场。',
  },
  {
    id: 'spot_005', name: '崇明区', region: '东海', province: '上海',
    unlockLevel: 1, entryFee: 150,
    fish: ['fish_040','fish_041','fish_042','fish_043','fish_044','fish_045','fish_046','fish_047','fish_048','fish_049','fish_050','fish_051','fish_052','fish_053','fish_054','fish_055','fish_056','fish_057','fish_058','fish_059','fish_060','fish_061','fish_062','fish_063','fish_064','fish_065'],
    waterColor: '#3B7A9E', bgUrl: '/spots/spot_005.webp', depthRange: [5, 20],
    description: '长江入海口冲积岛，咸淡水交汇独特生态，鲻鱼、梭鱼等河口鱼类为主。',
  },
  {
    id: 'spot_006', name: '舟山渔场', region: '东海', province: '浙江',
    unlockLevel: 1, entryFee: 300,
    fish: ['fish_045','fish_046','fish_047','fish_048','fish_049','fish_050','fish_051','fish_052','fish_053','fish_054','fish_055','fish_056','fish_057','fish_058','fish_059','fish_060','fish_061','fish_062','fish_063','fish_064','fish_065','fish_066','fish_067','fish_068','fish_069','fish_070','fish_071','fish_072','fish_073','fish_074','fish_075'],
    waterColor: '#4A8BA8', bgUrl: '/spots/spot_006.webp', depthRange: [15, 80],
    description: '中国最大渔场，东海鱼仓。鱼类资源极其丰富，钓鱼爱好者的天堂。',
  },
  {
    id: 'spot_007', name: '南澳县', region: '南海', province: '广东',
    unlockLevel: 1, entryFee: 500,
    fish: ['fish_060','fish_061','fish_062','fish_063','fish_064','fish_065','fish_066','fish_067','fish_068','fish_069','fish_070','fish_071','fish_072','fish_073','fish_074','fish_075','fish_076','fish_077','fish_078','fish_079','fish_080','fish_081','fish_082','fish_083','fish_084','fish_085'],
    waterColor: '#1B5A8E', bgUrl: '/spots/spot_007.webp', depthRange: [10, 60],
    description: '广东唯一海岛县，珊瑚礁和岩礁生态丰富，华南矶钓圣地。',
  },
  {
    id: 'spot_008', name: '三亚远海', region: '南海', province: '海南',
    unlockLevel: 1, entryFee: 0,
    fish: ['fish_075','fish_076','fish_077','fish_078','fish_079','fish_080','fish_081','fish_082','fish_083','fish_084','fish_085','fish_086','fish_087','fish_088','fish_089','fish_090','fish_091','fish_092','fish_093','fish_094','fish_095','fish_096','fish_097','fish_098','fish_099','fish_100'],
    waterColor: '#0D4A7E', bgUrl: '/spots/spot_008.webp', depthRange: [30, 200],
    description: '三亚外海深海水域，金枪鱼、马林鱼等大型鱼类，深海巨物终极钓场。',
  },
]
