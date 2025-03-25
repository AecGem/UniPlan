import { useState } from "react";
import "./App.css";
import { AuthAPI } from "./apis/AuthAPI";
import { useNavigate } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";



export function App({ context }) {
  const router = useRouter();
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
  console.log(context);
  //Log signupform user type
  console.log(signupForm.userType);

  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate(); // Get the navigate function from TanStack Router

  const toggleMode = () => {
    setIsLoginMode((prevMode) => !prevMode);
    setErrorMessage("");
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setErrorMessage("Please enter an Email and Password.");
      return;
    }
    let logInData;
    try {
      logInData = await AuthAPI.login(loginEmail, loginPassword);
      console.log("logInData returned:", logInData);
    } catch (err) {
      console.error("AuthAPI.login error:", err);
      setErrorMessage("Something went wrong during login!");
      return;
    }

    if (logInData && logInData.errorMessage === "INVALID_EMAIL_OR_PASSWORD") {
      setErrorMessage("Incorrect Email or Password");
      return;
    }

    //Check error before
    if (signupForm.signUpUserType === "admin") {
      router.invalidate({session: logInData.data.user});
      navigate({ to: "/registrar" });
    } else {
      router.invalidate({session: logInData.data.user});
      navigate({ to: "/registrant" });
    }

    setLoginEmail("");
    setLoginPassword("");
    setErrorMessage("");
    setShowModal(false);
  };

  const handleSignupSubmit = async (e) => {
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

    let signUpData = await AuthAPI.signup(
      signupForm.userEmail,
      signupForm.password,
      signupForm.firstName.concat(" ", signupForm.lastName),
      signupForm.userType === "admin"
    );
    if (signupForm.signUpUserType === "admin") {
      router.invalidate({session : signUpData.data.user});
      navigate({ to: "/registrar" });
    } else {
      router.invalidate({session : signUpData.data.user});
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
                if (context.user.usertype === true) {
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
                          checked={signupForm.userType === "user"}
                          onChange={handleSignupChange}
                        />
                        Student
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="userType"
                          value="admin"
                          checked={signupForm.userType === "admin"}
                          onChange={handleSignupChange}
                        />
                        Admin
                      </label>
                    </div>
                    <button type="submit">Sign Up</button>
                    <p>Passwords must be 8 characters or more</p>
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