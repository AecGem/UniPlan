import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
console.log('Using the new UniPlan code!')

function App() {
  //const [count, setCount] = useState(0)
  const [showModal, setShowModal] = useState(false);

  return (
      <div className="app-container">
        <h1 className="heading">UniPlan: A Degree Planner</h1>
        <p className="description">
           Welcome to UniPlan, your personal degree-planning tool. Drag and drop courses, add semesters
           and keep track of your journey-all in one place.
        </p>

        <div className="button-container">
          <button onClick={()=> setShowModal(true)}>Get Planning!</button>
        </div>

        {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Log In</h2>
            <div className="login-form">
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <button>Log In</button>
              <p>
                Don’t have an account? <a href="#">Sign Up</a>
              </p>
            </div>
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
