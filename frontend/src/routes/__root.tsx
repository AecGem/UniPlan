import * as React from 'react'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { authClient } from '../../../backend/src/utils/auth-client.ts'

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
})