import { useNavigate } from 'react-router-dom'
import { Home as HomeIcon, MenuBook } from '../components/Icons'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div className="not-found">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">Page Not Found</h1>
        <p className="not-found-desc">
          Looks like this page got too crispy. Let's get you back to the good stuff.
        </p>
        <div className="not-found-actions">
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            <HomeIcon size={18} /> Back to Home
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/menu')}>
            <MenuBook size={18} /> Browse Menu
          </button>
        </div>
      </div>
    </div>
  )
}
