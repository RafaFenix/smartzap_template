/**
 * Conversation Service
 * 
 * Client-side service for conversation API operations
 */

import type { BotConversation, BotMessage } from '@/types'

const BASE_URL = '/api/conversations'

// =============================================================================
// Types
// =============================================================================

export interface ConversationListResponse {
  conversations: (BotConversation & { botName: string })[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface ConversationDetailResponse {
  conversation: BotConversation & { botName: string }
  messages: BotMessage[]
  variables: Record<string, string>
}

export interface ConversationListParams {
  instanceId?: string
  status?: 'active' | 'paused' | 'ended'
  botId?: string
  limit?: number
  offset?: number
}

// =============================================================================
// API Functions
// =============================================================================

export const conversationService = {
  /**
   * Lista conversas com filtros e paginação
   */
  getConversations: async (
    params: ConversationListParams = {}
  ): Promise<ConversationListResponse> => {
    const searchParams = new URLSearchParams()

    if (params.instanceId) searchParams.set('instanceId', params.instanceId)
    if (params.status) searchParams.set('status', params.status)
    if (params.botId) searchParams.set('botId', params.botId)
    if (params.limit) searchParams.set('limit', params.limit.toString())
    if (params.offset) searchParams.set('offset', params.offset.toString())

    const url = `${BASE_URL}?${searchParams.toString()}`
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao listar conversas')
    }

    return response.json()
  },

  /**
   * Obtém detalhes de uma conversa específica
   */
  getConversation: async (id: string, instanceId?: string): Promise<ConversationDetailResponse> => {
    const url = instanceId ? `${BASE_URL}/${id}?instanceId=${instanceId}` : `${BASE_URL}/${id}`
    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao buscar conversa')
    }

    return response.json()
  },

  /**
   * Assume o atendimento de uma conversa (pausa o bot)
   */
  takeoverConversation: async (
    id: string,
    agentName?: string,
    instanceId?: string
  ): Promise<{ success: boolean; conversationId: string; status: string }> => {
    const url = instanceId ? `${BASE_URL}/${id}/takeover?instanceId=${instanceId}` : `${BASE_URL}/${id}/takeover`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentName }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao assumir conversa')
    }

    return response.json()
  },

  /**
   * Devolve a conversa para o bot
   */
  releaseConversation: async (
    id: string,
    instanceId?: string
  ): Promise<{ success: boolean; conversationId: string; status: string }> => {
    const url = instanceId ? `${BASE_URL}/${id}/release?instanceId=${instanceId}` : `${BASE_URL}/${id}/release`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao devolver conversa')
    }

    return response.json()
  },

  /**
   * Envia mensagem manual para uma conversa em atendimento humano
   */
  sendMessage: async (
    conversationId: string,
    text: string,
    instanceId?: string
  ): Promise<{ success: boolean; message: BotMessage; waMessageId?: string }> => {
    const url = instanceId
      ? `${BASE_URL}/${conversationId}/messages?instanceId=${instanceId}`
      : `${BASE_URL}/${conversationId}/messages`

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao enviar mensagem')
    }

    return response.json()
  },

  /**
   * Encerra uma conversa
   */
  endConversation: async (
    id: string,
    instanceId?: string
  ): Promise<{ success: boolean; conversationId: string; status: string }> => {
    const url = instanceId ? `${BASE_URL}/${id}/end?instanceId=${instanceId}` : `${BASE_URL}/${id}/end`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao encerrar conversa')
    }

    return response.json()
  },

  /**
   * Obtém variáveis de uma conversa
   */
  getConversationVariables: async (
    conversationId: string,
    instanceId?: string
  ): Promise<{ conversationId: string; variables: Record<string, string> }> => {
    const url = instanceId
      ? `${BASE_URL}/${conversationId}/variables?instanceId=${instanceId}`
      : `${BASE_URL}/${conversationId}/variables`

    const response = await fetch(url)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao buscar variáveis')
    }

    return response.json()
  },

  /**
   * Atualiza variáveis de uma conversa
   */
  updateConversationVariables: async (
    conversationId: string,
    variables: Record<string, string>,
    deleteKeys?: string[],
    instanceId?: string
  ): Promise<{ conversationId: string; variables: Record<string, string>; success: boolean }> => {
    const url = instanceId
      ? `${BASE_URL}/${conversationId}/variables?instanceId=${instanceId}`
      : `${BASE_URL}/${conversationId}/variables`

    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variables, deleteKeys }),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error || 'Erro ao atualizar variáveis')
    }

    return response.json()
  }
}
