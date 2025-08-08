using System.Xml.Serialization;
using MongoDB.Bson.Serialization.Attributes;
using StellarDB.Models.Composition;

namespace StellarDB.Models.Planet
{
    public class PlanetModel
    {
        [BsonId]
        [BsonRepresentation(MongoDB.Bson.BsonType.ObjectId)]
        public string? Id { get; set; }
        public string Name { get; set; }
        public string PlanetTypeId { get; set; }
        public string? StarId { get; set; } // Reference to the star this planet orbits
        public double Mass { get; set; } // in Earth masses (M⊕)
        public double Diameter { get; set; } // in kilometers (km)
        public double RotationPeriod { get; set; } // in hours (hr)
        public double OrbitalPeriod { get; set; } // in Earth days
        public double OrbitalEccentricity { get; set; }  // dimensionless value (0 for circular, 1 for parabolic)
        public double OrbitalInclination { get; set; } // in degrees
        public double SemiMajorAxis { get; set; } // in astronomical units (AU)
        public double DistanceFromStar { get; set; } // in astronomical units (AU)
        public double SurfaceTemperature { get; set; } // in Kelvin (K)
        public DateTime DiscoveryDate { get; set; }
        public string? Description { get; set; }
        public List<CompositionModel>? Composition { get; set; } // Composition of the planet, e.g., "Hydrogen: 75%, Helium: 24%, Oxygen: 1%"
        public List<CompositionModel>? Atmosphere { get; set; } // Atmospheric composition, e.g., "Nitrogen: 78%, Oxygen: 21%, Argon: 0.93%"
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
        public DateTime DiscoveryDate { get; set; }
        [XmlElement("StarId")]
        public string? StarId { get; set; } // Reference to the star this planet orbits
        [XmlElement("Description")]
        public string? Description { get; set; }
    }
}
