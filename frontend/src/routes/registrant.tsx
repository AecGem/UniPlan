import * as React from 'react'
import * as registrantApp from '../RegistrantApp.jsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/registrant')({
  component: RouteComponent,
})

function RouteComponent() {
  const { session } = Route.useRouteContext();
  return <registrantApp.default session={session} />
}
