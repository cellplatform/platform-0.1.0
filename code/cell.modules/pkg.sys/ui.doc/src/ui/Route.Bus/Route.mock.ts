/**
 * Mock helpers testing routes.
 */
export function mock(href: string) {
  const location = new URL(href);

  const getHref = () => location.href;

  // See: https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
  const pushState = (data: any, _unused: string, url?: string) => {
    if (url) location.href = url;
  };

  return {
    location,
    getHref,
    pushState,
  };
}
