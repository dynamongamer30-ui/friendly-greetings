export interface Mod {
  id: string
  title: string
  gameName: string
  description: string
  category: string
  imageUrl: string
  downloadUrl: string
  megaUrl: string
  shortnerlink: string
  version: string
  features: string
  downloads: number
  isTrending: number
  isFeatured: number
  status: string
  virusTotalStatus: string
  virustotalUrl: string
  tags: string
  videoUrl: string
  changelog: string
  createdAt: string
  updatedAt: string
  ratingSum?: number
  ratingCount?: number
}

export interface Reply {
  id: string
  content: string
  createdAt: string
}

export interface Comment {
  id: string
  author: string
  content: string
  avatarSeed: string
  createdAt: string
  approved?: boolean
  replies?: Reply[]
}

export interface SiteMeta {
  siteName: string
  siteTagline: string
  logoUrl: string
  announcement: string
  announcementActive: number
  instagramUrl: string
  whatsappUrl: string
  telegramUrl: string
  youtubeUrl: string
}

export interface TutorialConfig {
  title: string
  videoId: string
  script: string
}

export interface SecurityConfig {
  timer: number
  minTimer: number
}

export interface DmcaRequest {
  id: string
  name: string
  email: string
  modId: string
  reason: string
  status: string
  createdAt: string
}

export interface SecureSession {
  fingerprint: string
  megaLink: string
  timestamp: number
  used: boolean
  modId: string
  modVersion: string
}

export interface RateLimitEntry {
  timestamps: number[]
}
