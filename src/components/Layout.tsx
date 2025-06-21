import { type ReactNode } from 'react'
import Navigation from './Navigation'
import ToolTracker from './ToolTracker'
import Footer from './Footer'
import Breadcrumbs from './Breadcrumbs'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors flex flex-col">
      <ToolTracker />
      <Navigation />
      <Breadcrumbs />
      <main className="container mx-auto px-4 py-8 flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}

export default Layout