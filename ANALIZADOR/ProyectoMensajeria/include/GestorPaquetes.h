#pragma once
#include "Paquete.h"
#include <queue>
#include <stack>
#include <vector>
#include <string>

class GestorPaquetes {
private:
    // Cola FIFO - paquetes pendientes
    std::queue<Paquete> colaPendientes;

    // Pila LIFO - paquetes urgentes
    std::stack<Paquete> pilaUrgentes;

    // Cola circular - puntos de control del camion
    std::vector<std::string> colaCircular;
    int capacidadCircular;
    int frente;
    int fin;
    int conteoCircular;

public:
    GestorPaquetes(int capacidadCircular = 5);

    // Cola pendientes
    void agregarPendiente(const Paquete& p);
    void procesarPendiente();

    // Pila urgentes
    void agregarUrgente(const Paquete& p);
    void procesarUrgente();

    // Cola circular
    void cargarPuntoControl(const std::string& punto);
    void simularDesplazamiento();
    void mostrarPosicionActual() const;

    // Resumen
    void mostrarResumen() const;
};
