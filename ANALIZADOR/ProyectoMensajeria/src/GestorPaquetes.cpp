#include "GestorPaquetes.h"
#include <iostream>

GestorPaquetes::GestorPaquetes(int cap)
    : capacidadCircular(cap), frente(0), fin(0), conteoCircular(0) {
    colaCircular.resize(cap);
}

// --- Cola pendientes ---
void GestorPaquetes::agregarPendiente(const Paquete& p) {
    colaPendientes.push(p);
    std::cout << "Paquete agregado a cola pendientes: ";
    p.mostrar();
}

void GestorPaquetes::procesarPendiente() {
    if (colaPendientes.empty()) {
        std::cout << "No hay paquetes pendientes.\n"; return;
    }
    std::cout << "Procesando paquete pendiente: ";
    colaPendientes.front().mostrar();
    colaPendientes.pop();
}

// --- Pila urgentes ---
void GestorPaquetes::agregarUrgente(const Paquete& p) {
    pilaUrgentes.push(p);
    std::cout << "Paquete urgente agregado: ";
    p.mostrar();
}

void GestorPaquetes::procesarUrgente() {
    if (pilaUrgentes.empty()) {
        std::cout << "No hay paquetes urgentes.\n"; return;
    }
    std::cout << "Procesando paquete urgente (LIFO): ";
    pilaUrgentes.top().mostrar();
    pilaUrgentes.pop();
}

// --- Cola circular ---
void GestorPaquetes::cargarPuntoControl(const std::string& punto) {
    if (conteoCircular == capacidadCircular) {
        std::cout << "Cola circular llena. Capacidad: " << capacidadCircular << "\n"; return;
    }
    colaCircular[fin] = punto;
    fin = (fin + 1) % capacidadCircular;
    conteoCircular++;
    std::cout << "Punto de control '" << punto << "' cargado.\n";
}

void GestorPaquetes::simularDesplazamiento() {
    if (conteoCircular == 0) {
        std::cout << "No hay puntos de control cargados.\n"; return;
    }
    std::cout << "Camion avanza de '" << colaCircular[frente] << "'";
    frente = (frente + 1) % capacidadCircular;
    std::cout << " a '" << colaCircular[frente] << "'\n";
}

void GestorPaquetes::mostrarPosicionActual() const {
    if (conteoCircular == 0) {
        std::cout << "Sin puntos de control.\n"; return;
    }
    std::cout << "Posicion actual del camion: " << colaCircular[frente] << "\n";
}

// --- Resumen ---
void GestorPaquetes::mostrarResumen() const {
    std::cout << "  Pendientes en cola: " << colaPendientes.size() << "\n";
    std::cout << "  Urgentes en pila:   " << pilaUrgentes.size() << "\n";
    std::cout << "  Puntos de control:  " << conteoCircular << "/" << capacidadCircular << "\n";
}
