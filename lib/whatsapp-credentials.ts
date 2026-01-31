/**
 * WhatsApp Credentials Helper
 * 
 * Centralizes credential management with Redis-first strategy
 * and fallback to environment variables.
 */

import { redis, isRedisAvailable } from './redis'
import { instanceDb } from './supabase-db'

const CREDENTIALS_KEY = 'settings:whatsapp:credentials'

export interface WhatsAppCredentials {
  phoneNumberId: string
  businessAccountId: string
  accessToken: string
  displayPhoneNumber?: string
  verifiedName?: string
}

/**
 * Get WhatsApp credentials from Database (specific instance), Redis (primary global) or env vars (fallback)
 * 
 * Priority:
 * 1. If instanceId provided: Fetch from `instances` table
 * 2. If no instanceId: Redis (primary global)
 * 3. Fallback: Environment variables
 * 
 * @returns Credentials or null if not configured
 */
export async function getWhatsAppCredentials(instanceId?: string): Promise<WhatsAppCredentials | null> {
  // 1. Try specific instance if ID provided
  if (instanceId) {
    try {
      const instance = await instanceDb.getById(instanceId)
      if (instance && instance.phoneNumberId && instance.accessToken) {
        return {
          phoneNumberId: instance.phoneNumberId as string,
          businessAccountId: instance.businessAccountId as string,
          accessToken: instance.accessToken as string,
        }
      }
    } catch (error) {
      console.error(`Error fetching instance ${instanceId} credentials:`, error)
    }
  }

  // 2. Try Redis global settings
  if (isRedisAvailable() && redis) {
    try {
      const stored = await redis.get(CREDENTIALS_KEY)
      if (stored) {
        const credentials = typeof stored === 'string' ? JSON.parse(stored) : stored
        if (credentials.phoneNumberId && credentials.accessToken) {
          return {
            phoneNumberId: credentials.phoneNumberId,
            businessAccountId: credentials.businessAccountId,
            accessToken: credentials.accessToken,
            displayPhoneNumber: credentials.displayPhoneNumber,
            verifiedName: credentials.verifiedName,
          }
        }
      }
    } catch (error) {
      console.error('Error reading credentials from Redis:', error)
    }
  }

  // 3. Fallback to env vars
  const phoneNumberId = process.env.WHATSAPP_PHONE_ID
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
  const accessToken = process.env.WHATSAPP_TOKEN

  if (phoneNumberId && businessAccountId && accessToken) {
    return {
      phoneNumberId,
      businessAccountId,
      accessToken,
    }
  }

  // Not configured
  return null
}

/**
 * Check if WhatsApp is configured (either for an instance, in Redis or env vars)
 */
export async function isWhatsAppConfigured(instanceId?: string): Promise<boolean> {
  const credentials = await getWhatsAppCredentials(instanceId)
  return credentials !== null
}

/**
 * Get credentials source (for debugging/UI)
 */
export async function getCredentialsSource(instanceId?: string): Promise<'database' | 'redis' | 'env' | 'none'> {
  if (instanceId) {
    const instance = await instanceDb.getById(instanceId)
    if (instance && instance.phoneNumberId) return 'database'
  }

  // Check Redis first
  if (isRedisAvailable() && redis) {
    try {
      const stored = await redis.get(CREDENTIALS_KEY)
      if (stored) {
        const credentials = typeof stored === 'string' ? JSON.parse(stored) : stored
        if (credentials.phoneNumberId && credentials.accessToken) {
          return 'redis'
        }
      }
    } catch {
      // Fall through to env check
    }
  }

  // Check env vars
  if (process.env.WHATSAPP_PHONE_ID && process.env.WHATSAPP_TOKEN) {
    return 'env'
  }

  return 'none'
}
