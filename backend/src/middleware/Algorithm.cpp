#include <iostream>
#include <fstream>
#include <nlohmann/json.hpp>

// for convenience
using json = nlohmann::json;

//create a JSON object by reading a JSON file
std::ifstream degree_requirements("dummy_inputs.json");
std::ifstream degree_plan("degree_plan.json");



//create a JSON object
//create an empty structure

json valid_object = {
    
    {"valid", true},
    {"errors", {"error1", "error2", "error3"}};
}

