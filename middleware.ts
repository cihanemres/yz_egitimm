import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';

import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const session = req.auth;
  const role = session?.user?.role;

  const ogretmenRotasi = pathname.startsWith('/teacher');
  const ogrenciRotasi = pathname.startsWith('/student');
  const korumaliRota = ogretmenRotasi || ogrenciRotasi;

  // Oturum var ama rol okunamıyorsa token geçersizdir (örn. AUTH_SECRET
  // eksik veya değişmiş). Kullanıcıyı 403 çıkmazında bırakmak yerine
  // yeniden giriş yapmaya gönder.
  if (session && !role) {
    if (pathname === '/login' || pathname === '/register') {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  // Giriş yapmamış kullanıcı korumalı rotaya erişemez
  if (korumaliRota && !session) {
    const girisUrl = new URL('/login', nextUrl);
    girisUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(girisUrl);
  }

  // Sonuç sayfasını (/student/attempts/[id]) öğretmen de görebilir.
  // Kayda erişim yetkisi ayrıca sayfa içinde tekrar denetlenir.
  const sonucSayfasi = pathname.startsWith('/student/attempts/');

  // Rol uyuşmazlığı → 403 sayfası
  if (ogretmenRotasi && role !== 'TEACHER') {
    return NextResponse.rewrite(new URL('/forbidden', nextUrl));
  }
  if (ogrenciRotasi && role !== 'STUDENT' && !(sonucSayfasi && role === 'TEACHER')) {
    return NextResponse.rewrite(new URL('/forbidden', nextUrl));
  }

  // Giriş yapmış kullanıcı login/register sayfasına giderse paneline yönlendir
  if (session && (pathname === '/login' || pathname === '/register')) {
    const hedef = role === 'TEACHER' ? '/teacher' : '/student';
    return NextResponse.redirect(new URL(hedef, nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/teacher/:path*', '/student/:path*', '/login', '/register'],
};
