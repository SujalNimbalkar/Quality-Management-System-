import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase";
import { toast } from "react-toastify";
import './Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      toast.success("User logged in Successfully", { position: "top-center" });
      if (onLogin) onLogin(user); // Call parent with user object
    } catch (error) {
      let message = "Login failed. Please try again.";
      if (error.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      } else if (error.code === "auth/user-not-found") {
        message = "No user found with this email.";
      } else if (error.code === "auth/invalid-email") {
        message = "Invalid email format.";
      }
      toast.error(message, { position: "bottom-center" });
    }
  };

  return (
    <div className="login-root">
      <form className="login-form" onSubmit={handleSubmit}>
        <h3 className="login-title">Login</h3>

        <div className="login-field-group">
          <label className="login-label">Email address</label>
          <input
            type="email"
            className="login-input"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="login-field-group">
          <label className="login-label">Password</label>
          <input
            type="password"
            className="login-input"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="login-btn-row">
          <button type="submit" className="login-btn">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;