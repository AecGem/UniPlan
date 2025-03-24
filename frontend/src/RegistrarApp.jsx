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
  console.log(session);
  //Wrapping this whole thing in a try-catch.
  //Can't access? Rough. Invalidate router and gtfo.
  try{
    if (session !== undefined) {
      if (session.session.user.usertype === false) {
        navigate({ to: '/registrant' })
      }
    }
  }
  catch (error) {
    console.error('Error fetching session:', error)
    router.invalidate();
    navigate({ to: '/' })
  }
  

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

  //const variable declarations
  const [numStudents, setNumStudents] = useState([0]);
  const [degrees, setDegrees] = useState([0]);
  const [selectedDegreeId, setSelectedDegreeId] = useState(0);
  const [courseNameShort, setCourseNameShort] = useState(["Empty"]);
  const [courseEnrollmentData, setCourseEnrollmentData] = useState([0]);


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


  //fetching data for current degree 'total entollment'
  useEffect(() => {
    const params = new URLSearchParams();
    params.append('didin', selectedDegreeId);
    const url = `/api/degree_count?didin=${selectedDegreeId}`;
    fetch(url)
      .then(res => res.json())
      .then(data => 
      {
        setNumStudents(data);
      })
      .catch(err => console.error('Error getting number of students for degree', err));
  }, [selectedDegreeId]);


//fetching the course enrollment list

useEffect(() => {
  const params = new URLSearchParams();
  params.append('didin', selectedDegreeId);
  const url = `/api/course_stats?didin=${selectedDegreeId}`;
  fetch(url)
    .then(res => res.json())
    .then(data => 
    {
      //setCourseNameShort(data.courseName.shortname);
      setCourseEnrollmentData(data);
    })
    .catch(err => console.error('Error getting Course Enrollment List', err));
}, [courseEnrollmentData]);



//handling functions for the dropdowns
const [degInfo, setDegInfo] = useState("0a"); // or "" if you prefer
const handleInfoChange = (degInfoValue) => 
  {
    setDegInfo(degInfoValue);  //Now we actually have `degree` state 
  }


/*---------------------------------------------------------------------------------------------------------------------------------*/

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
                      

                          <tr>
                            <td>{courseEnrollmentData.courseName.shortname}</td>
                            <td></td>
                            <td>{courseEnrollmentData.count}</td>
                          </tr>

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
                          <tr>
                            <td>{numStudents}</td>
                          </tr>
                         
                        </table>
                      </div>
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