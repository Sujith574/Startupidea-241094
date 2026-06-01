import { Navigate } from 'react-router-dom';

export default function AdminGuard({ children }) {
  const token = localStorage.getItem('pb_token');
  const userString = localStorage.getItem('pb_user');
  
  if (!token || !userString) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const user = JSON.parse(userString);
    if (user.role !== 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
  } catch (e) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
