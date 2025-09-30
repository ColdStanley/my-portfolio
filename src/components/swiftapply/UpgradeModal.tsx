'use client'

import { useSwiftApplyStore } from '@/lib/swiftapply/store'
import Button from '@/components/ui/button'

export default function UpgradeModal() {
  const { closeUpgradeModal } = useSwiftApplyStore()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="upgrade-title" className="text-2xl font-bold text-text-primary">
              Upgrade to Pro
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Unlimited resume customizations
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={closeUpgradeModal}
            className="w-8 h-8 p-0"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <div className="bg-surface rounded-lg p-4">
            <h3 className="font-semibold text-text-primary mb-2">Pro Features</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Unlimited resume customizations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Priority AI processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Advanced customization options</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">✓</span>
                <span>Email support</span>
              </li>
            </ul>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 border border-accent/20">
            <p className="text-sm text-text-primary">
              <strong>Interested in Pro?</strong> Contact us to discuss pricing and payment options.
            </p>
            <p className="text-sm text-text-secondary mt-2">
              Email: <a href="mailto:support@example.com" className="text-primary hover:underline">support@example.com</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            onClick={closeUpgradeModal}
            variant="secondary"
            fullWidth
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              window.location.href = 'mailto:support@example.com?subject=SwiftApply Pro Upgrade'
            }}
            variant="primary"
            fullWidth
          >
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  )
}