#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "json.hpp"

using namespace std;

// for convenience
using json = nlohmann::json;

class Semester_class {
    //enter stuff here
};

class Course_class {
    //enter stuff here
};

class Requirements_class {
    //enter stuff ehre
};

int main(int argc, char *argv[])
{
    //JSON errors (see: https://github.com/nlohmann/json)
    json valid_list_messg = {
        {"Number of Errors:", 0},
        {"Error List", {"No missing courses"}}
    };

    json valid_prereq_messg = {
        {"Number of Errors:", 0},
        {"Error List", {"No Prerequisite Conflicts"}}
    };

    json missing_course_messg = {
        {"Number of Errors", 1},
        {"Error List", {"Missing a course"}}
    };

    json missing_prerequisite_messg = {
        {"Number of Errors", 1},
        {"Error List", {"Missing a prerequisite"}}
    };

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
    vector<int> degree_reqs = r_input["Degree Requirements List"]["Requirements"].get<vector<int>>();
    vector<int> saved_plan;

    //Iterators are different in nlohmann stuff... you CAN'T use regular for loops, sadly womp womp (see: https://json.nlohmann.me/features/iterators/)
    //Discussions: //https://github.com/nlohmann/json/discussions/3387 
    //https://github.com/nlohmann/json/issues/83
    cout << "Degree Requirements: ";
    for (auto reqs : degree_reqs){
        cout << "Course: " << reqs << endl;
    }

    cout << "Saved Degree Plan: " << endl;
    for (auto s: s_input["Saved Semesters"]){
        //the following JSON integers need to be first converted using the library so that it can be used by c++
        //so, turn it into a an array of integers
        vector <int> temp = s["Saved Courses"].get<vector<int>>(); //from Nlhomann JSON library
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