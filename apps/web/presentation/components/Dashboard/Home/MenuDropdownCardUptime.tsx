import { IoIosCreate, IoIosTrash } from 'react-icons/io'
import { GetUptimeDto } from '@/infraestructure/interfaces';

interface Props {
    isMenuOpen: boolean;
    setUptimes: (open: boolean) => void;
    setIsMenuOpen: (open: boolean) => void;
    uptimes: GetUptimeDto;
}

const MenuDropdownCardUptime = ({isMenuOpen, setIsMenuOpen, uptimes }: Props) => {
    const handleEdit = () => {
        setIsMenuOpen(false);
        console.log("Editar monitor:", uptimes.id);
        // TODO: Implement edit functionality
      };
    
      const handleDelete = () => {
        setIsMenuOpen(false);
        console.log("Eliminar monitor:", uptimes.id);
        // TODO: Implement delete functionality
      };

  return (
    <div className={`menu-dropdown ${isMenuOpen ? 'open' : ''}`}>
                    <button className="menu-item" onClick={handleEdit}>
                      <IoIosCreate className="menu-icon" size={16} />
                      <span className="menu-text">Editar monitor</span>
                    </button>
                    <button className="menu-item danger" onClick={handleDelete}>
                      <IoIosTrash className="menu-icon" size={16} />
                      <span className="menu-text">Eliminar monitor</span>
                    </button>
                  </div>
  )
}

export default MenuDropdownCardUptime
