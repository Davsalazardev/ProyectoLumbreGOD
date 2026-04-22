#include "SistemaMensajeria.h"
#include <iostream>
#include <string>
#include <limits>

SistemaMensajeria::SistemaMensajeria() {}

void SistemaMensajeria::ejecutar() {
    int opcion;
    do {
        std::cout << "\n========================================\n";
        std::cout << "   SISTEMA DE MENSAJERIA\n";
        std::cout << "========================================\n";
        std::cout << "1. Gestion de Rutas (Lista Enlazada)\n";
        std::cout << "2. Gestion de Paquetes (Cola / Pila)\n";
        std::cout << "3. Simulacion con Cola Circular\n";
        std::cout << "4. Manejo de Matrices\n";
        std::cout << "5. Resumen General\n";
        std::cout << "0. Salir\n";
        std::cout << "Opcion: ";
        std::cin >> opcion;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        switch (opcion) {
            case 1: menuRutas(); break;
            case 2: menuPaquetes(); break;
            case 3: menuSimulacion(); break;
            case 4: menuMatrices(); break;
            case 5: mostrarResumenGeneral(); break;
            case 0: std::cout << "Saliendo del sistema.\n"; break;
            default: std::cout << "Opcion invalida.\n";
        }
    } while (opcion != 0);
}

// --- Menu Rutas ---
void SistemaMensajeria::menuRutas() {
    int op;
    do {
        std::cout << "\n--- Gestion de Rutas ---\n";
        std::cout << "1. Agregar ciudad\n";
        std::cout << "2. Eliminar ciudad por nombre\n";
        std::cout << "3. Eliminar ciudad por posicion\n";
        std::cout << "4. Mostrar ruta\n";
        std::cout << "0. Volver\n";
        std::cout << "Opcion: ";
        std::cin >> op;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        if (op == 1) {
            std::string nombre;
            std::cout << "Nombre de la ciudad: ";
            std::getline(std::cin, nombre);
            gestorRutas.agregarCiudad(nombre);
        } else if (op == 2) {
            std::string nombre;
            std::cout << "Nombre a eliminar: ";
            std::getline(std::cin, nombre);
            gestorRutas.eliminarCiudadNombre(nombre);
        } else if (op == 3) {
            int pos;
            std::cout << "Posicion a eliminar: ";
            std::cin >> pos;
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            gestorRutas.eliminarCiudadPosicion(pos);
        } else if (op == 4) {
            gestorRutas.mostrarRuta();
        }
    } while (op != 0);
}

// --- Menu Paquetes ---
void SistemaMensajeria::menuPaquetes() {
    int op;
    do {
        std::cout << "\n--- Gestion de Paquetes ---\n";
        std::cout << "1. Agregar paquete pendiente (cola)\n";
        std::cout << "2. Procesar paquete pendiente\n";
        std::cout << "3. Agregar paquete urgente (pila)\n";
        std::cout << "4. Procesar paquete urgente\n";
        std::cout << "0. Volver\n";
        std::cout << "Opcion: ";
        std::cin >> op;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        if (op == 1) {
            std::string id, destino;
            std::cout << "ID del paquete: "; std::getline(std::cin, id);
            std::cout << "Destino: ";        std::getline(std::cin, destino);
            gestorPaquetes.agregarPendiente(Paquete(id, destino, false));
        } else if (op == 2) {
            gestorPaquetes.procesarPendiente();
        } else if (op == 3) {
            std::string id, destino;
            std::cout << "ID del paquete urgente: "; std::getline(std::cin, id);
            std::cout << "Destino: ";               std::getline(std::cin, destino);
            gestorPaquetes.agregarUrgente(Paquete(id, destino, true));
        } else if (op == 4) {
            gestorPaquetes.procesarUrgente();
        }
    } while (op != 0);
}

// --- Menu Simulacion ---
void SistemaMensajeria::menuSimulacion() {
    int op;
    do {
        std::cout << "\n--- Simulacion Cola Circular (Camion) ---\n";
        std::cout << "1. Cargar punto de control\n";
        std::cout << "2. Simular desplazamiento\n";
        std::cout << "3. Mostrar posicion actual\n";
        std::cout << "0. Volver\n";
        std::cout << "Opcion: ";
        std::cin >> op;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        if (op == 1) {
            std::string punto;
            std::cout << "Nombre del punto de control: ";
            std::getline(std::cin, punto);
            gestorPaquetes.cargarPuntoControl(punto);
        } else if (op == 2) {
            gestorPaquetes.simularDesplazamiento();
        } else if (op == 3) {
            gestorPaquetes.mostrarPosicionActual();
        }
    } while (op != 0);
}

// --- Menu Matrices ---
void SistemaMensajeria::menuMatrices() {
    int op;
    do {
        std::cout << "\n--- Manejo de Matrices ---\n";
        std::cout << "1. Cargar y ver Matriz 1D (distancias)\n";
        std::cout << "2. Cargar y ver Matriz 2D (tiempos)\n";
        std::cout << "3. Agregar ruta prioritaria (dispersa)\n";
        std::cout << "4. Ver matriz dispersa\n";
        std::cout << "0. Volver\n";
        std::cout << "Opcion: ";
        std::cin >> op;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');

        if (op == 1) {
            gestorRutas.cargarDistancias1D();
            gestorRutas.mostrarDistancias1D();
        } else if (op == 2) {
            gestorRutas.cargarTiempos2D();
            gestorRutas.mostrarTiempos2D();
        } else if (op == 3) {
            std::string origen, destino; int prioridad;
            std::cout << "Origen: ";   std::getline(std::cin, origen);
            std::cout << "Destino: ";  std::getline(std::cin, destino);
            std::cout << "Prioridad (1-10): "; std::cin >> prioridad;
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n');
            gestorRutas.agregarRutaPrioritaria(origen, destino, prioridad);
        } else if (op == 4) {
            gestorRutas.mostrarMatrizDispersa();
        }
    } while (op != 0);
}

void SistemaMensajeria::mostrarResumenGeneral() const {
    std::cout << "\n========== RESUMEN GENERAL ==========\n";
    std::cout << "-- Rutas --\n";
    gestorRutas.mostrarResumen();
    std::cout << "-- Paquetes --\n";
    gestorPaquetes.mostrarResumen();
    std::cout << "=====================================\n";
}
