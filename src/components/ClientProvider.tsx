'use client';

import { TRPCReactProvider } from "~/trpc/react";

interface ClientProviderProps {
  children: React.ReactNode;
  home: React.ReactNode;
  professor: React.ReactNode;
  student: React.ReactNode;
  auth: React.ReactNode;
  showAuth: boolean;
}

export function ClientProvider({ 
  children, 
  home, 
  professor, 
  student, 
  auth, 
  showAuth 
}: ClientProviderProps) {
  return (
    <TRPCReactProvider>
      {showAuth ? (
        auth
      ) : (
        <>
          {home}
          {professor}
          {student}
          {children}
        </>
      )}
    </TRPCReactProvider>
  );
}