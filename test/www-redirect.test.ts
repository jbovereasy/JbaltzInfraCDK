import { wwwRedirectCode } from '../lib/utils/www-redirect';

// Minimal shape of the CloudFront Functions event we use.
type QueryValue = { value: string; multiValue?: { value: string }[] };
type Request = { uri: string; headers: { host?: { value: string } }; querystring: Record<string, QueryValue> };
type Redirect = { statusCode: number; headers: { location: { value: string } } };
type Handler = (event: { request: Request }) => Request | Redirect;

const handler = new Function(
  `${wwwRedirectCode('jbaltz.com', ['www.jbaltz.com'])}; return handler;`,
)() as Handler;

const request = (host: string, uri = '/', querystring: Record<string, QueryValue> = {}): Request => ({
  uri,
  headers: { host: { value: host } },
  querystring,
});

describe('www redirect CloudFront Function', () => {
  test('301s www to the apex over https, keeping the path', () => {
    const res = handler({ request: request('www.jbaltz.com', '/projects/') }) as Redirect;
    expect(res.statusCode).toBe(301);
    expect(res.headers.location.value).toBe('https://jbaltz.com/projects/');
  });

  test('keeps the query string, including repeated keys', () => {
    const res = handler({
      request: request('www.jbaltz.com', '/search', {
        q: { value: 'cdk' },
        tag: { value: 'a', multiValue: [{ value: 'a' }, { value: 'b' }] },
      }),
    }) as Redirect;
    expect(res.headers.location.value).toBe('https://jbaltz.com/search?q=cdk&tag=a&tag=b');
  });

  test('passes apex requests through unchanged', () => {
    const req = request('jbaltz.com', '/about');
    expect(handler({ request: req })).toBe(req);
  });

  test('passes the *.cloudfront.net hostname through (useful for testing)', () => {
    const req = request('d2ofh6kw8ehi.cloudfront.net');
    expect(handler({ request: req })).toBe(req);
  });
});
