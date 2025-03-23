import * as React from 'react';
import * as IndexApp from '../App.jsx';
import { createFileRoute } from '@tanstack/react-router';
import { authClient } from '../utils/auth'
import { UserInfo } from '../utils/auth'

interface RouterContext {
  authClient: typeof authClient,
  session?: UserInfo
}

export const Route = createFileRoute<RouterContext>('/')({
  component: Index,
})

function Index() {   
  const { session } = Route.useRouteContext();
  return <IndexApp.default context={session} />

}