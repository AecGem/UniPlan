// RegistrantApp.jsx
import { useState, useEffect, useContext } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { AuthAPI } from './apis/AuthAPI'
import './Registrant.css'
import { useRouter } from "@tanstack/react-router";
import { userInfo } from './utils/auth'

// Collapsible Section Sub-Component
function CollapsibleSection({ title, items, onDragStartAside }) {
  const [expanded, setExpanded] = useState(false);
  const toggleExpand = () => setExpanded((prev) => !prev);

  return (
    <div className="collapsible-section">
      <button className="collapsible-header" onClick={toggleExpand}>
        {expanded ? '▼' : '▶'} {title}
      </button>
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
    const [semesters, setSemesters] = useState([]);
    const [courses, setCourses] = useState([]);
    const [degrees, setDegrees] = useState([]);
    const [selectedDegreeId, setSelectedDegreeId] = useState('');

    const navigate = useNavigate();
    const router = useRouter();
    console.log(session);
    console.log

// Attempt to protect route
  try {
    if (session !== undefined) {
      if (session.session.user.usertype === true) {
        navigate({ to: '/registrar' });
      }
    }
  } catch (error) {
    router.invalidate();
    navigate({ to: '/' });
  }

// ============= LOAD DEGREES =============  
  useEffect(() => {
    fetch('/api/degree')
      .then((res) => res.json())
      .then((data) => setDegrees(data))
      .catch((err) => console.error('Error fetching degrees:', err));
  }, []);

// ============= LOAD COURSES FOR SELECTED DEGREE =============
  useEffect(() => {
    if (!selectedDegreeId) return;
    const params = new URLSearchParams();
    params.append('didin', selectedDegreeId);
    const url = `/api/course?${params.toString()}`;
    console.log('Fetching courses for didin:', selectedDegreeId);
    fetch(url)
      .then(res => res.json())
      .then(data => setCourses(data))
      .catch(err => console.error('Error fetching courses for degree:', err));
  }, [selectedDegreeId]);

// ============= LOAD SAVED SEMESTERS + MERGE COURSE DETAILS =============
  useEffect(() => {
    const realUserId = userInfo.session?.userId;
    if (!realUserId) return;
    
    // If userId is an object, extract the string
    let userIdString = realUserId;
    if (typeof userIdString === 'object' && userIdString !== null) {
      userIdString = userIdString.id;
    }

    fetch(`/api/get_saved_sem?userid=${userIdString}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch saved semesters');
        return res.json();
      })
      .then((semestersData) => {
        if (!semestersData || semestersData.length === 0) {
          setSemesters([]);
          return;
        }

        const allCids = new Set();
        semestersData.forEach((item) => {
          item.courses.forEach((cid) => allCids.add(cid));
        });

        if (allCids.size === 0) {
          const emptyCoursesSemesters = semestersData.map((item) => ({
            id: Date.now() + Math.random(),
            sem_id: item.sem_id,
            type: item.sname?.split(' ')[0] || '???',
            year: item.sname?.split(' ')[1] || '???',
            courses: [],
          }));
          setSemesters(emptyCoursesSemesters);
          return;
        }

        const cidsArray = Array.from(allCids);
        return fetch('/api/course_many', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cids: cidsArray })
        })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch course details');
            return res.json();
          })
          .then((courseDetails) => {
            const detailMap = {};
            courseDetails.forEach((c) => {
              detailMap[c.cid] = c;
            });

            const newSemesters = semestersData.map((item) => ({
              id: Date.now() + Math.random(),
              sem_id: item.sem_id,
              type: item.sname?.split(' ')[0] || '???',
              year: item.sname?.split(' ')[1] || '???',
              courses: item.courses.map((cid) => {
                const details = detailMap[cid] || {};
                return {
                  id: Date.now() + Math.random(),
                  cid: cid,
                  shortname: details.shortname || '',
                  coursename: details.coursename || '',
                  credits: details.credits || 0,
                  description: details.description || '',
                  prereq: details.prereq || [],
                  status: ''
                };
              }),
            }));
            setSemesters(newSemesters);
          });
      })
      .catch((err) => {
        console.error('Error fetching and merging saved semesters:', err);
      });
  }, []);

// ============= Sign Out =============    
  const handleSignOut = async () => {
      try {
        await AuthAPI.logOut()
        localStorage.removeItem('token')
        router.invalidate();
        navigate({ to: '/' })
      } catch (error) {
        console.error('Error signing out:', error)
      }
    };

// ============= DRAG & DROP HANDLERS =============
  const handleDragStartAside = (e, courseObj) => {
    const newCourse = {
      ...courseObj,
      id: Date.now().toString(),
      status: '',
    };
    const payload = { course: newCourse, sourceSemId: null };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleDragStartSemester = (e, courseObj, sourceSemId) => {
    const payload = { course: courseObj, sourceSemId };
    e.dataTransfer.setData('application/json', JSON.stringify(payload));
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetSemId) => {
    e.preventDefault();
    const rawData = e.dataTransfer.getData('application/json');
    if (!rawData) return;

    let payload;
    try {
      payload = JSON.parse(rawData);
    } catch (err) { return };

    const { course, sourceSemId } = payload;
    if (!course) return;

    // Update 'semesters' in local state
    setSemesters((prev) => {
      let updated = [...prev];
      // If it came from another semester, remove it from that semester's courses
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

// ============= EDIT COURSE HANDLERS =============
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);
  const [courseBeingEdited, setCourseBeingEdited] = useState(null);

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
              ? { ...c, text: updatedInfo.text, status: updatedInfo.status }
              : c
          ),
        };
      })
    );
    setShowEditCourseModal(false);
    setCourseBeingEdited(null);
  };

// ============= REMOVE SINGLE COURSE =============
  const removeSingleCourse = (semesterId, courseId) => {
    setSemesters((prev) =>
      prev.map((sem) =>
        sem.id === semesterId
          ? { ...sem, courses: sem.courses.filter((c) => c.id !== courseId) }
          : sem
      )
    );
  };

// ============= CHECK DEGREE VALIDITY =============
  const [showValidModal, setShowValidModal] = useState(false);
  const [verifyResultData, setVerifyResultData] = useState(null);

  const checkValid = async () => {
    // If no user or no degree selected, show something or return
    const realUserId = userInfo.session?.userId;
    if (!realUserId || !selectedDegreeId) {
      alert('Please ensure you are logged in and have selected a degree.');
      return;
    }
    let userIdString = realUserId;
    if (typeof userIdString === 'object' && userIdString !== null) {
      userIdString = userIdString.id;
    }

    // Call verification with userId & degree
    const verifyUrl = `/api/verification?id=${userIdString}&did=${selectedDegreeId}`;
    try {
      const res = await fetch(verifyUrl);
      if (!res.ok) {
        throw new Error('Failed to verify degree');
      }
      const data = await res.json();
      setVerifyResultData(data);
    } catch (err) {
      console.error('Error verifying degree:', err);
      setVerifyResultData({
        errors: 1,
        errorsList: { 1: 'Unknown error occurred verifying your degree.' },
      });
    }

    setShowValidModal(true);
  };

// ============= SEMESTER MODALS (ADD/EDIT) =============
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [tempSemesterId, setTempSemesterId] = useState(null);
  const [selectedType, setSelectedType] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState('2025');

  const handleOpenAddModal = () => {
    setIsEditMode(false);
    setSelectedType('Fall');
    setSelectedYear('2025');
    setTempSemesterId(null);
    setShowModal(true);
  };

  const handleConfirmAddSemester = async () => {
    const semesterName = `${selectedType} ${selectedYear}`;
    const payload = {
      userid: userInfo.session ? userInfo.session.userId : null,
      name: semesterName
    };

    try {
      const res = await fetch('/api/createSemester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to create semester');
      const data = await res.json();

      // Add the new semester to local state, storing the returned sem_id
      const newSem = {
        id: Date.now(),
        sem_id: data.sem_id,
        type: selectedType,
        year: selectedYear,
        courses: [],
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
      setSemesters((prev) =>
        prev.map((sem) =>
          sem.id === tempSemesterId
            ? { ...sem, type: selectedType, year: selectedYear }
            : sem
        )
      );
    } else {
      const newSem = {
        id: Date.now(),
        type: selectedType,
        year: selectedYear,
        courses: [],
      };
      setSemesters((prev) => [...prev, newSem]);
    }
    setShowModal(false);
  };

  const handleClearSemester = (id) => {
    setSemesters((prev) =>
      prev.map((sem) => (sem.id === id ? { ...sem, courses: [] } : sem))
    );
  };

  const handleDeleteSemester = async (localId) => {
    const semesterToDelete = semesters.find((sem) => sem.id === localId);
    if (!semesterToDelete) return console.error('Semester not found');
    const { sem_id } = semesterToDelete;

    try {
      const response = await fetch(`/api/deleteSemester?semId=${sem_id}`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to delete semester");
      setSemesters((prev) => prev.filter((sem) => sem.id !== localId));
    } catch (err) {
      console.error("Error deleting semester:", err);
    }
  };

  const handleDegreeChange = async (e) => {
    const newDegreeId = e.target.value;
    setSelectedDegreeId(newDegreeId);

    let realUserId = userInfo?.session?.userId;

    if (typeof realUserId === 'object' && realUserId !== null) {
      realUserId = realUserId.id;
    }

    if (realUserId && newDegreeId) {
      try {
        await fetch(`/api/update_user_degree?userid=${realUserId}&didin=${newDegreeId}`);
      } catch (err) {
        console.error("Error updating user degree:", err);
      }
    }
  };

// ============= COURSE DESCRIPTION MODAL =============
  const [showDescModal, setShowDescModal] = useState(false);
  const [descCourse, setDescCourse] = useState(null);
  
  const openDescModal = (courseObj) => {
    setDescCourse(courseObj);
    setShowDescModal(true);
  };

  const closeDescModal = () => {
    setDescCourse(null);
    setShowDescModal(false);
  };

// ============= SAVE SEMESTER TO DB =============
  const [savedPopup, setSavedPopup] = useState(false);

  const handleSaveSemesterToDB = (localSemesterId) => {
    const semesterToSave = semesters.find((s) => s.id === localSemesterId);
    if (!semesterToSave) return console.error("Semester not found in local state");

    const payload = {
      semId: semesterToSave.sem_id,
      userid: userInfo.session ? userInfo.session.userId : null,
      name: `${semesterToSave.type} ${semesterToSave.year}`,
      course_list: semesterToSave.courses.map((course) => course.cid)
    };

    fetch("/api/saveSemester", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save semester');
        return res.json();
      })
      .then((data) => {
        setSavedPopup(true);
        setTimeout(() => setSavedPopup(false), 5000);
      })
      .catch((err) => console.error("Error saving semester:", err));
  };


// ============= RENDER =============
  return (
    <div className="page-container">
      {/* HEADER */}
      <header className="subtitle">
        <h1>UniPlan: Registrant's Homepage</h1>
        <nav className="topnav">
          <a className="active">Plan</a>
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
            value={selectedDegreeId || ''} onChange={handleDegreeChange}>
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
            items={courses.filter((course) => course.isambig === false)}
            onDragStartAside={handleDragStartAside}
          />
          <CollapsibleSection
            title="Ambiguous Courses"
            items={courses.filter((course) => course.isambig === true)}
            onDragStartAside={handleDragStartAside}
          />
          <br /><br />
          <button className="degree-valid-button" onClick={checkValid}>
            Check Degree for Validity
          </button>
        </aside>

        <main className="main-content">
          <h2>Your Planner</h2>
          <p>Add semesters, then drag courses from the left panel.</p>

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
                      <button onClick={() => handleOpenEditModal(sem)}>Edit Semester</button>
                      <button onClick={() => handleClearSemester(sem.id)}>Clear Courses</button>
                      <button onClick={() => handleDeleteSemester(sem.id)}>Delete Semester</button>
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

      {/* POPUP: Show saving semester indication*/}
      {savedPopup && <div className="popup">Semester successfully saved!</div>}

      {/* MODAL: Show description for Class*/}
      {showDescModal && descCourse && (
        <div className="modal-backdrop">
          <div className="modal-content2">
            <h2>Course Description</h2>
            <br></br>
            <label>
              {descCourse.shortname}: {descCourse.coursename}
            </label>
            <br></br>
            <label>
              Credits: {descCourse.credits}
            </label>
            <br></br>
            <label>
              Description: {descCourse.description}
            </label>
            <br></br>
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
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Winter">Winter</option>
            </select>
            <br /><br />

            <label>Year:&nbsp;</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              min="2025"
              max="2300"
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
            <br></br>
            <label>Course Name: </label>
            <input
              type="text"
              value={courseBeingEdited.text}
              onChange={(e) =>
                setCourseBeingEdited({ ...courseBeingEdited, text: e.target.value })
              }
            />
            <br></br>
            <label>Status: </label>
            <select
              value={courseBeingEdited.status || 'inprogress'}
              onChange={(e) =>
                setCourseBeingEdited({ ...courseBeingEdited, status: e.target.value })
              }
            >
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="inprogress">In Progress</option>
            </select>

            <div className="modal-buttons">
              <button onClick={() => setShowEditCourseModal(false)}>Cancel</button>
              <button onClick={() => handleSaveCourseEdits(courseBeingEdited)}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Degree Verification */}
      {showValidModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h2>Degree Verification</h2>
            <div className="verify-content">
              {verifyResultData ? (
                verifyResultData.errors > 0 ? (
                  // We have errors; display them in red boxes
                  <>
                    {Object.values(verifyResultData.errorsList).map((errMsg, index) => (
                      <div key={index} className="error-box">
                        {errMsg}
                      </div>
                    ))}
                  </>
                ) : (
                  // No errors
                  <div className="success-message">
                    ✅ No errors found! Your plan meets all requirements.
                  </div>
                )
              ) : (
                <p>Loading verification results...</p>
              )}
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