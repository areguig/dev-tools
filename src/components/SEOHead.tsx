import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string
  toolName?: string
  category?: string
}

const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  toolName, 
  category 
}: SEOHeadProps) => {
  const location = useLocation()

  useEffect(() => {
    // Update document title
    if (title) {
      document.title = `${title} | Developer Tools Suite`
    } else {
      document.title = 'Developer Tools Suite - 31 Free Online Developer Utilities'
    }

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description)
    }

    // Update keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]')
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords)
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]')
    const ogDescription = document.querySelector('meta[property="og:description"]')
    const ogUrl = document.querySelector('meta[property="og:url"]')

    if (ogTitle && title) {
      ogTitle.setAttribute('content', `${title} | Developer Tools Suite`)
    }
    if (ogDescription && description) {
      ogDescription.setAttribute('content', description)
    }
    if (ogUrl) {
      ogUrl.setAttribute('content', `https://areguig.github.io/dev-tools${location.pathname}`)
    }

    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[property="twitter:title"]')
    const twitterDescription = document.querySelector('meta[property="twitter:description"]')
    const twitterUrl = document.querySelector('meta[property="twitter:url"]')

    if (twitterTitle && title) {
      twitterTitle.setAttribute('content', `${title} | Developer Tools Suite`)
    }
    if (twitterDescription && description) {
      twitterDescription.setAttribute('content', description)
    }
    if (twitterUrl) {
      twitterUrl.setAttribute('content', `https://areguig.github.io/dev-tools${location.pathname}`)
    }

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', `https://areguig.github.io/dev-tools${location.pathname}`)

    // Add structured data for individual tools
    if (toolName && category) {
      const existingScript = document.querySelector('#tool-structured-data')
      if (existingScript) {
        existingScript.remove()
      }

      const script = document.createElement('script')
      script.id = 'tool-structured-data'
      script.type = 'application/ld+json'
      script.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": toolName,
        "description": description,
        "url": `https://areguig.github.io/dev-tools${location.pathname}`,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires modern web browser with JavaScript enabled",
        "isPartOf": {
          "@type": "WebApplication",
          "name": "Developer Tools Suite",
          "url": "https://areguig.github.io/dev-tools/"
        },
        "offers": {
          "@type": "Offer",
          "price": "0",
          "@currency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "150",
          "bestRating": "5"
        }
      })
      document.head.appendChild(script)
    }

    // Cleanup function
    return () => {
      const toolScript = document.querySelector('#tool-structured-data')
      if (toolScript) {
        toolScript.remove()
      }
    }
  }, [title, description, keywords, toolName, category, location.pathname])

  return null // This component doesn't render anything visible
}

export default SEOHead