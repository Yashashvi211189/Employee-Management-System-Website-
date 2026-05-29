import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section Skeleton */}
      <section className="relative w-full min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-primary/5 via-blue-50/30 to-purple-50/20">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Skeleton className="h-12 w-64 mx-auto mb-6" />
            <Skeleton className="h-8 w-96 mx-auto mb-8" />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40 rounded-full" />
              <Skeleton className="h-12 w-40 rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Product Skeleton */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-1 w-20 mb-6" />
              <Skeleton className="h-24 w-full mb-6" />
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="relative">
              <Skeleton className="w-full aspect-video rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase Skeleton */}
      <section className="w-full py-20 md:py-32 bg-blue-50/30">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-6" />
            <Skeleton className="h-1 w-24 mx-auto mb-8" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
              {Array(7)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
            </div>
            <div className="md:col-span-2">
              <Skeleton className="w-full h-80 rounded-2xl mb-6" />
              <Skeleton className="w-full h-32 mb-6" />
              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Skeleton */}
      <section className="w-full py-20 md:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-96 mx-auto mb-6" />
            <Skeleton className="h-1 w-24 mx-auto mb-8" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {Array(6)
              .fill(null)
              .map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-2xl" />
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
