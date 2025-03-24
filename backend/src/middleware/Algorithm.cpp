#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "json.hpp"
#include <string>

using namespace std;
using json = nlohmann::json;

// Class definitions
class Course {
public:
    int id;
    string name;
    vector<string> prerequisites;

    Course(int id) : id(id) {}

    void addPrerequisite(const string& prereq) {
        prerequisites.push_back(prereq);
    }

    void addName(const string& name) {
        this->name = name;
    }
};

class Semester {
public:
    int id;
    int timeslot;
    vector<Course> courses;

    Semester(int id, const string& timeslot) : id(id) {
        string season = timeslot.substr(0, timeslot.find(" "));
        string year = timeslot.substr(timeslot.find(" ") + 1);
        int year_int = stoi(year) * 10;
        int season_int = 0;

        if (season == "Winter") season_int = 0;
        else if (season == "Spring") season_int = 2;
        else if (season == "Summer") season_int = 3;
        else if (season == "Fall") season_int = 4;

        this->timeslot = year_int + season_int;
    }

    void addCourse(const Course& course) {
        courses.push_back(course);
    }

    bool operator<(const Semester& other) const {
        return timeslot < other.timeslot;
    }
};

class Output {
public:
    int num_errors;
    vector<string> error_list;

    Output() : num_errors(0) {}

    void addError(const string& error) {
        num_errors++;
        error_list.push_back(error);
    }

    void writeOutput(const string& file_path) {
        json output_json = {
            {"Number of Errors", num_errors},
            {"Error List", error_list}
        };
        ofstream out_stream(file_path);
        out_stream << output_json.dump(4); // Pretty print with 4 spaces
        out_stream.close();
    }
};

int main(int argc, char* argv[]) {
    std::cout << "Initializing..." << std::endl;
    if (argc < 4) {
        cerr << "Usage: " << argv[0] << " <reqs_filePath> <sems_filePath> <out_filePath>" << endl;
        return 1;
    }

    std::cout << "Setting filepaths..." << std::endl;
    string reqs_filePath = argv[1];
    string sems_filePath = argv[2];
    string out_filePath = argv[3];

    ifstream reqs_stream(reqs_filePath);
    ifstream sems_stream(sems_filePath);
    ifstream lexicon("/var/www/temp/lexicon/lexicon.json");

    if (!reqs_stream.is_open() || !sems_stream.is_open() || !lexicon.is_open()) {
        cerr << "Error opening input files." << endl;
        return 1;
    }

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

    std::cout << "Parsing json inputs..." << std::endl;
    std::cout << ">Degree reqs..." << std::endl;
    vector<int> degree_reqs;
    for (const auto& req_courses : r_input["courses"]) {
        degree_reqs.push_back(req_courses.get<int>());
    }

    std::cout << ".Saved plans..." << std::endl;
    vector<int> saved_plan;
    for (const auto& saved_sems : s_input["semesters"]) {
        saved_plan.push_back(saved_sems["sem_id"].get<int>());
    }

    std::cout << "Creating semesters..." << std::endl;
    vector<Semester> semester_array;
    for (const auto& sem : s_input["semesters"]) {
        int temp_sem_id = sem["sem_id"].get<int>();
        Semester temp(temp_sem_id, sem["sname"].get<string>());
        for (const auto& course : sem["courses"]) {
            int temp_course_id = course["course_id"].get<int>();
            Course added_course(temp_course_id);
            added_course.addName(course["name"].get<string>());
            for (const auto& prereq : course["prerequisites"]) {
                added_course.addPrerequisite(prereq.get<string>());
            }
            temp.addCourse(added_course);
        }
        semester_array.push_back(temp);
    }

    std::cout << "Populating courses from lexicon..." << std::endl;
    for (auto& sem : semester_array) {
        for (auto& course : sem.courses) {
            for (const auto& lexicon_course : lexicon_input["courses"]) {
                if (course.id == lexicon_course["id"].get<int>()) {
                    course.addName(lexicon_course["name"].get<string>());
                    for (const auto& prereq : lexicon_course["prerequisites"]) {
                        course.addPrerequisite(prereq.get<string>());
                    }
                    break;
                }
            }
        }
    }


    sort(semester_array.begin(), semester_array.end());

    Output output;

    for (int i = semester_array.size() - 1; i >= 0; i--) {
        for (const auto& course : semester_array[i].courses) {
            for (const auto& prereq : course.prerequisites) {
                bool found = false;
                for (int l = 0; l < i; l++) {
                    for (const auto& prev_course : semester_array[l].courses) {
                        if (prev_course.name == prereq) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
                if (!found) {
                    output.addError("Prerequisite " + prereq + " for course " + course.name + " has not been taken.");
                }
            }
        }
    }

    for (const auto& req : degree_reqs) {
        bool found = false;
        for (const auto& sem : semester_array) {
            for (const auto& course : sem.courses) {
                if (course.id == req) {
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
        if (!found) {
            output.addError("Degree requirement " + to_string(req) + " has not been met.");
        }
    }

    output.writeOutput(out_filePath);
    return 0;
}