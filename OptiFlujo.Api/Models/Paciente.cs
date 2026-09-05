namespace OptiFlujo.Api.Models;

public class Paciente
{
    public int IdPaciente { get; set; }
    public string NombreCompleto { get; set; } = string.Empty;
    public string? Dpi { get; set; }
    public DateOnly? FechaNacimiento { get; set; }
    public string? Telefono { get; set; }
    public string? Correo { get; set; }
    public decimal? DistanciaInterpupilar { get; set; }
    public string? AntecedentesOculares { get; set; }
    public DateTime FechaRegistro { get; set; }
    public bool Activo { get; set; } = true;

    public ICollection<RecetaMedica> Recetas { get; set; } = new List<RecetaMedica>();
}