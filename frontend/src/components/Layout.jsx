import Navbar from './Navbar'

export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  )
}
