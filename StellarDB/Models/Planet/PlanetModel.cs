using System.ComponentModel.DataAnnotations;
using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using StellarDB.Models.Composition;
using StellarDB.Services;

namespace StellarDB.Models.Planet
{
    public class PlanetModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }

        [Required(ErrorMessage = "Planet name is required")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Planet type is required")]
        public string PlanetTypeId { get; set; }

        public string? StarId { get; set; }

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
        public double DistanceFromStar { get; set; }

        [Range(0, double.MaxValue, ErrorMessage = "Surface temperature must be a positive value")]
        public double SurfaceTemperature { get; set; }

        public DateOnly DiscoveryDate { get; set; }

        public string? Description { get; set; }

        [CompositionValidation("composition")]
        public List<CompositionModel>? Composition { get; set; }

        [CompositionValidation("atmosphere")]
        public List<CompositionModel>? Atmosphere { get; set; }
    }

    public class PlanetXmlWrapper
    {
        [XmlElement("Planet")]
        public List<PlanetXmlModel> Items { get; set; } = new();
    }

    public class PlanetXmlModel
    {
        [XmlElement("Name")]
        public string Name { get; set; }
        [XmlElement("PlanetType")]
        public string PlanetTypeId { get; set; }
        [XmlElement("Mass")]
        public double Mass { get; set; } // in Earth masses (M⊕)
        [XmlElement("Diameter")]
        public double Diameter { get; set; } // in kilometers (km)
        [XmlElement("RotationPeriod")]
        public double RotationPeriod { get; set; } // in hours (hr)
        [XmlElement("OrbitalPeriod")]
        public double OrbitalPeriod { get; set; } // in Earth days
        [XmlElement("OrbitalEccentricity")]
        public double OrbitalEccentricity { get; set; }  // dimensionless value (0 for circular, 1 for parabolic)
        [XmlElement("OrbitalInclination")]
        public double OrbitalInclination { get; set; } // in degrees
        [XmlElement("SemiMajorAxis")]
        public double SemiMajorAxis { get; set; } // in astronomical units (AU)
        [XmlElement("DistanceFromStar")]
        public double DistanceFromStar { get; set; } // in astronomical units (AU)
        [XmlElement("SurfaceTemperature")]
        public double SurfaceTemperature { get; set; } // in Kelvin (K)
        [XmlElement("DiscoveryDate")]
        public DateOnly DiscoveryDate { get; set; }
        [XmlElement("StarId")]
        public string? StarId { get; set; } // Reference to the star this planet orbits
        [XmlElement("Description")]
        public string? Description { get; set; }
    }
}
