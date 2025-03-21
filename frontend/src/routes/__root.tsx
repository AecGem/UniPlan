import React from 'react'
import { Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { createRootRouteWithContext } from '@tanstack/react-router'
import { authClient } from '../utils/auth'
import { UserInfo } from '../utils/auth'

interface RouterContext {
  authClient: typeof authClient,
  session?: UserInfo
}


export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: async ({ context, location }) => {
    // if our ctx session isnt valid
    if (!context.session.check()) {
        // lets verify by checking against the api
        var sess = await context.authClient.getSession()
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

function RootComponent(){
return (
<>
      <nav className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
        <Link to="/registrant" className="[&.active]:font-bold">
          Registrant
        </Link>
        <Link to="/registrar" className="[&.active]:font-bold">
          Registrar
        </Link>
      </nav>
      <hr />
      <Outlet />
      {/*<TanStackRouterDevtools />*/}
    </>

)

}