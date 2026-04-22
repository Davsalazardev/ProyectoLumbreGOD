#include "Paquete.h"
#include <iostream>

Paquete::Paquete(const std::string& id, const std::string& destino, bool urgente)
    : id(id), destino(destino), urgente(urgente) {}

void Paquete::mostrar() const {
    std::cout << "Paquete [" << id << "] -> Destino: " << destino
              << (urgente ? " [URGENTE]" : "") << "\n";
}
