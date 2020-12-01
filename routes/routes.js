
import Router from 'koa-router'

import publicRouter from './public.js'
import secureRouter from'./secure.js'
import managerRouter from'./manager.js'

const mainRouter = new Router()

const nestedRoutes = [publicRouter, secureRouter, managerRouter]
for (const router of nestedRoutes) {
	mainRouter.use(router.routes())
	mainRouter.use(router.allowedMethods())
}

export default mainRouter
