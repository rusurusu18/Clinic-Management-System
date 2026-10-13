import { useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DoctorProvider } from './contexts/DoctorContext.jsx';
import { DepartmentProvider } from './contexts/DepartmentContext.jsx';
import AppRouter from './Routes/AppRouter';
import { useAppDispatch } from './hooks/authHooks.js';
import { fetchProfile } from './Redux/slices/authSlice.js';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (localStorage.getItem('accessToken') || localStorage.getItem('auth_token')) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return (
    <ThemeProvider>
      <DoctorProvider>
        <DepartmentProvider>
          <AppRouter />
        </DepartmentProvider>
      </DoctorProvider>
    </ThemeProvider>
  );
}

export default App;