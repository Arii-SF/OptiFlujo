# OptiFlujo

Sistema de gestión de pacientes y servicios oftalmológicos con integración de
punto de venta.

Trabajo de graduación de la carrera de Ingeniería en Sistemas, Universidad
Mariano Gálvez de Guatemala.

## Descripción

OptiFlujo es una plataforma web para establecimientos ópticos pequeños. Reúne
en un solo lugar el expediente clínico del paciente, el historial de
prescripciones con control de vigencia, la agenda de citas y el registro de
ventas, procesos que hoy se llevan de forma manual y dispersa.

## Estado

En desarrollo. Módulos operativos:

- [x] Modelo de datos y despliegue de la base
- [x] Autenticación y control de acceso por rol
- [x] Expediente del paciente con historial de graduaciones
- [ ] Registro de prescripciones
- [ ] Agenda de citas
- [ ] Inventario
- [ ] Punto de venta
- [ ] Alertas de vencimiento

## Tecnologías

| Capa | Tecnología |
| Presentación | React, Vite, TypeScript |
| Lógica de negocio | ASP.NET Core 8 |
| Acceso a datos | Entity Framework Core |
| Base de datos | MySQL 8 |
| Despliegue | Railway |

## Estructura
