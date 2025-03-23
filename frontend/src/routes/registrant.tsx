import * as React from 'react'
import * as registrantApp from '../RegistrantApp.jsx'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../utils/auth'
import { UserInfo } from '../utils/auth'
interface RouterContext {
  authClient: typeof authClient,
  session?: UserInfo
}
export const Route = createFileRoute<RouterContext>('/registrant')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext();
  return <registrantApp.default session={session} />
}
