import * as React from 'react'
import * as RegistrarApp from '../RegistrarApp.jsx'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../utils/auth'
import { UserInfo } from '../utils/auth'
interface RouterContext {
  authClient: typeof authClient,
  session?: UserInfo
}
export const Route = createFileRoute<RouterContext>('/registrar')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext();
  return <RegistrarApp.default session={session}/>
}
