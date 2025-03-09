import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [showModal, setShowModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);

  const toggleMode = () => {
    setIsLoginMode((prevMode) => !prevMode);
  };

  return (
    <div className="app-container">
      <h1 className="heading">UniPlan: A Degree Planner</h1>
      <p className="description">
        Welcome to UniPlan, your personal degree-planning tool. 
        Drag and drop courses, add semesters, and keep track of your journey—all in one place.
      </p>

      <div className="button-container">
        <button className="get-planning-btn" onClick={() => setShowModal(true)}>
          Get Planning!
        </button>
      </div>

      {/* If showModal is true, display the modal */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            {isLoginMode ? (
              <>
                <h2>Log In</h2>
                <div className="login-form">
                  <input type="email" placeholder="Email" />
                  <input type="password" placeholder="Password" />
                  <button>Log In</button>
                  <p>
                    Don’t have an account? &nbsp;
                    <button className="switch-button" onClick={toggleMode}>
                      Sign Up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2>Sign Up</h2>
                <div className="login-form">
                  <input type="email" placeholder="Email" />
                  <input type="password" placeholder="Password" />
                  <button>Sign Up</button>
                  <p>
                    Already have an account? &nbsp;
                    <button className="switch-button" onClick={toggleMode}>
                      Log In
                    </button>
                  </p>
                </div>
              </>
            )}

            <button className="close-button" onClick={() => setShowModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
