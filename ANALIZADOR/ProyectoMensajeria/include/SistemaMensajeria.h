#pragma once
#include "GestorRutas.h"
#include "GestorPaquetes.h"

class SistemaMensajeria {
private:
    GestorRutas gestorRutas;
    GestorPaquetes gestorPaquetes;

    void menuRutas();
    void menuPaquetes();
    void menuMatrices();
    void menuSimulacion();

public:
    SistemaMensajeria();
    void ejecutar();
    void mostrarResumenGeneral() const;
};
