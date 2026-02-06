import React, { useState } from "react";

function LoginSignup({ setStep, setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return regex.test(email) ? "" : "Please enter a valid email address";
  };

  const validatePassword = (password) => {
    return password.length < 6 ? "Password must be at least 6 characters" : "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    return password !== confirmPassword ? "Passwords don't match" : "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email) newErrors.email = "Email is required";
    else {
      const emailError = validateEmail(form.email);
      if (emailError) newErrors.email = emailError;
    }
    
    if (!form.password) newErrors.password = "Password is required";
    else {
      const passwordError = validatePassword(form.password);
      if (passwordError) newErrors.password = passwordError;
    }
    
    if (!isLogin) {
      if (!form.name) newErrors.name = "Name is required";
      
      if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
      else {
        const confirmError = validateConfirmPassword(form.password, form.confirmPassword);
        if (confirmError) newErrors.confirmPassword = confirmError;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  setLoading(true);
  
  try {
    const endpoint = isLogin ? 'http://localhost:8080/login' : 'http://localhost:8080/register';
    const requestData = isLogin 
      ? { email: form.email, password: form.password }
      : { name: form.name, email: form.email, password: form.password };
      
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Authentication failed');
    }
    
    const userData = await response.json();
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setStep("home");
  } catch (error) {
    setErrors({ submit: error.message || "Authentication failed. Please try again." });
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 24, background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
      <div style={{ display: "flex", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          style={{ 
            flex: 1, 
            padding: 10, 
            background: isLogin ? "#ff9800" : "#eee", 
            border: "none", 
            cursor: "pointer",
            borderRadius: "4px 0 0 4px"
          }}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          style={{ 
            flex: 1, 
            padding: 10, 
            background: !isLogin ? "#ff9800" : "#eee", 
            border: "none", 
            cursor: "pointer",
            borderRadius: "0 4px 4px 0"
          }}
        >
          Sign Up
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, color: "#333" }}>Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter your name"
              style={{ 
                width: "100%", 
                padding: 10, 
                border: errors.name ? "1px solid #f44336" : "1px solid #ccc", 
                borderRadius: 4,
                color: "#333",
                backgroundColor: "#f9f9f9"
              }}
            />
            {errors.name && <p style={{ color: "#f44336", margin: "4px 0 0", fontSize: 14 }}>{errors.name}</p>}
          </div>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, color: "#333" }}>Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            style={{ 
              width: "100%", 
              padding: 10, 
              border: errors.email ? "1px solid #f44336" : "1px solid #ccc", 
              borderRadius: 4,
              color: "#333",
              backgroundColor: "#f9f9f9"
            }}
          />
          {errors.email && <p style={{ color: "#f44336", margin: "4px 0 0", fontSize: 14 }}>{errors.email}</p>}
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 4, color: "#333" }}>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            style={{ 
              width: "100%", 
              padding: 10, 
              border: errors.password ? "1px solid #f44336" : "1px solid #ccc", 
              borderRadius: 4,
              color: "#333",
              backgroundColor: "#f9f9f9"
            }}
          />
          {errors.password && <p style={{ color: "#f44336", margin: "4px 0 0", fontSize: 14 }}>{errors.password}</p>}
        </div>
        
        {!isLogin && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 4, color: "#333" }}>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              style={{ 
                width: "100%", 
                padding: 10, 
                border: errors.confirmPassword ? "1px solid #f44336" : "1px solid #ccc", 
                borderRadius: 4,
                color: "#333",
                backgroundColor: "#f9f9f9"
              }}
            />
            {errors.confirmPassword && <p style={{ color: "#f44336", margin: "4px 0 0", fontSize: 14 }}>{errors.confirmPassword}</p>}
          </div>
        )}
        
        {errors.submit && <p style={{ color: "#f44336", margin: "4px 0 16px", fontSize: 14 }}>{errors.submit}</p>}
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: 12, 
            background: "#ff9800", 
            color: "#fff", 
            border: "none", 
            borderRadius: 4, 
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Processing..." : (isLogin ? "Login" : "Sign Up")}
        </button>
      </form>
    </div>
  );
}

export default LoginSignup;
