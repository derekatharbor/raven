// app/app/layout.tsx
import "./app.css"

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="app-light-mode h-[100dvh] overflow-hidden">
      {children}
    </div>
  )
}