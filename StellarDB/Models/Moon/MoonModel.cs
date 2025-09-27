using MongoDB.Bson.Serialization.Attributes;
using StellarDB.Models.Composition;
using StellarDB.Services;
using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;

namespace StellarDB.Models.Moon
{
    public class MoonModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; } = null!;
        [BsonRequired]
        [Required(ErrorMessage = "Moon name is required")]
        public string Name { get; set; } = null!;
        public string PlanetId { get; set; } = null!;

        [Range(0, double.MaxValue, ErrorMessage = "Mass must be a positive value")]
        public double Mass { get; set; }


        [Range(0, double.MaxValue, ErrorMessage = "Diameter must be a positive value")]
        public double Diameter { get; set; }


        [Range(0, double.MaxValue, ErrorMessage = "Rotation period must be a positive value")]
        public double RotationPeriod { get; set; }


        [Range(0, double.MaxValue, ErrorMessage = "Orbital period must be a positive value")]
        public double OrbitalPeriod { get; set; }


        [Range(0, 1, ErrorMessage = "Orbital eccentricity must be between 0 and 1")]
        public double OrbitalEccentricity { get; set; }


        [Range(0, 360, ErrorMessage = "Orbital inclination must be between 0 and 360 degrees")]
        public double OrbitalInclination { get; set; }


        [Range(0, double.MaxValue, ErrorMessage = "Semi-major axis must be a positive value")]
        public double SemiMajorAxis { get; set; }


        [Range(0, double.MaxValue, ErrorMessage = "Distance from star must be a positive value")]
        public double DistanceFromPlanet { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Surface temperature must be a positive value")]
        public double SurfaceTemperature { get; set; }

        public DateOnly DiscoveryDate { get; set; }

        public string? Description { get; set; }

        [CompositionValidation("composition")]
        public List<CompositionModel>? Composition { get; set; }
    }

    public class MoonQueryParameters
    {
        public string? Name { get; set; }
        public string? PlanetId { get; set; }
        public double? MinMass { get; set; }
        public double? MaxMass { get; set; }
        public double? MinDiameter { get; set; }
        public double? MaxDiameter { get; set; }
        public double? MinSurfaceTemperature { get; set; }
        public double? MaxSurfaceTemperature { get; set; }
        public double? MinOrbitalPeriod { get; set; }
        public double? MaxOrbitalPeriod { get; set; }
        public DateOnly? From { get; set; }
        public DateOnly? To { get; set; }
    }

    public class MoonXmlWrapper
    {
        [XmlElement("Moon")]
        public List<MoonXmlModel> Moons { get; set; } = null!;
    }

    public class MoonXmlModel
    {
        [XmlElement("Name")]
        public string Name { get; set; } = null!;
        [XmlElement("Planet")]
        public string Planet { get; set; } = null!;
        [XmlElement("Mass")]
        public double Mass { get; set; }
        [XmlElement("Diameter")]
        public double Diameter { get; set; }
        [XmlElement("RotationPeriod")]
        public double RotationPeriod { get; set; }
        [XmlElement("OrbitalPeriod")]
        public double OrbitalPeriod { get; set; }
        [XmlElement("OrbitalEccentricity")]
        public double OrbitalEccentricity { get; set; }
        [XmlElement("OrbitalInclination")]
        public double OrbitalInclination { get; set; }
        [XmlElement("SemiMajorAxis")]
        public double SemiMajorAxis { get; set; }
        [XmlElement("DistanceFromStar")]
        public double DistanceFromPlanet { get; set; }
        [XmlElement("SurfaceTemperature")]
        public double SurfaceTemperature { get; set; }
        [XmlElement("DiscoveryDate")]
        public DateOnly DiscoveryDate { get; set; }
        [XmlElement("Description")]
        public string? Description { get; set; }
        //[XmlElement("Name")]
        //public List<CompositionModel>? Composition { get; set; }
    }
}
