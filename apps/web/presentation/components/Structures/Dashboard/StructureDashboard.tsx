import Link from 'next/link';

import { AuthLogo } from '../../auth/AuthLogo';
import CategoriesDashboard from '../../Dashboard/Categories';
import LogoutProfile from '../../Dashboard/LogoutProfile';

import "./StructureDashboard.scss"

interface Props {
    children: React.ReactNode;
}

const ENDPOINT_INDEX = "/dashboard/home" 

const StructureDashboard = ({ children }: Props) => {
  return (
    <div className='dashboard'>
      <aside className='dashboard-section' aria-label='Barra lateral de navegación'>
        <nav className='logo-categories-dashboard' aria-label='Navegación principal'>
          <Link href={ENDPOINT_INDEX} className='link-to-index'>
            <AuthLogo />
            <CategoriesDashboard />
          </Link>
        </nav>
        <div role='complementary'>
          <LogoutProfile />
        </div>
      </aside>
      <main className='dashboard-content' role='main'>
        {children}
      </main>
    </div>
  )
}

export default StructureDashboard;
