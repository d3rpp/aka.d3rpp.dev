const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/g;

const DOMAIN = /^https?\:\/\/([a-z0-9].?)+\//;

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
		let path = request.url.replace(DOMAIN, "");

		// Root URL
		if (path == "" ) {
			return new Response(null, {
				headers: {
					"Location": "https://d3rpp.dev"
				},
				status: 302
			})
		}

		if (SLUG.test(path)) {
			// tested to be slug, valid
			let return_value = await env.URLS.get(path, "text");

			if (return_value === null) {
				return new Response("Not Found", { status: 404 });
			} else {
				return new Response("Found", {
					headers: {
						"Location": return_value
					},
					status: 302
				});
			}
		} else {
			// invalid slug
			return new Response("Bad Request", {status: 400})
		}
	}
}