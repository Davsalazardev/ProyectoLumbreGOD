#pragma once
#include "Ruta.h"
#include <vector>
#include <string>
#include <map>

class GestorRutas {
private:
    Ruta ruta;

    // Matriz 1D - distancias aproximadas entre puntos relevantes
    std::vector<int> distancias1D;
    std::vector<std::string> etiquetas1D;

    // Matriz 2D - tiempos estimados entre ciudades
    std::vector<std::vector<int>> tiempos2D;
    std::vector<std::string> ciudades2D;

    // Matriz dispersa - rutas de alta prioridad (mapa de pares)
    std::map<std::pair<std::string,std::string>, int> matrizDispersa;

public:
    GestorRutas();

    // Gestion de ruta (lista enlazada)
    void agregarCiudad(const std::string& nombre);
    void eliminarCiudadNombre(const std::string& nombre);
    void eliminarCiudadPosicion(int pos);
    void mostrarRuta() const;

    // Matrices
    void cargarDistancias1D();
    void mostrarDistancias1D() const;

    void cargarTiempos2D();
    void mostrarTiempos2D() const;

    void agregarRutaPrioritaria(const std::string& origen, const std::string& destino, int prioridad);
    void mostrarMatrizDispersa() const;

    void mostrarResumen() const;
};
