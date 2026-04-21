"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import AuthModals from "@/app/components/auth/AuthModals";
import { AuthModalProvider } from "@/app/context/AuthModalContext";


type CurrentUser = {
  id: string;
  email: string;
  name: string | null;
};

interface NavbarProps {
  children: ReactNode;
}

function NavbarContent({ children }: NavbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginModalRef = useRef<HTMLDialogElement>(null);
  const signupModalRef = useRef<HTMLDialogElement>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);

  useEffect(() => {
    let isActive = true;

    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me", { method: "GET" });
        if (!isActive) return;

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data?.user ?? null);
      } catch {
        if (isActive) setUser(null);
      } finally {
        if (isActive) setAuthLoading(false);
      }
    }

    fetchCurrentUser();
    return () => {
      isActive = false;
    };
  }, [])

  useEffect(() => {
    if (searchParams.get("login") === "true" && !user && !authLoading) {
      loginModalRef.current?.showModal();
      router.replace("/");
    }
  }, [searchParams, user, authLoading, router])

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/");
      router.refresh();
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <>
      <div className="navbar shadow-sm top-0 z-50">
        <div className="navbar-start ml-5">

          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors group"
          >
            <div className="brightness-90 group-hover:brightness-110 transition-all">
              <Image src="/Logo.png" alt="Logo" width={50} height={50} />
            </div>
            <span className="text-xl font-bold justify-center">Cue</span>
          </Link>

        </div>
        <div className="navbar-center hidden md:flex gap-4">
          {!authLoading && user ? (
            <Link href="/write-prompt" className="btn btn-ghost">
              Create
            </Link>
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => loginModalRef.current?.showModal()}
              disabled={authLoading}
            >
              Create
            </button>
          )}
          <Link href="/my-prompts" className="btn btn-ghost">
            Prompts
          </Link>

        </div>
        <div className="navbar-end gap-2">
          {!authLoading && user ? (
            <>
              <span className="text-sm opacity-80 mr-1">
                Hello, {user.name || user.email}
              </span>
              <button className="btn btn-ghost" onClick={handleLogout} disabled={logoutLoading}>
                {logoutLoading ? "Loading..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <button className="btn" onClick={() => loginModalRef.current?.showModal()}>
                Login
              </button>
              <button
                className="btn btn-ghost"
                onClick={() => signupModalRef.current?.showModal()}
              >
                Signup
              </button>
            </>
          )}
        </div>
        <AuthModals
          loginModalRef={loginModalRef}
          signupModalRef={signupModalRef}
          onLoginSuccess={setUser}
        />
      </div>
      <AuthModalProvider loginModalRef={loginModalRef} signupModalRef={signupModalRef}>
        {children}
      </AuthModalProvider>
    </>
  );
}

export default function NavbarWithProvider({ children }: NavbarProps) {
  return <NavbarContent>{children}</NavbarContent>;
}
