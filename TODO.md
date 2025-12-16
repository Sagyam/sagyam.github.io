## Study This

- Study the design language of this website. Whatever you build has to follow the design 
language.

- This my best performing blog so far
  https://blog.sagyamthapa.com.np/interactive-guide-to-rate-limiting
It's not just text and image, there are four interactive apps that show the
working of four different algorithm. You can be adust the papramets of rate limiter 
play with it and if you click really fast you can see requests being dropped.

## Problem

I want to add my own blog to this portfolio website. Right now I use Hashnode for that.
The problem is it's only good for blogs with image and text, not for interactive blogs.
Those interactive parts are hosted in different website and linked as an IFrame.
The UX is not what I want. It's not seamless. Loading takes time. There is a design language 
mismatch.

## Inspiration

I am inspired by people like
https://www.joshwcomeau.com/
https://neal.fun/
And post like these where interaction is done seamlessly
https://planetscale.com/blog/caching

## Requirements

- We still need SEO so SSG, SSR, ISR, RSC depending the blog.
- Some page may need to show dynamic data, so a separate rendering strategy per blog may be necessay
- No layout shift as the dynamic part of the site loads
- Text image and Interactive code should live together (this helps with unified design language)
- Some kind of lazy loading where the static content is served first for very low TTI
- Each blog should have its own bundle. This is very, very important because make these interactive apps need third party 
 libraries that are used only once within that blog.
- Each blog should be its own thing. Other than a UI library like shadcn they don't share anything.

## Blog classification

- Simple text and image blog -> SSG
- Blogs that need periodic data refetch -> ISR
- Blogs that need heavy computation -> RSC

I don't want you to write any code just yet. This is just an exploration phase. 

## Queries

- tools and technologies that can be useful?
- Is it possible to separate rendering strategy per blog?
- Am I overthinking this?



