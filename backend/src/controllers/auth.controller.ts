import type { CookieOptions, Request, Response } from 'express';
import { env, isProduction } from '../config/env.js';
import { authService, type Session } from '../services/auth.service.js';

const REFRESH_COOKIE = 'refresh_token';

const cookieOptions: CookieOptions = {
  httpOnly: true, // inaccesible desde JavaScript (mitiga XSS)
  secure: isProduction, // solo HTTPS en producción
  sameSite: 'lax',
  path: '/api/auth', // el navegador solo la envía a los endpoints de auth
};

function sendSession(res: Response, session: Session, status = 200) {
  res.cookie(REFRESH_COOKIE, session.refreshToken, {
    ...cookieOptions,
    maxAge: env.REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  });
  res.status(status).json({ user: session.user, accessToken: session.accessToken });
}

export const authController = {
  async register(req: Request, res: Response) {
    sendSession(res, await authService.register(req.body), 201);
  },

  async login(req: Request, res: Response) {
    sendSession(res, await authService.login(req.body));
  },

  async refresh(req: Request, res: Response) {
    try {
      sendSession(res, await authService.refresh(req.cookies?.[REFRESH_COOKIE]));
    } catch (error) {
      res.clearCookie(REFRESH_COOKIE, cookieOptions);
      throw error;
    }
  },

  async logout(req: Request, res: Response) {
    await authService.logout(req.cookies?.[REFRESH_COOKIE]);
    res.clearCookie(REFRESH_COOKIE, cookieOptions);
    res.status(204).end();
  },

  async me(req: Request, res: Response) {
    res.json({ user: await authService.me(req.user!.id) });
  },
};
