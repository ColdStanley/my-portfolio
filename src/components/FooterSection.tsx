interface FooterSectionProps {
  hasSidebar?: boolean
}

export default function FooterSection({ hasSidebar = false }: FooterSectionProps) {
  return (
    <footer className={`bg-[var(--surface)] py-16 px-6 border-t border-[var(--neutral-dark)] relative z-10 ${
      hasSidebar ? 'ml-[68px]' : ''
    }`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[var(--primary)]">
              Stanley Hi
            </h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              Smart solutions for every part of life. Empowering productivity through intelligent automation and AI-driven tools.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Quick Links</h4>
            <div className="space-y-2">
              <a href="/" className="block text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Home</a>
              <a href="/ai-agent-gala" className="block text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">AI Agents</a>
              <a href="/jd2cv-full" className="block text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Resume Tools</a>
              <a href="/readlingua" className="block text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">Language Learning</a>
            </div>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-[var(--text-primary)]">Connect</h4>
            <div className="space-y-2">
              <p className="text-[var(--text-secondary)]">Building the future of productivity</p>
              <div className="flex space-x-4">
                <a href="#" className="text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-[var(--neutral-dark)] text-center text-[var(--text-secondary)]">
          <p>&copy; 2024 Stanley Hi. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}