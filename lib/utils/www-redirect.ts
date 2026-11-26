/**
 * Source for a CloudFront Function (viewer request) that 301-redirects
 * secondary hostnames (e.g. www.jbaltz.com) to the canonical domain,
 * keeping the path and query string.
 *
 * CloudFront Functions run a restricted JavaScript runtime, so the handler is
 * plain ES5-style JS in a string. Values are injected with JSON.stringify so
 * they are always valid, safely quoted JS literals.
 */
export function wwwRedirectCode(canonicalDomain: string, redirectHosts: string[]): string {
  return `
var CANONICAL = ${JSON.stringify(canonicalDomain)};
var REDIRECT_HOSTS = ${JSON.stringify(redirectHosts)};

function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';

  if (REDIRECT_HOSTS.indexOf(host) === -1) {
    return request;
  }

  var parts = [];
  var qs = request.querystring;
  for (var key in qs) {
    var values = qs[key].multiValue ? qs[key].multiValue : [qs[key]];
    for (var i = 0; i < values.length; i++) {
      parts.push(key + '=' + values[i].value);
    }
  }
  var query = parts.length ? '?' + parts.join('&') : '';

  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: 'https://' + CANONICAL + request.uri + query } },
  };
}
`;
}
