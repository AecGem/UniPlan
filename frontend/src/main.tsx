import * as React from 'react'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorComponent, RouterProvider, createRouter } from '@tanstack/react-router'
import { authClient, userInfo } from './utils/auth'


// Import the generated route tree
import { routeTree } from './routeTree.gen'

import './index.css'

// Create a new router instance
const router = createRouter({ routeTree,
  context: {
    authClient: authClient,
    session: undefined!,
  },
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />
 })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <RouterProvider router={router} context={{
        authClient,session:userInfo}}
        />
    </StrictMode>,
  )
}