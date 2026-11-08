import type { ComponentType } from "react";
import { createBrowserRouter } from "react-router-dom";

import { GuestRoute } from "@/components/layout/GuestRoute";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import RouteErrorPage from "@/pages/RouteErrorPage";

/** Code splitting por rota: cada página vira um chunk carregado sob demanda. */
const page = (loader: () => Promise<{ default: ComponentType }>) => async () => ({
  Component: (await loader()).default,
});

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, lazy: page(() => import("@/pages/HomePage")) },
      { path: "vagas", lazy: page(() => import("@/pages/jobs/JobsPage")) },
      { path: "vagas/:jobId", lazy: page(() => import("@/pages/jobs/JobDetailPage")) },
      { path: "projetos", lazy: page(() => import("@/pages/projects/ProjectsPage")) },
      { path: "empresas", lazy: page(() => import("@/pages/companies/CompaniesPage")) },
      { path: "empresas/:companyId", lazy: page(() => import("@/pages/companies/CompanyDetailPage")) },

      {
        element: <GuestRoute />,
        children: [
          { path: "entrar", lazy: page(() => import("@/pages/auth/LoginPage")) },
          { path: "cadastro", lazy: page(() => import("@/pages/auth/RegisterPage")) },
          { path: "esqueci-senha", lazy: page(() => import("@/pages/auth/ForgotPasswordPage")) },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [{ path: "conta", lazy: page(() => import("@/pages/account/AccountPage")) }],
      },
      // Destinos dos links enviados por e-mail (acessíveis logado ou não)
      { path: "verificacao-concluida", lazy: page(() => import("@/pages/auth/VerificationResultPage")) },
      { path: "redefinir-senha", lazy: page(() => import("@/pages/auth/ResetPasswordPage")) },

      { path: "*", lazy: page(() => import("@/pages/NotFoundPage")) },
    ],
  },
]);