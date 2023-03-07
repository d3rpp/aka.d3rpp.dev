use worker::*;
use regex::Regex;

mod utils;

lazy_static::lazy_static!{
    static ref SLUG: Regex = Regex::new("^[a-z0-9]+(?:-[a-z0-9]+)*$").unwrap(); 
}

fn log_request(req: &Request) {
    console_log!(
        "{} - [{}], located at: {:?}, within: {}",
        Date::now().to_string(),
        req.path(),
        req.cf().coordinates().unwrap_or_default(),
        req.cf().region().unwrap_or_else(|| "unknown region".into())
    );
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    log_request(&req);

    // Optionally, get more helpful error messages written to the console in the case of a panic.
    utils::set_panic_hook();

    // Optionally, use the Router to handle matching endpoints, use ":name" placeholders, or "*name"
    // catch-alls to match on specific patterns. Alternatively, use `Router::with_data(D)` to
    // provide arbitrary data that will be accessible in each route via the `ctx.data()` method.
    let router = Router::new();

    // Add as many routes as your Worker needs! Each route will get a `Request` for handling HTTP
    // functionality and a `RouteContext` which you can use to  and get route parameters and
    // Environment bindings like KV Stores, Durable Objects, Secrets, and Variables.
    router
        .get_async("/:aka", |_req, ctx| async move {
            let slug = ctx.param("aka");

            if let Some(s) = slug {
                let namespace = ctx.kv("URLS")?;

                if !SLUG.is_match(s) {
                    return Response::error("Invalid ID", 400);
                }

                let item = namespace.get(s.as_str()).text().await?;

                if let Some(url) = item {
                    Response::redirect_with_status(Url::parse(&url)?, 301)
                } else {
                    Response::error("Unknown URL", 404)
                }
            } else {
                Response::error("Bad Request", 400)
            }
        })
        .run(req, env)
        .await
}