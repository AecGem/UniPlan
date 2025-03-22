#include <iostream>
#include <fstream>
#include <vector>
#include <algorithm>
#include "json.hpp"

using namespace std;

// for convenience
using json = nlohmann::json;

int main()
{
    std::ifstream file("dummy_inputs.json");

    json jsonInputData;
    file >> jsonInputData;

    file.close();

    //Take in the json array of degree requirements and put it in as a c++ array
    
    vector<int> degree_reqs = jsonInputData["Degree Requirements List"]["Requirements"].get<vector<int>>();

    cout << "Degree Requirements: ";
    for (const auto& reqs : degree_reqs){
        cout << "Course: " << reqs << endl;
    }

//    //Take in the json array of saves semesters and put it in as a c++ array

    vector<int> saved_plan;

    cout << "Saved Degree Plan: " << endl;
    for (const auto& s: jsonInputData["Saved Semesters"]){
        vector <int> temp = s["Saved Courses"].get<vector<int>>();
        saved_plan.insert(saved_plan.end(), temp.begin(), temp.end());
    }

    for (const auto& plan : saved_plan){
        cout << plan << " ";
    }

    cout << endl;

    //Compare the array list of required courses for that degree with the array list of semesters
    //Check if the size of the planned degree is less that the requirements. If so, that means it's an invalid degree

    if (degree_reqs.size() > saved_plan.size()){
        cout << "Invalid Degree. Saved degree list does not match size of requirements list." << endl;
        //make a json output here later
    }
    else{
        cout << "Saved degree list matches size of requirements list." << endl;
    }

    //check so see if the saved list ids are sorted in order from lowest to highest. If not, the degree is invalid because of prerequisites not in order
    if (is_sorted(saved_plan.begin(), saved_plan.end()) == false){
        cout << "Degree Invalid. There are prerequisites required to take certain classes." << endl;
    }
    else{
        cout << "There are no prerequisite conflicts." << endl;
    }

    //For every element in the requirements list, check that it exists in the saved plan array. If one of them is not there, it is not valid. Exit.

    for (const auto& reqs : degree_reqs){

        //set a current target for the search
        int temp_target = reqs;

        //sort the list of saved plans
        //if reqs has not been matched, even after the end of the list, return an error
        //sort and then do a binary search
        sort(saved_plan.begin(), saved_plan.end());

        if (binary_search(saved_plan.begin(), saved_plan.end(), temp_target) == false)
        {
            cout << "Degree Plan Invalid. At least one course is missing." << endl;
        }
    }

}