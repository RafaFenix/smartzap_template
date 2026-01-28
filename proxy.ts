import { NextRequest, NextResponse } from 'next/server'
import {
    verifyApiKey,
    verifyAdminAccess,
    isAdminEndpoint,
    isPublicEndpoint,
    unauthorizedResponse,
    forbiddenResponse
} from '@/lib/auth'

export const config = {
    matcher: [
        // Match all pages except static files and _next
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

// Routes that don't require user authentication
const PUBLIC_PAGES = ['/login', '/setup', '/debug-auth', '/settings']
const PUBLIC_API_ROUTES = ['/api/auth', '/api/webhook', '/api/health', '/api/system', '/api/setup', '/api/debug', '/api/database', '/api/campaign/workflow', '/api/account/alerts']

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // ==========================================================================
    // ☢️ TRIPLE NUCLEAR EXEMPTION - ABSOLUTE FIRST PRIORITY ☢️
    // These paths MUST NEVER be redirected, no matter what.
    // ==========================================================================
    const isExempted =
        pathname.startsWith('/settings') ||
        pathname.startsWith('/api/settings') ||
        pathname.startsWith('/api/instances') ||
        pathname.startsWith('/api/auth/status') ||
        pathname === '/login' ||
        pathname === '/login/' ||
        pathname.startsWith('/api/health')

    if (isExempted) {
        console.log(`☢️ [PROXY-EXEMPT] ALLOWING: ${pathname} | Referer: ${request.headers.get('referer') || 'Direct'}`)
        return NextResponse.next()
    }

    console.log(`🔍 [PROXY-CHECK] Processing: ${pathname} | Referer: ${request.headers.get('referer') || 'Direct'}`)

    // Allow OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
        return NextResponse.next()
    }

    // ==========================================================================
    // BOOTSTRAP CHECK - Redirect only if NOT exempted
    // ==========================================================================
    const hasMasterPassword = !!process.env.MASTER_PASSWORD
    const isSetupComplete = !!process.env.SETUP_COMPLETE

    // If not configured and not already on setup, redirect immediately
    if (!hasMasterPassword) {
        if (!pathname.startsWith('/setup') && !pathname.startsWith('/api')) {
            console.log(`🔀 [PROXY-REDIRECT] No MasterPassword -> /setup/start`)
            const setupUrl = new URL('/setup/start', request.url)
            return NextResponse.redirect(setupUrl)
        }
    }

    // If configured but setup not complete (company info missing), go to wizard
    if (hasMasterPassword && !isSetupComplete) {
        if (!pathname.startsWith('/setup') && !pathname.startsWith('/api') && !pathname.startsWith('/debug')) {
            console.log(`🔀 [PROXY-REDIRECT] Setup incomplete -> /setup/wizard`)
            const wizardUrl = new URL('/setup/wizard?resume=true', request.url)
            return NextResponse.redirect(wizardUrl)
        }
    }

    // ==========================================================================
    // API Routes - Use API Key or Session authentication
    // ==========================================================================
    if (pathname.startsWith('/api/')) {
        // Auth endpoints are always public
        if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
            return NextResponse.next()
        }

        // Public endpoints don't require authentication
        if (isPublicEndpoint(pathname)) {
            return NextResponse.next()
        }

        // Admin endpoints require admin-level access
        if (isAdminEndpoint(pathname)) {
            const adminAuth = await verifyAdminAccess(request)

            if (!adminAuth.valid) {
                return adminAuth.error?.includes('Admin')
                    ? forbiddenResponse(adminAuth.error)
                    : unauthorizedResponse(adminAuth.error)
            }

            return NextResponse.next()
        }

        // Check for user session cookie (for browser API calls)
        const sessionCookie = request.cookies.get('smartzap_session')
        if (sessionCookie?.value) {
            return NextResponse.next()
        }

        // All other API endpoints require at least API key
        const authResult = await verifyApiKey(request)

        if (!authResult.valid) {
            return unauthorizedResponse(authResult.error)
        }

        return NextResponse.next()
    }

    // ==========================================================================
    // Page Routes - Use Session Cookie authentication
    // ==========================================================================

    // Public pages don't require authentication
    if (PUBLIC_PAGES.some(page => pathname.startsWith(page))) {
        return NextResponse.next()
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('smartzap_session')

    // No session cookie - redirect to login
    if (!sessionCookie?.value) {
        console.log(`🔀 [PROXY-REDIRECT] No session -> /login (from ${pathname})`)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Session cookie exists - allow access
    return NextResponse.next()
}

// Export as both 'proxy' (Next 16) and 'middleware' (Standard)
export const middleware = proxy
export default proxy
