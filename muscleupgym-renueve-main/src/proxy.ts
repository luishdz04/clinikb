import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";
  
  // En desarrollo (localhost), permitir todo sin restricciones de subdomain
  const isDevelopment = hostname.includes("localhost") || 
                       hostname.includes("127.0.0.1") ||
                       hostname.includes("codespaces");
  
  // Detectar subdomain de administración (solo en producción)
  const isAdminSubdomain = !isDevelopment && (
    hostname.startsWith("administracion.") || 
    hostname.startsWith("admin.")
  );

  // Create Supabase client
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => 
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Obtener usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.user_metadata?.role === 'admin';
  
  // Verificar sesión de empleado
  const employeeSession = request.cookies.get('employee_session')?.value;
  let employee = null;
  if (employeeSession) {
    try {
      employee = JSON.parse(employeeSession);
    } catch (e) {
      // Cookie inválida, ignorar
    }
  }

  // ============================================
  // LÓGICA DE SUBDOMINIOS
  // ============================================

  // Verificar cookie de acceso admin
  const hasAdminAccess = request.cookies.get('admin_access')?.value === 'granted';

  // ============================================
  // PROTECCIÓN DE ACCESO A RUTAS DE ADMINISTRACIÓN
  // ============================================
  // Siempre requerir cookie de acceso para rutas administrativas
  const isAdminRoute = pathname.startsWith('/admin') || 
                       pathname.startsWith('/login/empleados');
  
  if (isAdminRoute && !hasAdminAccess && pathname !== '/acceso' && !pathname.startsWith('/api/validate-admin-access')) {
    // Redirigir a página de acceso
    return NextResponse.redirect(new URL('/acceso', request.url));
  }

  // Si ya tiene acceso pero está en /acceso, redirigir a login de empleados
  if (hasAdminAccess && pathname === '/acceso') {
    return NextResponse.redirect(new URL('/login/empleados', request.url));
  }

  // Solo aplicar lógica de subdominios en producción
  if (!isDevelopment) {
    if (isAdminSubdomain) {
      // En subdomain de administración
      
      // Solo permitir rutas /admin/*, /login/empleados, /acceso y rutas de auth
      if (!pathname.startsWith('/admin') && 
          !pathname.startsWith('/login/empleados') &&
          !pathname.startsWith('/acceso') &&
          !pathname.startsWith('/api') &&
          !pathname.startsWith('/_next')) {
        // Redirigir todo lo demás a /admin/dashboard o acceso
        if (!hasAdminAccess) {
          return NextResponse.redirect(new URL('/acceso', request.url));
        }
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }

      // Si intenta acceder a /admin/* sin sesión de empleado, redirigir a login
      if (pathname.startsWith('/admin') && !employee) {
        const loginUrl = new URL('/login/empleados', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      // En dominio principal (cliente)
      
      // No permitir acceso a rutas /admin/* desde dominio principal
      if (pathname.startsWith('/admin')) {
        // Redirigir a subdomain de admin
        const adminUrl = new URL(request.url);
        adminUrl.host = `administracion.${hostname}`;
        return NextResponse.redirect(adminUrl);
      }
    }
  }

  // Proteger rutas /admin/* - requiere sesión de empleado
  if (pathname.startsWith('/admin') && !employee) {
    const loginUrl = new URL('/login/empleados', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Proteger rutas /cliente/* - requiere autenticación
  if (pathname.startsWith('/cliente') && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ============================================
  // PROTECCIÓN DE RUTAS GENERALES
  // ============================================

  // Rutas públicas que no necesitan autenticación
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/about',
    '/pricing',
    '/services',
    '/bienvenido',
  ];

  const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path));
  const isApiRoute = pathname.startsWith('/api');
  const isStaticFile = pathname.startsWith('/_next') || 
                       pathname.startsWith('/static') ||
                       pathname.startsWith('/images') ||
                       pathname.startsWith('/logos') ||
                       pathname.startsWith('/fonts');

  // Si es ruta pública, API o archivo estático, permitir acceso
  if (isPublicPath || isApiRoute || isStaticFile) {
    return supabaseResponse;
  }

  // Si no hay usuario y no es ruta pública, redirigir a login
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
