import { useState } from 'react'
import './Registrar.css'


  const App = () => {
    //data for the temp course tables
    const CourseTempdata = [
      { courseName: "CS100", numStudents: "125" },
      { courseName: "CS110",  numStudents: "98" },
      { courseName: "CS115",  numStudents: "72" },
    ]
    //temp data for empty degree
    const electiveTempdata = [
      { courseName: "GEO100", numStudents: "66" },
      { courseName: "SCI099",  numStudents: "3" },
      { courseName: "ASTR101",  numStudents: "110" },
    ]
     const TempDegreeEnrollmentdata = [
      {numStudents: "66"},
    ]
  
    // State for items in Box 2
    const [box2Items, setBox2Items] = useState([]);
  
    // Function to handle the start of a drag operation
    const handleDragStart = (e, item) => {
      // Set the data being dragged as
      // text/plain with the serialized item
      e.dataTransfer
        .setData('text/plain', JSON.stringify(item));
    };
  
    // Function to handle the drag over event
    const handleDragOver = (e) => {
      // Prevent the default behavior to allow dropping
      e.preventDefault();
    };
  
    // Function to handle the drop event
    const handleDrop = (e, targetBox) => {
      // Prevent the default behavior 
      // to avoid unwanted behavior
      e.preventDefault();
  
      // Parse the dropped item from the dataTransfer
      const droppedItem = JSON.parse(
        e.dataTransfer
          .getData('text/plain')
      );
  
      // Check the target box and 
      // update the state accordingly
      if (targetBox === 'box1') {
        // Check if the same item is already present in Box 1
        let isSameItemPresent = box1Items.some(
          item => item.id === droppedItem.id
            && item.text === droppedItem.text
        );
  
        // Update the state of Box 1 
        // and remove the item from Box 2
        setBox1Items((prevItems) =>
          //If the same item is already present in Box 1 then 
          //again don't add that item 
          // else add the new item in Box 1
          isSameItemPresent ?
            [...prevItems] :
            [...prevItems, droppedItem]
        );
        setBox2Items((prevItems) =>
          //Remove the dragged item from Box 2
          prevItems.filter(
            (item) =>
              item.id !== droppedItem.id
          )
        );
      } else if (targetBox === 'box2') {
        // Check if the same item is already present in Box 2
        let isSameItemPresent = box2Items.some(
          item => item.id === droppedItem.id
            && item.text === droppedItem.text
        );
  
        // Update the state of Box 2 and remove the item from Box 1
        setBox2Items((prevItems) =>
          //If the same item is already 
          // present in Box 2 then 
          //again don't add that item 
          // else add the new item in Box 2
          isSameItemPresent ?
            [...prevItems] :
            [...prevItems, droppedItem]
        );
        setBox1Items((prevItems) =>
          //Remove the dragged item from Box 1
          prevItems.filter(
            (item) =>
              item.id !== droppedItem.id
          )
        );
      }
    };

    
    const [degree, setDegree] = useState("1"); // or "" if you prefer
    const handleDegreeChange = (degreeValue) => 
      {
        setDegree(degreeValue);  // Now we actually have `degree` state 
      }

    const [degInfo, setDegInfo] = useState("0a"); // or "" if you prefer
    const handleInfoChange = (degInfoValue) => 
      {
        setDegInfo(degInfoValue);  // Now we actually have `degree` state 
      }

  return (
    <div className="page-container">
      <header className="subtitle">
        <h1>UniPlan: Registrar's Homepage</h1>
        <div class="topnav">
          <a class="active" href="#plan">Plan</a>
          <a href="#profile">Profile</a>
          <a href="#saved">Saved</a>
          <a href="#settings">Settings</a>
        </div>
      </header>
      
      <div className="layout-wrapper">
        <div className="app-container">
          <div className="subtitle2">Select a Degree to View: </div>

          <div className="Degree-Dropdown">
            <label>Degree:&nbsp;</label>
            <select value={degree} onChange={(e) => handleDegreeChange(e.target.value)}>
              <option value="1">No Degree Selected</option>
              <option value="2">Put Degree Variable Here</option>
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

          <div id="displayInfo" className="displayInfo" style={{visibility : degree === "1" ? "hidden" : "Visible"}}>
            {degree ==="2" && 
              (
                <div className="courseInfo">
                  <div className="subtitle3">
                   Displaying information for your degree:</div>
                      {degInfo ==="0a" && 
                      (
                        <div className = "empty-info-placeholder"> [Please select what information you would like to display] </div>
                      )}
                      {degInfo ==="1a" && 
                      (
                        <div className = "courseTables"> 
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
                      {degInfo ==="2a" && 
                      (
                        <div className = "courseTables"> 
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
                      {degInfo ==="3a" && 
                      (
                        <div className = "courseTables"> 
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
                      {degInfo ==="4a" && 
                      (
                        <div className = "empty-info-placeholder"> [This is where you would display information in this empty template] </div>
                      )}
                    </div>
              )}
            </div>
          </div>  
        </div>
      </div>
  ); 
}

export default App;