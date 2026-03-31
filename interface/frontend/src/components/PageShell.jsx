import Navbar from './Navbar'
import Footer from './Footer'

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-sand text-ink relative overflow-hidden flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 right-[-10%] h-80 w-80 rounded-full bg-saffron/30 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-10%] h-96 w-96 rounded-full bg-leaf/20 blur-3xl" />
        <div className="absolute top-48 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-berry/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.7),_transparent_60%)]" />
      </div>
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
