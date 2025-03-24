#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "json.hpp"
#include <string>

using namespace std;

// for convenience
using json = nlohmann::json;

//Class definitions:
//Courses, has id, name, and a vector of prerequisites represented as strings
class Course{
    public:
        int id;
        string name;
        vector<string> prerequisites;
    //Constructor for course, takes in int id, nothing else.
    Course(int id){
        this->id = id;
    }
    //Add a prerequisite to the course
    void addPrerequisite(string prereq){
        this->prerequisites.push_back(prereq);
    }
    //Add a name to the course
    void addName(string name){
        this->name = name;
    }
};

//Semester, has id, timeslot (as an integer), and a vector of course objects.
class Semester{
    public:
        int id;
        int timeslot;
        vector<Course> courses;
    //Constructor for semester, takes in int id, string timeslot in the format of "Fall 2024, Winter 2025, Spring 2025, Summer 2025" etc.
    Semester(int id, string timeslot){
        this->id = id;
        //First, split string into two parts (the season and the year)
        string season = timeslot.substr(0, timeslot.find(" "));
        string year = timeslot.substr(timeslot.find(" ")+1, timeslot.length());
        //Parse year into an integer, then multiply by 10 to make room for season.
        int year_int = stoi(year)*10;
        //Parse season into an integer via lookup.
        int season_int;
        if (season == "Winter"){
            season_int = 0;
        }
        else if (season == "Spring"){
            season_int = 2;
        }
        else if (season == "Summer"){
            season_int = 3;
        }
        else if (season == "Fall"){
            season_int = 4;
        }
        //Add the two together to get the timeslot.
        this->timeslot = year_int + season_int;
    

    }
    //Add course to the semester
    void addCourse(Course course){
        this->courses.push_back(course);
    }

    bool operator<(const Semester& other) const{
        return this->timeslot < other.timeslot;
    }
};



//JSON output object, has a number of errors and a list of errors
class Output{
    public:
        int num_errors;
        vector<string> error_list;
        //Constructor for Output, takes in nothing.
        Output(){
            this->num_errors = 0;
        }
    //Add an error to the error list
    void addError(string error){
        this->num_errors++;
        this->error_list.push_back(error);
    }
    //Write the output to a JSON file.
    void writeOutput(string file_path){
        json output_json = {
            {"Number of Errors:", this->num_errors},
            {"Error List", this->error_list}
        };
        std::ofstream out_stream (file_path);
        out_stream << output_json;
        out_stream.close();
    }
};

int main(int argc, char *argv[])
{
    //Set up the file paths (see: )
    string reqs_filePath = argv[1];
    string sems_filePath = argv[2];
    string out_filePath = argv[3];

    //Open the files
    std::ifstream reqs_stream (reqs_filePath);
    std::ifstream sems_stream (sems_filePath);
    std::ofstream out_stream (out_filePath);

    //Parse JSON
    json r_input;
    reqs_stream >> r_input;
    reqs_stream.close();

    json s_input;
    sems_stream >> s_input;
    sems_stream.close();

    //Take in the json array of degree requirements and put it in as a c++ array //This must be done because JSON integers isn't necessarilly the same as C++ integers
    //Take in the json array of saved semesters and put it in as a c++ array
    //(see: https://stackoverflow.com/questions/54389742/use-nlohmann-json-to-unpack-list-of-integers-to-a-stdvectorint)


    //you have to loop through each object in the array to get the required courses list
    vector<int> degree_reqs;
    for (auto req_courses : r_input){
        int temp_course_req = r_input["courses"].get<int>();
        degree_reqs.push_back(temp_course_req);
    }

    vector<int> saved_plan;
    for (auto saved_sems : s_input){
        int temp_sem = s_input["sem_id"].get<int>();
        saved_plan.push_back(temp_sem);
    }
    
    vector<Semester> semester_array;
    vector<int> courses_list;
    //Populate the semester objects
    for (int i = 0; i < saved_plan.size(); i++){
        //call the constructor to create semesters
        int temp_sem_id = saved_plan[0];
        Semester temp (temp_sem_id, s_input[temp_sem_id]["sname"]);
        semester_array.push_back(temp);

        for (auto sem_courses : s_input){
            int temp_course_id = s_input[temp_sem_id]["courses"].get<int>();
            Course added_course (temp_course_id); 
            temp.addCourse(added_course);
        }
    }

    sort(semester_array.begin(), semester_array.end());
    
    //_________NEW: AecGem codes the validity checks here___________
    //Create an output object
    Output output;

    //Now that the semesters are sorted and course info is populated, we can validate prerequisites.

    //Check one: Prerequisites are taken before any course that requires them.
    //Loop through each semester, back to front.
    for(int i = semester_array.size()-1; i >= 0; i--){
        //For each course in the semester, check if it has prerequisites.
        for (int j = 0; j < semester_array[i].courses.size(); j++){

            //If it does, loop through the prerequisites.
            if(semester_array[i].courses[j].prerequisites.size() > 0){
                for (int k = 0; k < semester_array[i].courses[j].prerequisites.size(); k++){
                    //For each prerequisite, check if it has been taken.
                    bool found = false;
                    //Check each semester before the current one.
                    for (int l = 0; l < i; l++){

                        //Check each course in the semester.
                        for (int m = 0; m < semester_array[l].courses.size(); m++){
                            //If the course is found, set found to true and break out of the loop.
                            if (semester_array[l].courses[m].name == semester_array[i].courses[j].prerequisites[k]){
                                found = true;
                                break;
                            }
                        }
                        //If the course is found, break out of the loop.
                        if (found){
                            break;
                        }

                    }
                    //If it hasn't, add an error to the output object.
                    if(!found){
                        output.addError("Prerequisite " + semester_array[i].courses[j].prerequisites[k] + " for course " + semester_array[i].courses[j].name + " has not been taken.");
                    }
                    //Then, move on to the next prerequisite.
                }
            }
        }

    }

    //Check two: All degree requirements are met.

    //Loop through each course in the degree requirements.
    for (int i = 0; i < degree_reqs.size(); i++){
        bool found = false;
        //Loop through each semester.
        for (int j = 0; j < semester_array.size(); j++){
            //Loop through each course in the semester.
            for (int k = 0; k < semester_array[j].courses.size(); k++){
                //If the course id is found, set found to true and break out of the loop.
                if (semester_array[j].courses[k].id == degree_reqs[i]){
                    found = true;
                    break;
                }
            }
            //If the course is found, break out of the loop.
            if (found){
                break;
            }
        }
        //If the course hasn't been found, add an error to the output object.
        if (!found){
            output.addError("Degree requirement " + to_string(degree_reqs[i]) + " has not been met.");
        }
    }



    //Write the output to a JSON file.
    output.writeOutput(out_filePath);
    return 0;
    //Done :)
}