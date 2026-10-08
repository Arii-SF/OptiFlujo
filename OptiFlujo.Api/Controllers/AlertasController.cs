using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OptiFlujo.Api.Data;

namespace OptiFlujo.Api.Controllers;

[ApiController]
[Route("api/alertas")]
[Authorize]
public class AlertasController : ControllerBase
{
    private readonly OptiFlujoDbContext _contexto;

    public AlertasController(OptiFlujoDbContext contexto)
    {
        _contexto = contexto;
    }

    /// <summary>
    /// RF-33 y RF-34. El parametro permite consultar las proximas a vencer,
    /// las ya vencidas, o ambas.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? estado)
    {
        var consulta = _contexto.Alertas.AsNoTracking()
            .Where(a => a.EstadoVigencia != "VIGENTE");

        if (!string.IsNullOrWhiteSpace(estado))
            consulta = consulta.Where(a => a.EstadoVigencia == estado.ToUpper());

        return Ok(await consulta.OrderBy(a => a.DiasRestantes).ToListAsync());
    }
}