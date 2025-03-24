//import { useState } from 'react'
import './Registrar.css'
import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthAPI } from './apis/AuthAPI'
import { useRouter } from "@tanstack/react-router";
import { userInfo } from './utils/auth'
import { authClient } from './utils/auth'

export const App = (session) => {
  
  const router = useRouter();
  const navigate = useNavigate();
  /*
  if (userInfo.session.userId === null) {
    router.invalidate();
    navigate({ to: '/' })
  }
  */
  //data for the temp course tables
  const CourseTempdata = [
    { courseName: "CS100", numStudents: "125" },
    { courseName: "CS110", numStudents: "98" },
    { courseName: "CS115", numStudents: "72" },
  ]

  /*
  const electiveTempdata = [
    { courseName: "GEO100", numStudents: "66" },
    { courseName: "SCI099", numStudents: "3" },
    { courseName: "ASTR101", numStudents: "110" },
  ]
  */

  const TempDegreeEnrollmentdata = [
    { numStudents: "66" },
  ]

  //Here is a function that handles signout
  const handleSignOut = async () => {
    try {
      await AuthAPI.logOut()

      //Clear any tokens from localStorage or cookies
      localStorage.removeItem('token')
      //its http only :3
      //localStorage.removeItem('token');
      router.invalidate();
      navigate({ to: '/' })
    } catch (error) {
      console.error('Error signing out:', error)
      // Optionally show an error message or fallback
    }
  }

  // Fetch degrees from the backend when the component mounts
  useEffect(() => {
    const url = `/api/degree`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setDegrees(data);
        if (data.length > 0) {
          setSelectedDegreeId(0);
        }
      })
      .catch(err => console.error('Error fetching degrees:', err));
  }, []);


  //handling functions for the dropdowns
  const [degrees, setDegrees] = useState([0]);
  const [selectedDegreeId, setSelectedDegreeId] = useState(0);


  const [degInfo, setDegInfo] = useState("0a"); // or "" if you prefer
  const handleInfoChange = (degInfoValue) => 
  {
    setDegInfo(degInfoValue);  // Now we actually have `degree` state 
  }




/*---------------------------------------------------------------------------------*/





  return (
    <div className="page-container">
      <header className="subtitle">
        <h1>UniPlan: Registrar's Homepage</h1>
        <div class="topnav">
          <div className="sub-subtitle"> On this page the admin can view statistics related to degrees and enrollment </div>
        </div>
      </header>

      <div className="layout-wrapper">
        <div className="app-container">
          <div className="subtitle2">Select a Degree to View: </div>

          <div className="Degree-Dropdown">
            <label>Degree:&nbsp;</label>
            <select
              value={selectedDegreeId || ''}
              onChange={(e) => setSelectedDegreeId(Number(e.target.value))}
            >
              <option value="0">No Degree Selected</option>
              {degrees.map((deg) => (
                <option key={deg.did} value={deg.did}> {deg.degree} </option>
              ))}
            </select>

          </div>
          <div className="Info-Dropdown">
            <label>Information to Display:&nbsp;</label>
            <select value={degInfo} onChange={(e) => handleInfoChange(e.target.value)}>
              <option value="0a">No Criteria Selected </option>
              <option value="1a"> General Course Enrollment</option>
              <option value="2a">Total Degree Applicants</option>
              <option value="3a">Elective Course Enrollment</option>{/*Not sure if this is able to be done, can be removed if needed.*/}
              <option value="4a">Empty course info template</option>
            </select>
          </div>

          <br /><br />

          <div id="displayInfo" className="displayInfo" style={{ visibility: selectedDegreeId === 0 ? "hidden" : "Visible" }}>
            {selectedDegreeId !== 0 &&
              (
                <div className="courseInfo">
                  <div className="subtitle3">
                    Displaying information for your degree:</div>
                  {degInfo === "0a" &&
                    (
                      <div className="empty-info-placeholder"> [Please select what information you would like to display] </div>
                    )}
                  {degInfo === "1a" &&
                    (
                      <div className="courseTables">
                        <table>
                          <tr>
                            <th>Course Name</th>
                            <th></th>
                            <th>Number of Students Enrolled</th>
                          </tr>
                          {CourseTempdata.map((val, key) => {
                            return (
                              <tr key={key}>
                                <td>{val.courseName}</td>
                                <td></td>
                                <td>{val.numStudents}</td>
                              </tr>
                            )
                          })}
                        </table>
                      </div>
                    )}
                  {degInfo === "2a" &&
                    (
                      <div className="courseTables">
                        <table>
                          <tr>
                            <th>Total Degree Enrollment</th>
                          </tr>
                          {TempDegreeEnrollmentdata.map((val, key) => {
                            return (
                              <tr key={key}>
                                <td>{val.numStudents}</td>
                              </tr>
                            )
                          })}
                        </table>
                      </div>
                    )}
                  {degInfo === "3a" &&
                    (
                      <div className="courseTables">
                        <table>
                          <tr>
                            <th>Course Name</th>
                            <th></th>
                            <th>Number of Students Enrolled</th>
                          </tr>
                          {electiveTempdata.map((val, key) => {
                            return (
                              <tr key={key}>
                                <td>{val.courseName}</td>
                                <td></td>
                                <td>{val.numStudents}</td>
                              </tr>
                            )
                          })}
                        </table>
                      </div>
                    )}
                  {degInfo === "4a" &&
                    (
                      <div className="empty-info-placeholder"> [This is where you would display information in this empty template] </div>
                    )}
                </div>
              )}
          </div>
        </div>
      </div>
      <div className="footer">
        <button className="sign-out" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default App;