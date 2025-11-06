import React from 'react';
import AppRouter from './router/appRouter.js';
import { AuthProvider } from './Authcontext.js';

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
