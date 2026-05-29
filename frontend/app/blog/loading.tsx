import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      {/* Hero Section Skeleton */}
      <section className="relative w-full min-h-[50vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary/10 via-blue-50/50 to-purple-50/30 pt-20">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 mx-auto">
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-14 w-full max-w-xl mx-auto mb-6" />
            <Skeleton className="h-6 w-full max-w-lg mx-auto mb-8" />
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full py-8 border-b bg-background/95 backdrop-blur">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Skeleton className="h-10 w-full md:w-80" />
              <Skeleton className="h-10 w-10 hidden md:block" />
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-6 w-20" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Skeleton */}
      <section className="w-full py-16 bg-background">
        <div className="container px-4 md:px-6">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-80 mb-10" />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array(6)
              .fill(0)
              .map((_, idx) => (
                <div key={idx} className="border rounded-xl overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-4">
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-7 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
