#include "GestorRutas.h"
#include <iostream>
#include <iomanip>

GestorRutas::GestorRutas() {}

// --- Lista enlazada ---
void GestorRutas::agregarCiudad(const std::string& nombre) {
    ruta.agregarCiudad(nombre);
}
void GestorRutas::eliminarCiudadNombre(const std::string& nombre) {
    ruta.eliminarPorNombre(nombre);
}
void GestorRutas::eliminarCiudadPosicion(int pos) {
    ruta.eliminarPorPosicion(pos);
}
void GestorRutas::mostrarRuta() const {
    ruta.mostrarRuta();
}

// --- Matriz 1D ---
void GestorRutas::cargarDistancias1D() {
    etiquetas1D = {"CDMX-Puebla", "Puebla-Veracruz", "CDMX-Queretaro",
                   "Queretaro-Leon", "Leon-GDL"};
    distancias1D = {130, 280, 215, 60, 50};
    std::cout << "Distancias 1D cargadas con " << distancias1D.size() << " rutas.\n";
}

void GestorRutas::mostrarDistancias1D() const {
    if (distancias1D.empty()) { std::cout << "Matriz 1D no cargada.\n"; return; }
    std::cout << "\n--- Distancias 1D (km) ---\n";
    for (size_t i = 0; i < etiquetas1D.size(); i++)
        std::cout << "  " << std::left << std::setw(22) << etiquetas1D[i]
                  << ": " << distancias1D[i] << " km\n";
}

// --- Matriz 2D ---
void GestorRutas::cargarTiempos2D() {
    ciudades2D = {"CDMX", "Puebla", "Veracruz", "GDL"};
    int n = ciudades2D.size();
    tiempos2D = std::vector<std::vector<int>>(n, std::vector<int>(n, 0));
    // Tiempos en minutos (aproximados)
    tiempos2D[0][1] = 90;  tiempos2D[1][0] = 90;
    tiempos2D[0][2] = 270; tiempos2D[2][0] = 270;
    tiempos2D[0][3] = 360; tiempos2D[3][0] = 360;
    tiempos2D[1][2] = 180; tiempos2D[2][1] = 180;
    tiempos2D[1][3] = 450; tiempos2D[3][1] = 450;
    tiempos2D[2][3] = 600; tiempos2D[3][2] = 600;
    std::cout << "Tiempos 2D cargados para " << n << " ciudades.\n";
}

void GestorRutas::mostrarTiempos2D() const {
    if (tiempos2D.empty()) { std::cout << "Matriz 2D no cargada.\n"; return; }
    int n = ciudades2D.size();
    std::cout << "\n--- Tiempos 2D (minutos) ---\n";
    std::cout << std::setw(12) << " ";
    for (auto& c : ciudades2D) std::cout << std::setw(10) << c;
    std::cout << "\n";
    for (int i = 0; i < n; i++) {
        std::cout << std::setw(12) << ciudades2D[i];
        for (int j = 0; j < n; j++)
            std::cout << std::setw(10) << tiempos2D[i][j];
        std::cout << "\n";
    }
}

// --- Matriz dispersa ---
void GestorRutas::agregarRutaPrioritaria(const std::string& origen,
                                          const std::string& destino, int prioridad) {
    matrizDispersa[{origen, destino}] = prioridad;
    std::cout << "Ruta prioritaria " << origen << " -> " << destino
              << " (prioridad: " << prioridad << ") registrada.\n";
}

void GestorRutas::mostrarMatrizDispersa() const {
    if (matrizDispersa.empty()) { std::cout << "Sin rutas prioritarias.\n"; return; }
    std::cout << "\n--- Matriz Dispersa (Rutas Prioritarias) ---\n";
    for (auto& entry : matrizDispersa)
        std::cout << "  " << entry.first.first << " -> "
                  << entry.first.second << " : " << entry.second << "\n";
}

void GestorRutas::mostrarResumen() const {
    std::cout << "  Ciudades en ruta:      " << ruta.getTamano() << "\n";
    std::cout << "  Distancias 1D:         " << distancias1D.size() << " entradas\n";
    std::cout << "  Tiempos 2D:            " << ciudades2D.size() << "x"
              << ciudades2D.size() << " ciudades\n";
    std::cout << "  Rutas prioritarias:    " << matrizDispersa.size() << " entradas\n";
}
