"use client";

import { FormEvent, RefObject, useState } from "react";
import { useRouter } from "next/navigation"


type AuthModalsProps = {
  loginModalRef: RefObject<HTMLDialogElement | null>;
  signupModalRef: RefObject<HTMLDialogElement | null>;
  onLoginSuccess?: (user: { id: string; email: string; name: string | null }) => void;
};

type FormState = {
  email: string;
  password: string;
  name: string;
}


const initialForm: FormState = {
  email: "",
  password: "",
  name: "",
};

export default function AuthModals({
  loginModalRef,
  signupModalRef,
  onLoginSuccess,
}: AuthModalsProps) {
  const router = useRouter();
  const [loginForm, setLoginForm] = useState<FormState>(initialForm);
  const [signupForm, setSignupForm] = useState<FormState>(initialForm);
  const [loginLoading, setLoginLoading] = useState(false);
  const [signupLoading, setSignupLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");

  const closeLoginModal = () => {
    loginModalRef.current?.close();
  };

  const closeSignupModal = () => {
    signupModalRef.current?.close();
  };

  const switchToSignup = () => {
    closeLoginModal();
    signupModalRef.current?.showModal();
  };

  
  const switchToLogin = () => {
    closeSignupModal();
    loginModalRef.current?.showModal();
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginForm.email.trim().toLowerCase(),
          password: loginForm.password,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setLoginError(data.message ?? "Login failed");
        return;
      }

      if (data?.user && onLoginSuccess) {
        onLoginSuccess(data.user);
      }

      setLoginForm(initialForm);
      closeLoginModal();
      router.refresh();
    } catch {
      setLoginError("Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSignupError("");
    setSignupSuccess("");
    setSignupLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupForm.email.trim().toLowerCase(),
          password: signupForm.password,
          name: signupForm.name.trim() || null,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSignupError(data.message ?? "Signup failed");
        return;
      }

      setSignupForm(initialForm);
      setSignupSuccess("Account created. Now you can log in.");
    } catch {
      setSignupError("Signup failed");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <>
      <dialog ref={loginModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4">Login</h3>
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <label className="form-control">
              <span className="label-text mb-1">Email</span>
              <input
                type="email"
                className="input input-bordered"
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Password</span>
              <input
                type="password"
                className="input input-bordered"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
              />
            </label>

            {loginError && <p className="text-error text-sm">{loginError}</p>}

            <div className="modal-action mt-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeLoginModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={loginLoading}>
                {loginLoading ? "Loading..." : "Login"}
              </button>
            </div>
          </form>
          <p className="text-sm opacity-75 mt-3">
            No account?{" "}
            <button type="button" className="link" onClick={switchToSignup}>
              Sign up
            </button>
          </p>
        </div>
        <button className="modal-backdrop" onClick={closeLoginModal}>
          close
        </button>
      </dialog>

      <dialog ref={signupModalRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-xl mb-4">Sign up</h3>
          <form className="flex flex-col gap-3" onSubmit={handleSignup}>
            <label className="form-control">
              <span className="label-text mb-1">Name (optional)</span>
              <input
                type="text"
                className="input input-bordered"
                value={signupForm.name}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Email</span>
              <input
                type="email"
                className="input input-bordered"
                value={signupForm.email}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Password</span>
              <input
                type="password"
                className="input input-bordered"
                value={signupForm.password}
                onChange={(e) =>
                  setSignupForm((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                minLength={6}
              />
            </label>

            {signupError && <p className="text-error text-sm">{signupError}</p>}
            {signupSuccess && (
              <p className="text-success text-sm">{signupSuccess}</p>
            )}

            <div className="modal-action mt-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={closeSignupModal}
              >
                Cancel
              </button>
              <button type="submit" className="btn" disabled={signupLoading}>
                {signupLoading ? "Loading..." : "Create account"}
              </button>
            </div>
          </form>
          <p className="text-sm opacity-75 mt-3">
            Already have an account?{" "}
            <button type="button" className="link" onClick={switchToLogin}>
              Login
            </button>
          </p>
        </div>
        <button className="modal-backdrop" onClick={closeSignupModal}>
          close
        </button>
      </dialog>
    </>
  );
}
