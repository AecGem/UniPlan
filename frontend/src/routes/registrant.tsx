import * as React from 'react'
import * as registrantApp from '../RegistrantApp.jsx'
import { createFileRoute } from '@tanstack/react-router'
import { Route } from './__root.tsx'

export const RegistrantRoute = Route.createRoute({
  path: "/registrant",
  loader: async ({context}) =>{
    console.log("DEBUG: registrant session context: ",context.session);
  },
  component: RouteComponent,
})
/*
export const RegistrantRoute = createFileRoute('/registrant')({
  component: RouteComponent,
})
*/
function RouteComponent() {
  return <registrantApp.default />
}
