"use client";

import { createContext, useContext, useRef, ReactNode } from "react";

interface AuthModalContextType {
  openLogin: () => void;
  openSignup: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within AuthModalProvider");
  }
  return context;
}

interface AuthModalProviderProps {
  children: ReactNode;
  loginModalRef?: React.RefObject<HTMLDialogElement | null>;
  signupModalRef?: React.RefObject<HTMLDialogElement | null>;
}

export function AuthModalProvider({
  children,
  loginModalRef,
  signupModalRef,
}: AuthModalProviderProps) {
  const openLogin = () => {
    loginModalRef?.current?.showModal();
  };

  const openSignup = () => {
    signupModalRef?.current?.showModal();
  };

  return (
    <AuthModalContext.Provider value={{ openLogin, openSignup }}>
      {children}
    </AuthModalContext.Provider>
  );
}
