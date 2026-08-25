/*import React from "react";*/
import "./AuthLayout.css";

/**
 * AuthLayout
 *
 * Reusable layout wrapper for authentication pages (Login, Register,
 * Forgot Password, etc). This component is purely presentational:
 * it centers whatever form is passed into it inside a clean,
 * card-style container.
 *
 * IMPORTANT:
 * - This component holds NO authentication logic.
 * - This component makes NO API calls.
 * - It simply arranges and styles its children.
 *
 * Usage:
 *   <AuthLayout title="Welcome back" subtitle="Log in to your account">
 *     <LoginForm />
 *   </AuthLayout>
 */
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__card">
        {title && <h1 className="auth-layout__title">{title}</h1>}
        {subtitle && <p className="auth-layout__subtitle">{subtitle}</p>}

        <div className="auth-layout__content">{children}</div>
      </div>
    </div>
  );
}

export default AuthLayout;