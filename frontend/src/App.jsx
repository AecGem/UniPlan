import { useState } from "react";
import "./App.css";
import { AuthAPI } from "./apis/AuthAPI";
import { useNavigate } from "@tanstack/react-router";


export function App({ context }) {
  const [showModal, setShowModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signUpUserType, setUserType] = useState("user");
  const [signupForm, setSignupForm] = useState({
    firstName: "", //optional input
    lastName: "", //optional input
    userEmail: "", //required input
    password: "", //required input
    confirmPassword: "", //required input
    userType: "", // required radio input
  });

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Get the navigate function from TanStack Router

  const toggleMode = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setErrorMessage("");
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter an Email and Password.");
      return;
    }

    AuthAPI.login(loginEmail, loginPassword);
    // Instead of window.location.href, use navigate:
    if (signUpUserType === "admin") {
      navigate({ to: "/registrar" });
    } else {
      navigate({ to: "/registrant" });
    }

    setLoginEmail("");
    setLoginPassword("");
    setErrorMessage("");
    setShowModal(false);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (
      !signupForm.userEmail ||
      !signupForm.password ||
      !signupForm.confirmPassword
    ) {
      setErrorMessage("Email and Password are required.");
      return;
    }
    if (signupForm.password != signupForm.confirmPassword) {
      setErrorMessage("Passwords don't match!");
      return;
    }

    AuthAPI.signup(
      signupForm.userEmail,
      signupForm.password,
      signupForm.firstName.concat(" ", signupForm.lastName),
      signupForm.userType === "admin"
    );
    if (signUpUserType === "admin") {
      navigate({ to: "/registrar" });
    } else {
      navigate({ to: "/registrant" });
    }

    setSignupForm({
      userEmail: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      userType: "user",
    });
    setErrorMessage("");
    setShowModal(false);
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="app-container">
      <h1 className="heading">UniPlan: A Degree Planner</h1>
      <p className="description">
        Welcome to UniPlan, your personal degree-planning tool. Drag and drop
        courses, add semesters, and keep track of your journey-all in one place.
      </p>

      <div className="button-container">
        <button
          className="get-planning-btn"
          onClick={() => {
            if (context.check()) {
              if (context.userType === "admin") {
                navigate({ to: "/registrar" });
              } else {
                navigate({ to: "/registrant" });
              }
            } else {
              setShowModal(true);
            }
          }}
        >
          Get Planning!
        </button>
      </div>

      {/* If showModal is true, display the modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {errorMessage && (
              <div className="error-message">{errorMessage}</div>
            )}

            {isLoginMode ? (
              <>
                <h2>Log In</h2>
                <form className="login-form" onSubmit={handleLoginSubmit}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button type="submit">Log In</button>
                </form>

                <p>
                  Don't have an account? &nbsp;
                  <button className="switch-button" onClick={toggleMode}>
                    Sign Up
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2>Sign Up</h2>
                <form className="signup-form" onSubmit={handleSignupSubmit}>
                  <input
                    type="email"
                    placeholder="Email (required)"
                    name="userEmail"
                    value={signupForm.userEmail}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="text"
                    placeholder="First Name (optional)"
                    name="firstName"
                    value={signupForm.firstName}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="text"
                    placeholder="Last Name (optional)"
                    name="lastName"
                    value={signupForm.lastName}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="password"
                    placeholder="Password (required)"
                    name="password"
                    value={signupForm.password}
                    onChange={handleSignupChange}
                  />
                  <input
                    type="password"
                    placeholder="Re-Enter Password"
                    name="confirmPassword"
                    value={signupForm.confirmPassword}
                    onChange={handleSignupChange}
                  />
                  <div className="user-type-options">
                    <label>
                      <input
                        type="radio"
                        name="userType"
                        value="user"
                        checked={signUpUserType === "user"}
                        onChange={(e) => setUserType(e.target.value)}
                      />
                      Student
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="userType"
                        value="admin"
                        checked={signUpUserType === "admin"}
                        onChange={(e) => setUserType(e.target.value)}
                      />
                      Admin
                    </label>
                  </div>
                  <button type="submit">Sign Up</button>
                </form>

                <p>
                  Already have an account? &nbsp;
                  <button className="switch-button" onClick={toggleMode}>
                    Log In
                  </button>
                </p>
              </>
            )}

            {/* Close modal button */}
            <button
              className="close-button"
              onClick={() => {
                setShowModal(false);
                setErrorMessage("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
