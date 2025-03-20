import * as React from 'react'
import * as RegistrarApp from '../RegistrarApp.jsx'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/registrar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <RegistrarApp.default />
}
