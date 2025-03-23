import * as React from 'react'
import * as RegistrarApp from '../RegistrarApp.jsx'
import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../utils/auth'
import { UserInfo } from '../utils/auth'

export const Route = createFileRoute('/registrar')({
  component: RouteComponent,
    //component: RootComponent,
    beforeLoad: async ({ context, location }) => {
      // if our ctx session isnt valid
      if (!context.session.check()) {
          // lets verify by checking against the api
          var sess = await context.authClient.getSession()
          console.log(sess);
          // if that's really false, we need to log back in.
          // navigating anywhere on the profile pages will force a redirect to login.
          if(sess.data === null) {
              return;
          }
          // otherwise, update our ctx so we have the session properly set
          context.session.set(sess.data.user, sess.data.session);
      }
      // return a user object (idk why. i just do)
      return { user: context.session?.user || null }
  },
})

function RouteComponent() {
  const { session } = Route.useRouteContext();
  return <RegistrarApp.default session={session}/>
}
