#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "json.hpp"
#include <string>

using namespace std;
using json = nlohmann::json;

// Class definitions
// Course object, contains id, name, and prerequisites.
class Course
{
public:
    int id;
    string name;
    vector<string> prerequisites;

    // Constructor. Sets id. Name and prerequisites are added later.
    Course(int id)
    {
        this->id = id;
    }

    // Adds a prerequisite to the course.
    void addPrerequisite(const string &prereq)
    {
        this->prerequisites.push_back(prereq);
    }

    // Defines the name of the course.
    void addName(const string &name)
    {
        this->name = name;
    }
};

// Semester object. Contains an id, timeslot, and list of courses.
class Semester
{
public:
    int id;
    int timeslot;
    vector<Course> courses;

    // Constructor. Parses the timeslot string into an integer.
    Semester(int id, const string &timeslot) : id(id)
    {
        string season = timeslot.substr(0, timeslot.find(" "));
        string year = timeslot.substr(timeslot.find(" ") + 1);
        int year_int = stoi(year) * 10;
        int season_int = 0;

        if (season == "Winter")
            season_int = 0;
        else if (season == "Spring")
            season_int = 2;
        else if (season == "Summer")
            season_int = 3;
        else if (season == "Fall")
            season_int = 4;

        this->timeslot = year_int + season_int;
    }

    // Adds a course to the semester.
    void addCourse(const Course &course)
    {
        courses.push_back(course);
    }

    // Less than operator. Compares timeslots.
    bool operator<(const Semester &other) const
    {
        return timeslot < other.timeslot;
    }
};

// Output object. Contains error count and list of errors.
class Output
{
public:
    int num_errors;
    vector<string> error_list;

    Output() : num_errors(0) {}

    void addError(const string &error)
    {
        num_errors++;
        error_list.push_back(error);
    }

    void writeOutput(const string &file_path)
    {
        json output_json = {
            {"Number of Errors", num_errors},
            {"Error List", error_list}};
        ofstream out_stream(file_path);
        out_stream << output_json.dump(4); // Pretty print with 4 spaces :)
        out_stream.close();
    }
};

// Main: args[1] = reqs_filePath, args[2] = sems_filePath, args[3] = out_filePath
int main(int argc, char *argv[])
{
    // Arg sanitization
    std::cout << "Initializing..." << std::endl;
    if (argc < 4)
    {
        cerr << "Usage: " << argv[0] << " <reqs_filePath> <sems_filePath> <out_filePath>" << endl;
        return 1;
    }

    // File path/stream definitions
    std::cout << "Setting filepaths..." << std::endl;
    string reqs_filePath = argv[1];
    string sems_filePath = argv[2];
    string out_filePath = argv[3];

    ifstream reqs_stream(reqs_filePath);
    ifstream sems_stream(sems_filePath);
    ifstream lexicon("/var/www/temp/lexicon/lexicon.json");

    if (!reqs_stream.is_open() || !sems_stream.is_open() || !lexicon.is_open())
    {
        cerr << "Error opening input files." << endl;
        return 1;
    }

    // Define JSON inputs
    std::cout << "Defining json inputs..." << std::endl;
    json r_input;
    reqs_stream >> r_input;
    reqs_stream.close();

    json s_input;
    sems_stream >> s_input;
    sems_stream.close();

    json lexicon_input;
    lexicon >> lexicon_input;
    lexicon.close();

    // Parse JSON inputs.
    std::cout << "Parsing json inputs..." << std::endl;
    std::cout << ">Degree reqs..." << std::endl;

    vector<Course> degree_reqs;
    // Parse degree requirements:
    // JSON format: {did: 1, degree: "Computer Science", courses: [1, 2, 3, 4, 5]}
    // The api grabs this as an array which is stupid, so we have to iterate over one(1) element >:(

    // Iterate over top-level array
    for(const auto &req : r_input)
    {
        //Create new degree course requirement from fields "cid" and "shortname"
        Course degree_course(req["cid"]);
        degree_course.addName(req["shortname"]);
        //Add course to degree requirements
        degree_reqs.push_back(degree_course);

    }

    vector<Semester> semester_array;
    std::cout << ">Semesters..." << std::endl;
    // Parse semesters:
    // JSON format: {sem_id: 1, sname: "Fall 2025", courses: [1,2,3,4]}
    for (const auto &semester : s_input)
    {
        // Create new semester from fields "sem_id" and "sname"
        Semester new_semester(semester["sem_id"], semester["sname"]);
        // For each course in semester...
        for (const auto &course_id : semester["courses"])
        {
            // Find course in lexicon
            for (const auto &lexicon_course : lexicon_input)
            {
                if (lexicon_course["cid"] == course_id)
                {
                    // Create new course from fields "cid" and "shortname"
                    Course new_course(lexicon_course["cid"]);
                    new_course.addName(lexicon_course["shortname"]);
                    //Add prerequisites to course
                    for (const auto &prereq : lexicon_course["prerequisites"])
                    {
                        new_course.addPrerequisite(prereq);
                    }
                    // Add course to semester
                    new_semester.addCourse(new_course);
                    break;
                }
            }
        }
        // Add semester to semester array
        semester_array.push_back(new_semester);
    }

    // Sort semesters in ascending order
    sort(semester_array.begin(), semester_array.end());

    // Define output and begin validation checks
    Output output;

    // Check prerequisites for each course
    // Iterate over semesters in reverse order
    std::cout << ">Verifying prerequisites..." << std::endl;
    std::cout << semester_array.size() << std::endl;
    for (int i = semester_array.size() - 1; i >= 0; i--)
    {
        std::cout << ">Checking semester..." << std::endl;
        std::cout << semester_array[i].courses.size() << std::endl;
        // For each course in semester...
        for (const auto &course : semester_array[i].courses)
        {
            std::cout << ">Checking course..." << std::endl;
            std::cout << course.prerequisites.size() << std::endl;
            // For every prerequisite of the course, if any...
            for (const auto &prereq : course.prerequisites)
            {
                std::cout << ">Checking prereqs..." << std::endl;
                // Check all previous semesters...
                bool found = false;
                for (int l = i; l >= 0; l--)
                {
                    // For each course in previous semester...
                    for (const auto &prev_course : semester_array[l].courses)
                    {
                        // If the prereq name matches, break and continue to next prereq
                        if (prev_course.name == prereq)
                        {
                            std::cout << "Found prereq " << prereq << " for course " << course.name << std::endl;
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        break;
                }
                // If not found, spit out an error and check the next.
                if (!found)
                {
                    output.addError("Prerequisite " + prereq + " for course " + course.name + " has not been taken.");
                }
            }
        }
    }

    // Check if all degree requirements have been met
    // For each degree requirement...
    for (const auto &req : degree_reqs)
    {
        bool found = false;
        // Check all semesters...
        for (const auto &semester : semester_array)
        {
            // For each course in semester...
            for (const auto &course : semester.courses)
            {
                // If the course name matches, break and continue to next req
                if (course.name == req.name)
                {
                    found = true;
                    break;
                }
            }
            if (found)
                break;
        }
        // If not found, spit out an error and check the next.
        if (!found)
        {
            output.addError("Degree requirement " + req.name + " has not been met.");
        }
    }

    // Write output to a json file.
    output.writeOutput(out_filePath);
    // Done! :3
    return 0;
}