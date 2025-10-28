import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/reducers/authSlice';
import { Button } from '@/components/ui/button';

const Header = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <header className="bg-gray-800 text-white p-4 shadow-md">
      <nav className="container mx-auto flex justify-between items-center">
        
        {/* ✅ Chill Café Logo */}
        <Link
          to="/"
          className="text-3xl font-extrabold tracking-wide text-white 
                     hover:text-yellow-400 transition-all duration-300 
                     hover:scale-105"
        >
          Chill Café
        </Link>

        <div className="space-x-4 flex items-center">
          <Link to="/menu" className="hover:text-yellow-400 transition duration-300">
            Menu
          </Link>
          <Link to="/reservation" className="hover:text-yellow-400 transition duration-300">
            Đặt bàn
          </Link>
          <Link to="/order" className="hover:text-yellow-400 transition duration-300">
            Order
          </Link>

          {user ? (
            <>
              <Link
                to="/profile"
                className="hover:text-yellow-400 transition duration-300 font-semibold"
              >
                {user.name}
              </Link>

              <Button
                variant="outline"
                className="text-black bg-white hover:bg-yellow-400 transition duration-300"
                onClick={handleLogout}
              >
                Đăng xuất
              </Button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-yellow-400 transition duration-300 font-semibold"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                className="hover:text-yellow-400 transition duration-300 font-semibold"
              >
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
