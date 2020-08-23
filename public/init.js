// Check that service workers are supported
if ('serviceWorker' in navigator) {
    // Use the window load event to keep the page load performant
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js');
    });
  }

// Register the ServiceWorker limiting its action to those URL starting
// by `controlled`. The scope is not a path but a prefix. First, it is
// converted into an absolute URL, then used to determine if a page is
// controlled by testing it is a prefix of the request URL.
/*navigator.serviceWorker.register('service-worker.js', {
    scope: './'
  });
  */
  // Load controlled and uncontrolled pages once the worker is active.
  //navigator.serviceWorker.ready.then(reload);