using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OptiFlujo.Api.Data;
using OptiFlujo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// ---------------------------------------------------------------- datos
var cadena = builder.Configuration.GetConnectionString("OptiFlujo")
    ?? throw new InvalidOperationException("Falta la cadena de conexion.");

builder.Services.AddDbContext<OptiFlujoDbContext>(opciones =>
    opciones.UseMySql(cadena, ServerVersion.AutoDetect(cadena)));

// ------------------------------------------------------------ servicios
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<UsuarioService>();
builder.Services.AddScoped<PacienteService>();

// ----------------------------------------------------------------- CORS
// Se declara como politica predeterminada para que tambien se aplique a
// las peticiones previas de tipo OPTIONS que el navegador envia antes de
// un POST con contenido JSON. Permitir cualquier origen es aceptable
// mientras el sistema esta en desarrollo; al entregar debe restringirse
// al dominio del cliente web.
builder.Services.AddCors(opciones =>
    opciones.AddDefaultPolicy(politica =>
        politica.SetIsOriginAllowed(_ => true)
                .AllowAnyHeader()
                .AllowAnyMethod()));

// -------------------------------------------------------------- accesos
var claveJwt = builder.Configuration["Jwt:Clave"]
    ?? throw new InvalidOperationException("Falta la clave de firma.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "OptiFlujo",
            ValidAudience = "OptiFlujo",
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(claveJwt))
        };
    });

builder.Services.AddAuthorization();

// ---------------------------------------------------------- controlador
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(opciones =>
{
    opciones.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "OptiFlujo",
        Version = "v1",
        Description = "Gestion de pacientes y servicios oftalmologicos"
    });

    opciones.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Escriba: Bearer y luego el token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    opciones.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// -------------------------------------------------------------- tuberia
// El orden es significativo. CORS debe resolverse antes que la
// autenticacion, de lo contrario las peticiones previas se rechazan por
// falta de credenciales antes de recibir la cabecera de permiso.
app.UseCors();

app.UseDefaultFiles();
app.UseStaticFiles();

app.UseSwagger();
app.UseSwaggerUI();

// La redireccion a HTTPS se omite porque la plataforma de despliegue la
// resuelve antes de entregar la peticion al contenedor.

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("index.html");

app.Run();