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
    // Optional isSatisfied boolean for degree requirements.
    bool isSatisfied = false;

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
    vector<Course *> courses;

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
    void addCourse(Course *course)
    {
        this->courses.push_back(course);
    }

    // Less than operator. Compares timeslots.
    bool operator<(const Semester &other) const
    {
        return timeslot < other.timeslot;
    }

    // Destructor
    ~Semester()
    {
        for (auto &course : courses)
        {
            delete course;
        }
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
    std::cout << "Parsing JSON inputs..." << std::endl;
    std::cout << "Adding Degree reqs..." << std::endl;

    vector<Course *> degree_reqs;
    // Parse degree requirements:
    // Single JSON object with 4 fields: {"did" = 1, "degree" = "Computer Science", "reqs" = [1,2,3,4,15,26]}
    for (int i = 0; i < r_input["courses"].size(); i++)
    {
        std::cout << "\t>Adding course..." << std::endl;
        // Create new course from req id's.
        Course *new_course = new Course(r_input["courses"][i]);
        // Search up course id in lexicon
        for (const auto &lexicon_course : lexicon_input)
        {

            if (lexicon_course["cid"] == r_input["courses"][i])
            {

                // Add course name to course object
                new_course->addName(lexicon_course["shortname"]);

                // Add all prerequisites to course object
                for (const auto &prereq : lexicon_course["prereq"])
                {
                    new_course->addPrerequisite(prereq);
                }
                break;
            }
        }

        // Add course to degree requirements.
        degree_reqs.push_back(new_course);
    }
    // Print length of degree_reqs
    std::cout << degree_reqs.size() << std::endl;

    vector<Semester *> semester_array;
    std::cout << "Adding Semesters..." << std::endl;
    // Parse semesters:
    // JSON format: {sem_id: 1, sname: "Fall 2025", courses: [1,2,3,4]}
    for (const auto &semester : s_input)
    {
        // Create new semester from fields "sem_id" and "sname"
        Semester *new_semester = new Semester(semester["sem_id"], semester["sname"]);
        // For each course in semester...
        for (const auto &course_id : semester["courses"])
        {
            // Find course in lexicon
            for (const auto &lexicon_course : lexicon_input)
            {
                if (lexicon_course["cid"] == course_id)
                {
                    // Create new course from fields "cid" and "shortname"
                    Course *new_course = new Course(lexicon_course["cid"]);
                    new_course->addName(lexicon_course["shortname"]);
                    if(new_course->name=="MATH 221"){
                        std::cout <<"MATH 221 found as course in semester "<< new_semester->timeslot << std::endl;
                    }
                    if(new_course->name=="STAT 160"){
                        std::cout <<"STAT 160 found as course in semester "<< new_semester->timeslot << std::endl;
                    }
                    // Add prerequisites to course
                    std::cout << "\tAdding prerequisites..." << std::endl;
                    for (const auto &prereq : lexicon_course["prereq"])
                    {
                        new_course->addPrerequisite(prereq);
                    }
                    // Add course to semester
                    new_semester->addCourse(new_course);
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
    for (int i = semester_array.size() - 1; i >= 0; i--)
    {
        std::cout << "\t>Checking semester..." << std::endl;
        // For each course in semester...
        for (const auto &course : semester_array[i]->courses)
        {
            std::cout << "\t\t>Checking course..." << std::endl;
            // For every prerequisite of the course, if any...
            for (const auto &prereq : course->prerequisites)
            {
                bool mathstat_DEBUG = false;
                if(prereq == "MATH 221"){
                    std::cout <<"MATH 221 found as prereq in semester "<< semester_array[i]->timeslot << std::endl;
                    mathstat_DEBUG = true;
                }
                if(prereq == "STAT 160"){
                    mathstat_DEBUG = true;
                    std::cout <<"STAT 160 found as prereq in semester "<< semester_array[i]->timeslot << std::endl;
                }
                std::cout << "\t\t\t>Checking prereqs..." << std::endl;
                // If the prereq string is of the form "MATH above 102", check if any course satisfy the prefix number requirement.
                if (prereq.find("above") > 2)
                {
                    if(mathstat_DEBUG){
                        std::cout << "Checking above, found mathstat_DEBUG" << std::endl;
                    }
                    std::cout << "\t\t\t\t>Checking above..." << std::endl;
                    // Get the prefix of the prereq string
                    string prefix = prereq.substr(0, prereq.find("above") - 1);
                    // Get the number of the prereq string
                    int number = stoi(prereq.substr(prereq.find("above") + 6));
                    // Check all previous semesters...
                    bool found = false;
                    for (int l = i; l >= 0; l--)
                    {
                        // For each course in previous semester...
                        for (const auto &prev_course : semester_array[l]->courses)
                        {
                            // If the course name matches the prefix and the course number is greater than the required number, break and continue to next prereq
                            if (prev_course->name.find(prefix) != string::npos && stoi(prev_course->name.substr(prefix.length())) > number)
                            {
                                std::cout << "\t\t\t\t>Found prereq " << prereq << " for course " << course->name << std::endl;
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
                        output.addError("Prerequisite " + prereq + " for course " + course->name + " has not been taken.");
                    }
                    
                }
                //If the prereq string is of the form MATH110/MATH102/(...), check if any course matches ANY of the OR conditions.
                else if (prereq.find("/") != string::npos)
                {
                    if(mathstat_DEBUG){
                        std::cout << "Checking above, found mathstat_DEBUG" << std::endl;
                    }
                    string reqString = prereq;
                    std::cout << "\t\t\t\t>Checking OR..." << std::endl;
                    // Split the OR conditions into a vector
                    vector<string> or_conditions;
                    size_t pos = 0;
                    // Split the string by '/'
                    while ((pos = reqString.find("/")) != string::npos)
                    {
                        or_conditions.push_back(prereq.substr(0, pos));
                        reqString.erase(0, pos + 1);
                    }
                    or_conditions.push_back(prereq);
                    // Check all previous semesters...
                    bool found = false;
                    for (int l = i; l >= 0; l--)
                    {
                        // For each course in previous semester...
                        for (const auto &prev_course : semester_array[l]->courses)
                        {
                            // For each OR condition...
                            for (const auto &or_condition : or_conditions)
                            {
                                // If the course name matches the OR condition, break and continue to next prereq
                                if (prev_course->name == or_condition)
                                {
                                    std::cout << "\t\t\t\t>Found prereq " << prereq << " for course " << course->name << std::endl;
                                    found = true;
                                    break;
                                }
                            }
                            if (found)
                                break;
                        }
                        if (found)
                            break;
                    }
                    // If not found, spit out an error and check the next.
                    if (!found)
                    {
                        output.addError("Prerequisite " + prereq + " for course " + course->name + " has not been taken.");
                    }
                    
                }
                else
                {
                    if(mathstat_DEBUG){
                        std::cout << "Checking above, found mathstat_DEBUG" << std::endl;
                    }
                    // Check all previous semesters...
                    bool found = false;
                    for (int l = i; l >= 0; l--)
                    {
                        // For each course in previous semester...
                        for (const auto &prev_course : semester_array[l]->courses)
                        {
                            // If the prereq name matches, break and continue to next prereq
                            if (prev_course->name == prereq)
                            {
                                std::cout << "\t\t\t\t>Found prereq " << prereq << " for course " << course->name << std::endl;
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
                        output.addError("Prerequisite " + prereq + " for course " + course->name + " has not been taken.");
                    }
                }
            }
        }
    }

    // Check if all degree requirements have been met
    // For each semester...
    for (const auto &semester : semester_array)
    {
        // For each course in semester...
        for (const auto &course : semester->courses)
        {
            // For each degree requirement...
            for (auto &degree_course : degree_reqs)
            {
                // If the course name matches the degree requirement name and it is not already satisfied...
                if (course->name == degree_course->name && !degree_course->isSatisfied)
                {
                    // Mark the degree requirement as satisfied.
                    degree_course->isSatisfied = true;
                }
            }
        }
    }

    // Now check if all degree requirements have been satisfied.
    std::cout << "Degree reqs size: ";
    std::cout << degree_reqs.size() << std::endl;
    // For each course in degree requirements...
    for (const auto &degree_course : degree_reqs)
    {
        // If the course has not been satisfied...
        if (!degree_course->isSatisfied)
        {
            // Add an error to the output.
            output.addError("Degree requirement " + degree_course->name + " has not been satisfied.");
        }
    }

    // Write output to a json file.
    output.writeOutput(out_filePath);

    // Clean up
    for (auto &course : degree_reqs)
    {
        delete course;
    }
    for (auto &semester : semester_array)
    {
        delete semester;
    }

    return 0;
}