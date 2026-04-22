#pragma once
#include "Ciudad.h"
#include <string>

class Ruta {
private:
    Ciudad* cabeza;
    int tamano;

public:
    Ruta();
    ~Ruta();

    void agregarCiudad(const std::string& nombre);
    void eliminarPorNombre(const std::string& nombre);
    void eliminarPorPosicion(int posicion);
    void mostrarRuta() const;
    int getTamano() const;
    Ciudad* getCabeza() const;
};
