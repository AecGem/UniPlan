import React from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: () => (
    <>
      <nav className="p-2 flex gap-2">
        <Link to="/app" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/registrant" className="[&.active]:font-bold">
          Registrant
        </Link>
        <Link to="/registrar" className="[&.active]:font-bold">
          Registrar
        </Link>
      </nav>
      <hr />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})