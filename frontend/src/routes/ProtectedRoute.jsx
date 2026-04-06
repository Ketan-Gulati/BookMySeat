import { useSelector } from "react-redux"

function ProtectedRoute({children}) {
    const {loading, isAuthenticated} = useSelector(state => state.auth)

    if(loading) return <Loading/>

    if(!isAuthenticated){
         return <LoginPopup/>
    } 

  return children;
}

export default ProtectedRoute