const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/g;

const DOMAIN = /^https?\:\/\/([a-z0-9].?)+\//;

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
		let path = request.url.replace(DOMAIN, '');

		// Root URL
		if (path == '') {
			return Response.redirect('https://d3rpp.dev/aka');
		}

		if (SLUG.test(path)) {
			// tested to be slug, valid
			let return_value = await env.URLS.get(path, 'text');

			if (return_value === null) {
				return new Response(null, { status: 404 });
			} else {
				return Response.redirect(return_value);
			}
		} else {
			// invalid slug
			return new Response('Bad Request', { status: 400 });
		}
	},
};
