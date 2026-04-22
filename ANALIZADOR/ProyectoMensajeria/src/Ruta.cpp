#include "Ruta.h"
#include <iostream>

Ruta::Ruta() : cabeza(nullptr), tamano(0) {}

Ruta::~Ruta() {
    Ciudad* actual = cabeza;
    while (actual != nullptr) {
        Ciudad* siguiente = actual->siguiente;
        delete actual;
        actual = siguiente;
    }
}

void Ruta::agregarCiudad(const std::string& nombre) {
    Ciudad* nueva = new Ciudad(nombre);
    if (cabeza == nullptr) {
        cabeza = nueva;
    } else {
        Ciudad* actual = cabeza;
        while (actual->siguiente != nullptr)
            actual = actual->siguiente;
        actual->siguiente = nueva;
    }
    tamano++;
    std::cout << "Ciudad '" << nombre << "' agregada a la ruta.\n";
}

void Ruta::eliminarPorNombre(const std::string& nombre) {
    if (!cabeza) { std::cout << "La ruta esta vacia.\n"; return; }

    if (cabeza->nombre == nombre) {
        Ciudad* temp = cabeza;
        cabeza = cabeza->siguiente;
        delete temp;
        tamano--;
        std::cout << "Ciudad '" << nombre << "' eliminada.\n";
        return;
    }

    Ciudad* actual = cabeza;
    while (actual->siguiente && actual->siguiente->nombre != nombre)
        actual = actual->siguiente;

    if (actual->siguiente) {
        Ciudad* temp = actual->siguiente;
        actual->siguiente = temp->siguiente;
        delete temp;
        tamano--;
        std::cout << "Ciudad '" << nombre << "' eliminada.\n";
    } else {
        std::cout << "Ciudad no encontrada.\n";
    }
}

void Ruta::eliminarPorPosicion(int posicion) {
    if (!cabeza || posicion < 0 || posicion >= tamano) {
        std::cout << "Posicion invalida.\n"; return;
    }
    if (posicion == 0) {
        Ciudad* temp = cabeza;
        cabeza = cabeza->siguiente;
        delete temp;
        tamano--;
        return;
    }
    Ciudad* actual = cabeza;
    for (int i = 0; i < posicion - 1; i++)
        actual = actual->siguiente;

    Ciudad* temp = actual->siguiente;
    actual->siguiente = temp->siguiente;
    delete temp;
    tamano--;
    std::cout << "Ciudad en posicion " << posicion << " eliminada.\n";
}

void Ruta::mostrarRuta() const {
    if (!cabeza) { std::cout << "La ruta esta vacia.\n"; return; }
    Ciudad* actual = cabeza;
    int i = 0;
    while (actual) {
        std::cout << "[" << i++ << "] " << actual->nombre;
        if (actual->siguiente) std::cout << " -> ";
        actual = actual->siguiente;
    }
    std::cout << "\n";
}

int Ruta::getTamano() const { return tamano; }
Ciudad* Ruta::getCabeza() const { return cabeza; }
