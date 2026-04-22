#pragma once
#include <string>

class Paquete {
public:
    std::string id;
    std::string destino;
    bool urgente;

    Paquete(const std::string& id, const std::string& destino, bool urgente = false);
    void mostrar() const;
};
