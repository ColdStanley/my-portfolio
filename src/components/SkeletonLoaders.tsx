import { motion } from 'framer-motion'

export function HeroSkeleton() {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 relative overflow-hidden">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-purple-100/30 animate-pulse" />

      <div className="max-w-4xl mx-auto text-center relative z-20">
        {/* Title skeleton */}
        <div className="mb-6">
          <div className="h-16 md:h-20 lg:h-24 bg-gray-200 rounded-lg animate-pulse mb-4"></div>
          <div className="h-16 md:h-20 lg:h-24 bg-gray-200 rounded-lg animate-pulse w-3/4 mx-auto"></div>
        </div>

        {/* Subtitle skeleton */}
        <div className="mb-12">
          <div className="h-6 md:h-8 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
          <div className="h-6 md:h-8 bg-gray-200 rounded-lg animate-pulse w-2/3 mx-auto"></div>
        </div>

        {/* Buttons skeleton */}
        <div className="flex flex-wrap justify-center gap-4">
          <div className="w-40 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          <div className="w-40 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
      </div>
    </section>
  )
}

export function ProjectSkeleton({ reverse = false }: { reverse?: boolean }) {
  return (
    <section className="min-h-screen flex items-center px-6 py-20">
      <div className="max-w-7xl mx-auto w-full">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}>
          {/* Content skeleton */}
          <div className={`space-y-8 ${reverse ? 'lg:col-start-2' : ''}`}>
            {/* Title */}
            <div className="space-y-4">
              <div className="h-12 md:h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 md:h-16 bg-gray-200 rounded-lg animate-pulse w-3/4"></div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-2/3"></div>
            </div>

            {/* Benefits */}
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/3"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-gray-300 rounded-full mt-2 animate-pulse"></div>
                    <div className="h-5 bg-gray-200 rounded animate-pulse flex-1"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Button */}
            <div className="w-40 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Visual skeleton */}
          <div className={`${reverse ? 'lg:col-start-1' : ''}`}>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
              <div className="w-full h-80 bg-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function MoreProjectsSkeleton() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="h-12 md:h-16 bg-gray-200 rounded-lg animate-pulse w-1/2 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-1/3 mx-auto"></div>
        </div>

        {/* Projects grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20">
              {/* Project title */}
              <div className="h-8 bg-gray-200 rounded-lg animate-pulse mb-3"></div>

              {/* Subtitle */}
              <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3 mb-4"></div>

              {/* Description */}
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>

              {/* Tech */}
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mb-4"></div>

              {/* Button */}
              <div className="w-full h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PageSkeleton() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden">
      <HeroSkeleton />
      <ProjectSkeleton />
      <ProjectSkeleton reverse />
      <ProjectSkeleton />
      <MoreProjectsSkeleton />
    </main>
  )
}