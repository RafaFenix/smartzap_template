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

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const searchParams = request.nextUrl.searchParams.toString()
    const fullPath = searchParams ? `${pathname}?${searchParams}` : pathname

    console.log(`🔍 [MIDDLEWARE] Requesting: ${fullPath}`)

    // Allow OPTIONS requests for CORS preflight
    if (request.method === 'OPTIONS') {
        return NextResponse.next()
    }

    // ==========================================================================
    // NUCLEAR EXEMPTION - Ensure settings are NEVER redirected
    // ==========================================================================
    if (
        pathname.startsWith('/settings') ||
        pathname.startsWith('/api/settings') ||
        pathname.startsWith('/api/instances') ||
        pathname.startsWith('/api/auth/status') ||
        pathname.includes('/settings') // Catch-all for sub-paths
    ) {
        console.log(`✅ [MIDDLEWARE] NUCLEAR ALLOW for path: ${pathname}`)
        return NextResponse.next()
    }

    const hasMasterPassword = !!process.env.MASTER_PASSWORD
    const isSetupComplete = !!process.env.SETUP_COMPLETE

    console.log(`ℹ️ [MIDDLEWARE] Config Status - hasMasterPass: ${hasMasterPassword}, isSetupComplete: ${isSetupComplete}`)

    // ==========================================================================
    // BOOTSTRAP CHECK - Redirect to setup if not configured
    // ==========================================================================

    // If not configured and not already on setup, redirect immediately
    if (!hasMasterPassword) {
        if (!pathname.startsWith('/setup') && !pathname.startsWith('/api')) {
            console.log(`🔀 [MIDDLEWARE] REDIRECT: No MasterPassword -> /setup/start`)
            const setupUrl = new URL('/setup/start', request.url)
            return NextResponse.redirect(setupUrl)
        }
    }

    // If configured but setup not complete (company info missing), go to wizard
    if (hasMasterPassword && !isSetupComplete) {
        if (!pathname.startsWith('/setup') && !pathname.startsWith('/api') && !pathname.startsWith('/debug')) {
            console.log(`🔀 [MIDDLEWARE] REDIRECT: Setup incomplete -> /setup/wizard`)
            const wizardUrl = new URL('/setup/wizard?resume=true', request.url)
            return NextResponse.redirect(wizardUrl)
        }
    }

    // ==========================================================================
    // API Routes - Use API Key authentication
    // ==========================================================================
    if (pathname.startsWith('/api/')) {
        // Auth endpoints are always public
        if (PUBLIC_API_ROUTES.some(route => pathname.startsWith(route))) {
            console.log(`✅ [MIDDLEWARE] API ALLOW: Public route ${pathname}`)
            return NextResponse.next()
        }

        // Public endpoints don't require authentication
        if (isPublicEndpoint(pathname)) {
            console.log(`✅ [MIDDLEWARE] API ALLOW: Public endpoint ${pathname}`)
            return NextResponse.next()
        }

        // Admin endpoints require admin-level access
        if (isAdminEndpoint(pathname)) {
            console.log(`🧪 [MIDDLEWARE] API CHECK: Admin access for ${pathname}`)
            const adminAuth = await verifyAdminAccess(request)

            if (!adminAuth.valid) {
                console.log(`❌ [MIDDLEWARE] API DENY: Admin access invalid for ${pathname}`)
                return adminAuth.error?.includes('Admin')
                    ? forbiddenResponse(adminAuth.error)
                    : unauthorizedResponse(adminAuth.error)
            }

            return NextResponse.next()
        }

        // Check for user session cookie (for browser API calls)
        const sessionCookie = request.cookies.get('smartzap_session')
        if (sessionCookie?.value) {
            console.log(`✅ [MIDDLEWARE] API ALLOW: Session cookie found for ${pathname}`)
            return NextResponse.next()
        }

        // All other API endpoints require at least API key
        console.log(`🧪 [MIDDLEWARE] API CHECK: API Key for ${pathname}`)
        const authResult = await verifyApiKey(request)

        if (!authResult.valid) {
            console.log(`❌ [MIDDLEWARE] API DENY: API Key invalid for ${pathname}`)
            return unauthorizedResponse(authResult.error)
        }

        return NextResponse.next()
    }

    // ==========================================================================
    // Page Routes - Use Session Cookie authentication
    // ==========================================================================

    // Public pages don't require authentication
    if (PUBLIC_PAGES.some(page => pathname.startsWith(page))) {
        console.log(`✅ [MIDDLEWARE] PAGE ALLOW: Public page ${pathname}`)
        return NextResponse.next()
    }

    // Check for session cookie
    const sessionCookie = request.cookies.get('smartzap_session')

    // No session cookie - redirect to login
    if (!sessionCookie?.value) {
        console.log(`🔀 [MIDDLEWARE] REDIRECT: No session -> /login (from ${pathname})`)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    console.log(`✅ [MIDDLEWARE] PAGE ALLOW: Authenticated session for ${pathname}`)
    return NextResponse.next()
}
