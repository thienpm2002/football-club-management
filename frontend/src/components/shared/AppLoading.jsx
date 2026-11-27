import { LoaderCircle } from 'lucide-react'

export default function AppLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
