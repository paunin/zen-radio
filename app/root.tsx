import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, MetaFunction } from "@remix-run/node";
import "./tailwind.css";

export const links: LinksFunction = () => [
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/images/icon16.png", sizes: "16x16", type: "image/png" },
  { rel: "icon", href: "/images/icon32.png", sizes: "32x32", type: "image/png" },
  { rel: "apple-touch-icon", href: "/images/icon-192.png" },
];

export const meta: MetaFunction = () => [
  { title: "Zen Radio" },
  { name: "description", content: "A beautiful internet radio player" },
  { name: "theme-color", content: "#111111" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { name: "apple-mobile-web-app-capable", content: "yes" },
  { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="flex items-center justify-center h-dvh bg-bg text-text-primary">
      <div className="text-center p-8">
        <h1 className="text-2xl font-semibold mb-2">
          {isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "Something went wrong"}
        </h1>
        <p className="text-text-secondary">
          {isRouteErrorResponse(error)
            ? error.data
            : "Please refresh the page and try again."}
        </p>
      </div>
    </div>
  );
}
