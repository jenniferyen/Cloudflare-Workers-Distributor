// this application randomly distributes URLs over two variants
// DEPLOYED AT: https://cloudflare-fullstack.jenyen.workers.dev/

// get the variants from the API 
const apiURL = "https://cfw-takehome.developers.workers.dev/api/variants"
async function getVariants() {
  var response = await fetch(apiURL)
  var json = await response.json() 
  var { variants } = json
  return variants
}

// persist one of two variants with cookies
async function distributeVariants(request, variants) {
  var VARIANT_ONE = await fetch(variants[0])
  var VARIANT_TWO = await fetch(variants[1])

  const cookie = request.headers.get('cookie')
  if (cookie && cookie.includes('cookie=variant_one')) {
    return VARIANT_ONE
  } else if (cookie && cookie.includes('cookie=variant_two')) {
    return VARIANT_TWO
  } else {
    var random = Math.random < 0.5 ? 'variant_one' : 'variant_two'
    var choice = random == 'variant_one' ? VARIANT_ONE : VARIANT_TWO
    choice = new Response(choice.body, choice)
    choice.headers.set('Set-Cookie','cookie=${random}; path=/')

    return choice
  }
}

// event handler
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  const variants = await getVariants()
  const response = await distributeVariants(request, variants)

  // return new Response('Hello worker!', {
  //   headers: { 'content-type': 'text/plain' },
  // })
  return new HTMLRewriter()
    .on('title', {
      element: el => {
        el.setInnerContent("Mission complete")
      }
    })
    .on('h1#title', {
      element: el => {
        el.setInnerContent("Jennifer Yen")
      }
    })
    .on("p#description", {
      element: el => {
        el.setInnerContent("My internship with Airbnb was deferred and I really want to thank you for this opportunity!")
      }
    })
    .on("a#url", {
      element: el => {
        el.setInnerContent("I'm currently redesigning my personal site but please check out my resume!")
        el.setAttribute("href", "https://drive.google.com/file/d/15xUTVWLm66i9FRkROeHQVE1RBtzJWNpb/view?usp=sharing")
      }
    })
    .transform(response)
}