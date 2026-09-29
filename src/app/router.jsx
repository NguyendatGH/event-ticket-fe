// Toàn bộ route (contract §6.2); trang tải lazy, Suspense nằm trong từng layout.

import { lazy } from "react";
import { createBrowserRouter, Navigate, useSearchParams } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import SiteLayout from "@/layouts/SiteLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AccountLayout from "@/layouts/AccountLayout";
import OrganizerLayout from "@/layouts/OrganizerLayout";
import RouteError from "@/layouts/RouteError";
import { RequireAuth, RequireOrganizer } from "@/layouts/guards";

const page = (load) => {
  const Page = lazy(load);
  return <Page />;
};

function CheckoutCancelRedirect() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  return <Navigate to={orderId ? `/orders/${orderId}` : "/"} replace />;
}

export const routes = [
  {
    element: <RootLayout />,
    errorElement: <RouteError />,
    children: [
      {
        element: <SiteLayout />,
        children: [
          {
            errorElement: <RouteError />,
            children: [
              { index: true, element: page(() => import("@/pages/home/HomePage")) },
              { path: "events", element: page(() => import("@/pages/events/EventsPage")) },
              { path: "events/:slug", element: page(() => import("@/pages/events/EventDetailPage")) },
              { path: "organizers/:slug", element: page(() => import("@/pages/organizers/OrganizerPublicPage")) },
              { path: "contact", element: page(() => import("@/pages/contact/ContactPage")) },

              {
                element: <RequireAuth />,
                children: [
                  { path: "checkout/return", element: page(() => import("@/pages/checkout/CheckoutReturnPage")) },
                  { path: "checkout/success", element: page(() => import("@/pages/checkout/CheckoutSuccessPage")) },
                  { path: "checkout/failed", element: page(() => import("@/pages/checkout/CheckoutFailedPage")) },
                  { path: "checkout/cancel", element: <CheckoutCancelRedirect /> },
                  { path: "checkout/:slug", element: page(() => import("@/pages/checkout/CheckoutPage")) },
                  { path: "orders/:id", element: page(() => import("@/pages/orders/OrderPage")) },
                ],
              },

              {
                element: <RequireAuth />,
                children: [
                  {
                    element: <AccountLayout />,
                    children: [
                      { path: "me/profile", element: page(() => import("@/pages/account/ProfilePage")) },
                      { path: "me/orders", element: page(() => import("@/pages/account/MyOrdersPage")) },
                      { path: "become-organizer", element: page(() => import("@/pages/account/BecomeOrganizerPage")) },
                      { path: "me/tickets", element: page(() => import("@/pages/tickets/MyTicketsPage")) },
                      { path: "me/tickets/:id", element: page(() => import("@/pages/tickets/TicketDetailPage")) },
                    ],
                  },
                ],
              },

              { path: "*", element: page(() => import("@/pages/NotFoundPage")) },
            ],
          },
        ],
      },

      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            errorElement: <RouteError />,
            children: [
              { index: true, element: <Navigate to="/auth/login" replace /> },
              { path: "login", element: page(() => import("@/pages/auth/LoginPage")) },
              { path: "register", element: page(() => import("@/pages/auth/RegisterPage")) },
              { path: "register-organizer", element: page(() => import("@/pages/auth/OrganizerRegisterPage")) },
              { path: "forgot-password", element: page(() => import("@/pages/auth/ForgotPasswordPage")) },
              { path: "reset-password", element: page(() => import("@/pages/auth/ResetPasswordPage")) },
            ],
          },
        ],
      },

      {
        path: "organizer",
        element: (
          <RequireOrganizer>
            <OrganizerLayout />
          </RequireOrganizer>
        ),
        children: [
          {
            errorElement: <RouteError />,
            children: [
              { index: true, element: page(() => import("@/pages/organizer/DashboardPage")) },
              { path: "events", element: page(() => import("@/pages/organizer/EventsManagePage")) },
              { path: "events/new", element: page(() => import("@/pages/organizer/EventEditorPage")) },
              { path: "events/:id", element: page(() => import("@/pages/organizer/OrganizerEventDetailPage")) },
              { path: "events/:id/edit", element: page(() => import("@/pages/organizer/EventEditorPage")) },
              { path: "profile", element: page(() => import("@/pages/organizer/OrganizerProfilePage")) },
            ],
          },
        ],
      },
    ],
  },
];

export const createRouter = () => createBrowserRouter(routes);
