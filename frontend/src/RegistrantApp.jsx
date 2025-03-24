// RegistrantApp.jsx
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthAPI } from './apis/AuthAPI'
import './Registrant.css'
import { useRouter } from "@tanstack/react-router";
import { userInfo } from './utils/auth'
import { authClient } from './utils/auth'

// Collapsible Section Sub-Component
function CollapsibleSection({ title, items, onDragStartAside }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => {
    setExpanded((prev) => !(prev));
  };

  return (
    <div className="collapsible-section">
      {/* Button showing arrow and title */}
      <button className="collapsible-header" onClick={toggleExpand}>
        {expanded ? '▼' : '▶'} {title}
      </button>

      {/* If expanded, show the list of requirements */}
      {expanded && (
        <ul className="requirement-list">
          {items.map((course) => (
            <li
              key={course.cId}
              draggable
              onDragStart={(e) => onDragStartAside(e, course)}
            >
              {course.shortname}: {course.coursename}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Main App Component
export default function App(session) {
  /** ---------------------------
    *  SEMESTERS + COURSES STATE
    *  Each semester in 'semesters' has this shape:
    *  {
    *    id: number,
    *    year: number,
    *    courses: [{ id: string, text: string }, ...]
    *  }
    *  The 'courses' array holds the courses the user has 
    *  dragged in. 
    * ---------------------------*/
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();
  const router = useRouter();
  const [degrees, setDegrees] = useState([]);
  const [selectedDegreeId, setSelectedDegreeId] = useState('');
  const [verification, setVerify] = useState([]);

  console.log(session);
  //Check to see if a homie is logged in. If not logged in, gtfo.
  /*
  if (userInfo.session.userId === null) {
    router.invalidate();
    navigate({ to: '/' })
  }
    */

  // Fetch courses from the backend when the component mounts
  //useEffect(() => {
    //const didin = 1;
    //const params = new URLSearchParams();
    //params.append('didin', didin);
    //const url = `/api/course?${params.toString()}`;
    //fetch(url)
      //.then(res => res.json())
      //.then(data => {
        //setCourses(data);
      //})
      //.catch(err => console.error('Error fetching courses:', err));
  //}, []);

  // Fetch degrees from the backend when the component mounts
  useEffect(() => {
    const url = `/api/degree`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setDegrees(data);
        //if (data.length > 0){
          //setSelectedDegreeId(data[0].did);
        //}
      })
      .catch(err => console.error('Error fetching degrees:', err));
  }, []);

  // Fetching courses based on the selected degree
  useEffect(() => {
    if (!selectedDegreeId) {
      // skip if ""
      return;
    }
      const params = new URLSearchParams();
      params.append('didin', selectedDegreeId);
      const url = `/api/course?${params.toString()}`;
      fetch(url)
        .then(res => res.json())
        .then(data => setCourses(data))
        .catch(err => console.error('Error fetching courses for degree:', err));
  }, [selectedDegreeId]);

  // Fetch verification from the backend when the component mounts
  useEffect(() => {
    const url = `/api/verification`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setVerify(data);
      })
      .catch(err => console.error('Error fetching verification:', err));
  }, []);

  /** ---------------------------
   *  MODAL STATE (Add/Edit)
   * ---------------------------*/
  const [showModal, setShowModal] = useState(false);
  const [showDescModal, setShowDescModal] = useState(false);
  const [showValidModal, setShowValidModal] = useState(false);
  const [descCourse, setDescCourse] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempSemesterId, setTempSemesterId] = useState(null); // track which semester we're editing
  const [selectedType, setSelectedType] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [courseBeingEdited, setCourseBeingEdited] = useState(null);


  // A small helper to sign out (navigate back to '/')
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

  /** ---------------------------
   *  DRAG & DROP HANDLERS
   * ---------------------------*/
  // 1) Drag from the aside (strings only), converting it into 
  // an object { id, text } so we can store it in 'sem.courses'.
  const handleDragStartAside = (e, courseObj) => {
    const newCourse = {
      ...courseObj,
      id: Date.now().toString(), // or use cId if prefer
      status: '',
    }

    const payload = {
      course: newCourse,
      sourceSemId: null,
    }
    e.dataTransfer.setData('application/json', JSON.stringify(payload))
  }


  // 2) Drag from within a semester
  const handleDragStartSemester = (e, courseObj, sourceSemId) => {
    const payload = { course: courseObj, sourceSemId };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  // 3) onDragOver to allow dropping
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // 4) onDrop: remove from old place and add to the new 
  // semester. The "targetSemId" is whichever semester was dropped onto.
  const handleDrop = (e, targetSemId) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    let payload;
    try {
      payload = JSON.parse(rawData);
    } catch (err) {
      return; // not valid data
    }

    const { course, sourceSemId } = payload;
    if (!course) return;

    // Update 'semesters' in local state
    setSemesters((prev) => {
      let updated = [...prev];

      // If it came from another semester, remove it from that semester's courses.
      if (sourceSemId) {
        updated = updated.map((sem) => {
          if (sem.id === sourceSemId) {
            return {
              ...sem,
              courses: sem.courses.filter((c) => c.id !== course.id),
            };
          }
          return sem;
        });
      }

      // Now add it to the target semester, if it's not already there
      updated = updated.map((sem) => {
        if (sem.id === targetSemId) {
          // Check duplicates
          const alreadyThere = sem.courses.some((c) => c.id === course.id);
          if (!alreadyThere) {
            return {
              ...sem,
              courses: [...sem.courses, course],
            };
          }
        }
        return sem;
      });
      return updated;
    });
  };

  const openEditCourseModal = (semesterId, courseObj) => {
    setCourseBeingEdited({ semesterId, ...courseObj });
    setShowEditCourseModal(true);
  };

  const handleSaveCourseEdits = (updatedInfo) => {
    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id !== updatedInfo.semesterId) return sem;

        return {
          ...sem,
          courses: sem.courses.map((c) =>
            c.id === updatedInfo.id
              ? {
                ...c,
                text: updatedInfo.text,
                status: updatedInfo.status // Save the new status
              }
              : c
          ),
        };
      })
    );
    setShowEditCourseModal(false);
    setCourseBeingEdited(null);
  };



  /** ---------------------------
   *  HELPER: Remove Single Course
   * ---------------------------*/
  const removeSingleCourse = (semesterId, courseId) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? {
            ...sem,
            courses: sem.courses.filter((c) => c.id !== courseId),
          }
          : sem
      )
    );
  };

  /** ---------------------------
   *  Check Degree Validity
   * ---------------------------*/
  const checkValid = () => {
    setShowValidModal(true);
  };

  /** ---------------------------
   *  SEMESTER MODAL HANDLERS
   * ---------------------------*/
  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedType('Fall');
    setSelectedYear('2025');
    setTempSemesterId(null);
    // Simply open the modal without creating a semester record immediately.
    setShowModal(true);
  };
  
  const handleConfirmAddSemester = async () => {  
    const payload = {
      userid: userInfo.session ? userInfo.session.userId : null
    };

    try {
      const res = await fetch('/api/createSemester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        throw new Error("Failed to create semester");
      }
      const data = await res.json();
      console.log("Created semester with sem_id:", data.sem_id);

      // Add the new semester to local state, storing the returned sem_id
      const newSem = {
        id: Date.now(), // local identifier
        sem_id: data.sem_id, // backend's unique semester id
        type: selectedType,
        year: selectedYear,
        courses: []
      };
      setSemesters((prev) => [...prev, newSem]);

      setShowModal(false);
    } catch (err) {
      console.error("Error creating semester:", err);
    }
  };


  const handleOpenEditModal = (sem) => {
    setIsEditMode(true);
    setSelectedType(sem.type);
    setSelectedYear(sem.year);
    setTempSemesterId(sem.id);
    setShowModal(true);
  };

  const handleSaveSemester = () => {
    if (isEditMode && tempSemesterId != null) {
      // Update an existing semester
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === tempSemesterId
            ? { ...sem, type: selectedType, year: selectedYear }
            : sem
        )
      );
    } else {
      // Add a new semester
      const newSem = {
        id: Date.now(),
        type: selectedType,
        year: selectedYear,
        courses: []
      };
      setSemesters((prev) => [...prev, newSem]);
    }
    setShowModal(false);
  };

  const handleClearSemester = (id) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === id ? { ...sem, courses: [] } : sem
      )
    );
  };

  const handleDeleteSemester = async (localId) => {
    const semesterToDelete = semesters.find((sem) => sem.id === localId);
    if (!semesterToDelete) {
      console.error("Semester not found in local state");
      return;
    }
      const { sem_id } = semesterToDelete;
  
      try {
      const response = await fetch(`/api/deleteSemester?semId=${sem_id}`, {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to delete semester");
      }
  
      // 4. Remove it from local state
      setSemesters((prev) => prev.filter((sem) => sem.id !== localId));
    } catch (err) {
      console.error("Error deleting semester:", err);
    }
  };

  const handleDegreeChange = async (e) => {
    const newDegreeId = Number(e.target.value);
    setSelectedDegreeId(newDegreeId);
  
    // Store/update the user’s new degree:
    if (userInfo.session && userInfo.session.userId) {
      try {
        await fetch(
          `/api/update_user_degree?userid=${userInfo.session.userId}&didin=${newDegreeId}`
        );
        userInfo.session.user.did = newDegreeId;
      } catch (err) {
        console.error("Error updating user degree:", err);
      }
    }
  };
  

  const openDescModal = (courseObj) => {
    setDescCourse(courseObj);
    setShowDescModal(true);
  };

  const closeDescModal = () => {
    setDescCourse(null);
    setShowDescModal(false);
  };

  // RegistrantApp.jsx (snippet)

  const handleSaveSemesterToDB = (localSemesterId) => {
    const semesterToSave = semesters.find((s) => s.id === localSemesterId);
    if (!semesterToSave) return console.error("Semester not found in local state");

    const payload = {
      semId: semesterToSave.sem_id,
      userid: userInfo.session ? userInfo.session.userId : null,
      name: `${semesterToSave.type} ${semesterToSave.year}`,
      course_list: semesterToSave.courses.map((course) => course.cid)
    };

    console.log("Saving to DB with payload:", payload);

    fetch("/api/saveSemester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to save semester");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Semester updated with sem_id:", data.sem_id);
      })
      .catch((err) => console.error("Error saving semester:", err));
  };


  /** ---------------------------
   *  RENDER
   * ---------------------------*/
  return (
    <div className="page-container">
      {/* HEADER */}
      <header className="subtitle">
        <h1>UniPlan: Registrant's Homepage</h1>
        <nav className="topnav">
          <a className="active" href="#plan">Plan</a>
          <button className="sign-out" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>
      </header>

      {/* LAYOUT */}
      <div className="layout-wrapper">
        <aside className="requirements">
          <label>Degree&nbsp;</label>
          <select
            value={selectedDegreeId || ''}
            onChange={handleDegreeChange}
            //onChange={(e) => setSelectedDegreeId(Number(e.target.value))}
          >
             <option value="">-- No degree selected --</option>
            {degrees.map((deg) => (
              <option key={deg.did} value={deg.did}>
                {deg.degree}
              </option>
            ))}
          </select>
          <br /><br />
          <CollapsibleSection
            title="Required Courses"
            items={courses.filter(course => course.isambig === false)}
            onDragStartAside={handleDragStartAside}
          />
          <CollapsibleSection
            title="Ambiguous Courses"
            items={courses.filter(course => course.isambig === true)}
            onDragStartAside={handleDragStartAside}
          />
          <br /><br />
          <button className="degree-valid-button" onClick={checkValid}>
            Check Degree for Validity
          </button>
        </aside>

        <main className="main-content">
          <h2>Your Planner</h2>
          <p>
            Add semesters, then drag courses from the left panel.
          </p>

          <button onClick={handleOpenAddModal}>Add New Semester</button>

          {/* Semester Boxes */}
          <div className="semesters-container">
            {semesters.map((sem) => (
              <div key={sem.id} className="semester-box">
                <div className="semester-header">
                  <h3>{sem.type} {sem.year}</h3>
                  <div className="dropdown-container">
                    <button className="dropdown-btn">⋮</button>
                    <div className="dropdown-content">
                      <button onClick={() => handleOpenEditModal(sem)}>Edit</button>
                      <button onClick={() => handleClearSemester(sem.id)}>Clear Courses</button>
                      <button onClick={() => handleDeleteSemester(sem.id)}>Delete</button>
                      <button onClick={() => handleSaveSemesterToDB(sem.id)}>Save Semester</button>
                    </div>
                  </div>
                </div>

                {/* DRAG ZONE for dropping courses */}
                <div
                  className="course-dropzone"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, sem.id)}
                >
                  {sem.courses.length > 0 ? (
                    <ul className="semester-course-list">
                      {sem.courses.map((courseObj) => (
                        <li
                          key={courseObj.id}
                          draggable
                          onDragStart={(ev) => handleDragStartSemester(ev, courseObj, sem.id)}
                        >
                          <span className="course-name">{courseObj.shortname}</span>
                          <div className="icon-group">
                            <button
                              className="inspect-course-button"
                              onClick={() => openDescModal(courseObj)} title="Course Description"> 🔎 </button>
                            <button
                              className="edit-course-button"
                              onClick={() => openEditCourseModal(sem.id, courseObj)} title="Edit Course"> 🔨 </button>
                            <button
                              className="delete-course-button"
                              onClick={() => removeSingleCourse(sem.id, courseObj.id)} title="Delete Course"> ❌ </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Add Course</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* MODAL: Show description for Class*/}
      {showDescModal && descCourse && (
        <div className="modal-backdrop">
          <div className="modal-content2">
            <h2>Course Description</h2>
            <label>
              {descCourse.shortname}: {descCourse.coursename}
            </label>
            <label>
              Credits: {descCourse.credits}
            </label>
            <label>
              Description: {descCourse.description}
            </label>
            <label>
              Prereqs: {descCourse.prereq?.join(', ')}
            </label>

            <div className="modal-buttons">
              <button onClick={closeDescModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Add or Edit Semester */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>{isEditMode ? 'Edit Semester' : 'New Semester'}</h2>

            <label>Type:&nbsp;</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
              {/*<option value="Co-op">Co-op Workterm</option>*/}
              {/*<option value="Gap">Gap Semester</option>*/}
            </select>
            <br /><br />

            <label>Year:&nbsp;</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2020"
              max="2100"
            />
            <br /><br />

            <div className="modal-buttons">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={isEditMode ? handleSaveSemester : handleConfirmAddSemester}>
                {isEditMode ? 'Save' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Edit Course */}
      {showEditCourseModal && courseBeingEdited && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Edit Course</h2>

            <label>Course Name:</label>
            <input
              type="text"
              value={courseBeingEdited.text}
              onChange={(e) =>
                setCourseBeingEdited({
                  ...courseBeingEdited,
                  text: e.target.value
                })
              }
            />

            <label>Status:</label>
            <select
              value={courseBeingEdited.status || 'inprogress'}
              onChange={(e) =>
                setCourseBeingEdited({
                  ...courseBeingEdited,
                  status: e.target.value
                })
              }
            >
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="inprogress">In Progress</option>
            </select>

            <div className="modal-buttons">
              <button onClick={() => setShowEditCourseModal(false)}>Cancel</button>
              <button onClick={() => handleSaveCourseEdits(courseBeingEdited)}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {showValidModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Degree Verification</h2>
            <div className="verify-content">

              <h5>ah beans</h5>
            </div>

            <div className="modal-buttons">
              <button onClick={() => setShowValidModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}