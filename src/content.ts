import {
  BitcoinIcon,
  E2ShareIcon,
  GithubIcon,
  PlasmerIcon,
  VexWaveIcon,
} from './components/icons'

export const MARK_TEXT = 'am1v'
export const GATE_TEXT = 'enter...'
export const VIDEO_SRC = 'https://cdn.am1v.wtf/4fyxqj3e1n-fixed1.mp4'

export const SYMBOLS = [
  { name: 'GitHub', href: 'https://github.com/realChriss', Icon: GithubIcon },
  {
    name: 'Bitcoin',
    href: 'https://3xpl.com/bitcoin/address/bc1qtdcvpw5y5y5m5hy6ye05ha3a245eg9rzfdk77e',
    Icon: BitcoinIcon,
  },
]

export const PROJECTS = [
  {
    name: 'VexWave',
    blurb: 'A desktop music player for your own server',
    href: 'https://vexwave.github.io/',
    Icon: VexWaveIcon,
  },
  {
    name: 'e2share',
    blurb: 'End-to-end encrypted file sharing',
    href: 'https://e2share.net/',
    Icon: E2ShareIcon,
  },
  {
    name: 'Plasmer',
    blurb: 'A precision macro built for speed',
    href: 'https://plasmer.top/',
    Icon: PlasmerIcon,
  },
]

export type Project = (typeof PROJECTS)[number]
