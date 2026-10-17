import Navbar from './Navbar'
import Footer from './Footer'

export default function PageShell({ children }) {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />
      <main className="relative z-10 mx-auto w-full max-w-6xl flex-1 px-4 sm:px-6 pb-20 pt-6 animate-fade-in">
        {children}
      </main>
      <Footer />
    </div>
  )
}
