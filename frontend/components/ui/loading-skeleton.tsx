import { cn } from "@/lib/utils"

interface LoadingSkeletonProps {
  className?: string
  variant?: "default" | "card" | "text" | "circle" | "avatar"
}

export function LoadingSkeleton({ className, variant = "default" }: LoadingSkeletonProps) {
  const baseStyles = "animate-pulse bg-muted rounded"
  
  const variantStyles = {
    default: "h-4 w-full",
    card: "h-48 w-full rounded-lg",
    text: "h-3 w-3/4",
    circle: "h-12 w-12 rounded-full",
    avatar: "h-16 w-16 rounded-full"
  }

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} />
  )
}

export function PageLoadingState() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <LoadingSkeleton variant="card" />
        <LoadingSkeleton variant="text" />
        <LoadingSkeleton variant="text" className="w-1/2" />
      </div>
    </div>
  )
}


