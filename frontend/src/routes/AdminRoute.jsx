import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom';
import Loading from '../components/Loading';
import LoginPopup from '../components/LoginPopup';

function AdminRoute({children}) {
    const {user, isAuthenticated, loading} = useSelector(state => state.auth);

    if(loading) return <Loading/>

    if(!isAuthenticated) return <LoginPopup/>

    if(user.role!="ADMIN"){
        return <div className='text-center mt-20 text-red-500 font-semibold'>Access Denied</div>
    }
  return children;
}

export default AdminRoute