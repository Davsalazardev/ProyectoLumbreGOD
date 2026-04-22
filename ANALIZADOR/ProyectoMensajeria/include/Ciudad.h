#pragma once
#include <string>

class Ciudad {
public:
    std::string nombre;
    Ciudad* siguiente;

    Ciudad(const std::string& nombre);
};
