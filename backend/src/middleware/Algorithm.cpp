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
};

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

<<<<<<< HEAD

//read in the semestrs and courses
//read in the objects
//read in the lexicon

=======
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
>>>>>>> 88390979aef6f55dc1560ad300e7b14a80ad3ed6

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
    vector<int> degree_reqs = r_input["courses"].get<vector<int>>();
    vector<int> saved_plan;

    //Iterators are different in nlohmann stuff... you CAN'T use regular for loops, sadly womp womp (see: https://json.nlohmann.me/features/iterators/)
    //Discussions: //https://github.com/nlohmann/json/discussions/3387 
    //https://github.com/nlohmann/json/issues/83
    cout << "Degree Requirements: ";
    for (auto reqs : degree_reqs){
        cout << "Course: " << reqs << endl;
    }

    cout << "Saved Degree Plan: " << endl;
    for (auto s: s_input){
        //the following JSON integers need to be first converted using the library so that it can be used by c++
        //so, turn it into a an array of integers
        vector <int> temp = s["courses"].get<vector<int>>(); //from Nlhomann JSON library
        saved_plan.insert(saved_plan.end(), temp.begin(), temp.end());
    }

    for (auto plan : saved_plan){
        cout << plan << " ";
    }
    cout << endl;

    //Compare the array list of required courses for that degree with the array list of semesters
    //Check if the size of the planned degree is less that the requirements. If so, that means it's an invalid degree
    if (degree_reqs.size() > saved_plan.size()){
        cout << "Invalid Degree. Saved degree list does not match size of requirements list." << endl;
        out_stream << missing_course_messg;
    }
    else {
        cout << "Saved degree list matches size of requirements list." << endl;
        out_stream << valid_list_messg;
    }

    //check so see if the saved list ids are sorted in order from lowest to highest. If not, the degree is invalid because of prerequisites not in order
    if (is_sorted(saved_plan.begin(), saved_plan.end()) == false){
        cout << "Degree Invalid. There are prerequisites required to take certain classes." << endl;
        out_stream << missing_prerequisite_messg;
    }
    else{
        cout << "There are no prerequisite conflicts." << endl;
        out_stream << valid_prereq_messg;
    }


    //For every element in the requirements list, check that it exists in the saved plan array. 
    //If one of them is not there, it is not valid. Exit.
    for (auto reqs : degree_reqs){

        //set a current target for the search
        int temp_target = reqs;

        //if reqs has not been matched, even after the end of the list, return an error
        //sort and then do a binary search
        sort(saved_plan.begin(), saved_plan.end());
        if (binary_search(saved_plan.begin(), saved_plan.end(), temp_target) == false)
        {
            cout << "Degree Plan Invalid. At least one course is missing." << endl;
            out_stream << missing_course_messg;
        }
    }

    out_stream.close();

}