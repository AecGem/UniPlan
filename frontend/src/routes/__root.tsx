import * as React from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      //Add a link to registrant and registrar
      <Link to="/registrant">Registrant</Link>
      <Link to="/registrar">Registrar</Link>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})