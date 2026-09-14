import Seo from '../Seo.jsx'
import { getRoute } from '../../config/routes.js'

export default function RouteSeo({ path }) {
  const route = getRoute(path)

  return (
    <Seo
      title={route.title}
      description={route.description}
      pathname={route.path}
      noindex={route.noindex}
    />
  )
}
