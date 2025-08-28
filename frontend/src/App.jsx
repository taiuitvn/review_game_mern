import React from 'react';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './contexts/AuthContext';
import { ModalProvider } from './contexts/ModalContext';
import { NotificationProvider } from './contexts/NotificationContext';

import NotificationToast from './components/common/NotificationToast';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ModalProvider>
          <AppRouter />
          <NotificationToast />
        </ModalProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;