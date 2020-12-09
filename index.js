
import Koa from 'koa'
import server from 'koa-static'
import views from 'koa-views'
import session from 'koa-session'

import router from './routes/routes.js'


const app = new Koa()
app.keys = ['darkSecret']

const defaultPort = 8080
const port = process.env.PORT || defaultPort

async function getHandlebarData(ctx, next) {
	console.log(`${ctx.method} ${ctx.path}`)
	ctx.hbs = {
		authorisedMember: ctx.session.authorisedMember,
		authorisedManager: ctx.session.authorisedManager,
		user: ctx.session.user,
		userid: ctx.session.userid,
		host: `https://${ctx.host}`
	}

	for(const key in ctx.query) {
		ctx.hbs[key] = ctx.query[key]
	}

	await next()
}


app.use(server('public'))
app.use(session(app))
app.use(views('views', { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))

app.use(getHandlebarData)
router.pub
app.use(router.routes())
app.use(router.allowedMethods())


/app.listen(port, async() => console.log(`listening on port ${port}`))
