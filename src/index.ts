import slugify from 'slugify';

export default {
	async fetch(request: Request, env: Env, _ctx: ExecutionContext) {
		const path = new URL(request.url).pathname.split("/")[1];

		console.log(path);

		if (path == 'favicon.ico') {
			return new Response(null, { status: 404 });
		}

		// Root URL
		if (path == '') {
			return Response.redirect('https://d3rpp.dev/aka');
		}

		const slug = slugify(decodeURIComponent(path), {
			lower: true,
			strict: true,
			locale: 'en',
			trim: true
		});

		console.log(slug);

		let return_value = await env.URLS.get(path, 'text');

		if (return_value === null) {
			return new Response(null, { status: 404 });
		} else {
			return Response.redirect(return_value);
		}
	},
};
