export const USDC_DECIMALS = 6;

export const USDC_ADDRESSES = {
  arc: '0x3600000000000000000000000000000000000000',
  arcTestnet: '0x3600000000000000000000000000000000000000',
  base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  baseSepolia: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
} as const;

export const CHAIN_IDS = {
  arc: 1234, // Replace with actual Arc mainnet chain ID
  arcTestnet: 5042002,
  base: 8453,
  baseSepolia: 84532,
} as const;

export const RPC_URLS = {
  arc: 'https://rpc.arc.network/',
  arcTestnet: 'https://rpc.testnet.arc.network/',
  base: 'https://mainnet.base.org',
  baseSepolia: 'https://sepolia.base.org',
} as const;

export const BLOCK_EXPLORERS = {
  arc: 'https://arcscan.app/',
  arcTestnet: 'https://testnet.arcscan.app/',
  base: 'https://basescan.org/',
  baseSepolia: 'https://sepolia.basescan.org/',
} as const;

export const STORAGE_KEYS = {
  wallet: 'arcpay_wallet',
  theme: 'arcpay_theme',
  contacts: 'arcpay_contacts',
  session: 'arcpay_session',
} as const;

export const DEFAULT_PRESET_AMOUNTS = [25, 50, 100, 250] as const;

export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;
