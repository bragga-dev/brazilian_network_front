/**
 * Access token só em memória (nunca localStorage): um XSS não leva a sessão.
 * O refresh token vive em cookie httpOnly e é gerenciado pelo backend.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token;
  },
  clear: () => {
    accessToken = null;
  },
};

export const AUTH_EXPIRED_EVENT = "auth:expired";
