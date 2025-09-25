# StellarDB

StellarDB is a comprehensive astronomical database management system designed for cataloging and managing stellar and planetary data. The application provides a robust platform for astronomers, researchers, and space enthusiasts to store, search, and analyze celestial object information.

## 🌟 Features

### Core Functionality
- **Star Management**: Catalog stars with detailed properties including spectral classes, luminosity classes, magnitude, distance, mass, temperature, and discovery dates
- **Planet Management**: Track planets with comprehensive orbital mechanics, physical properties, atmospheric composition, and relationship to host stars
- **Data Import/Export**: Support for CSV and XML data formats for bulk operations
- **Advanced List Filtering**: Filter results on various tables

### Technical Features
- **JWT Authentication**: Secure user authentication and authorization system
- **Role-Based Access Control**: Granular permissions for read, write, and delete operations
- **REST API**: Comprehensive RESTful API for all data operations
- **Data Validation**: Robust validation for astronomical data integrity
- **Audit Logging**: Complete audit trail for all data modifications
- **Modern Web Interface**: Responsive Angular frontend with Material Design

## 🏗️ Architecture

StellarDB follows a modern full-stack architecture:

- **Backend**: ASP.NET Core 9.0 Web API
- **Frontend**: Angular 20.1.0 with TypeScript
- **Primary Database**: MongoDB for astronomical data storage
- **Identity Database**: SQL Server for user management and authentication
- **Authentication**: JWT Bearer tokens with refresh token support
- **API Documentation**: Swagger/OpenAPI integration

## 📋 Prerequisites

Before setting up StellarDB, ensure you have the following installed:

- **.NET 9.0 SDK** or later
- **Node.js 18+** and npm
- **MongoDB 4.4+** (local or remote instance)
- **SQL Server** (LocalDB, Express, or full version)
- **Git** for version control

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/adhurimhalili/StellarDB.git
cd StellarDB
```

### 2. Backend Setup (.NET API)

#### Configure Database Connections

1. Navigate to the backend directory:
```bash
cd StellarDB
```

2. Update connection strings in `appsettings.json` or use user secrets:
```json
{
  "ConnectionStrings": {
    "StellarSQL": "Server=localhost; Database=StellarDB; Trusted_Connection=True; TrustServerCertificate=True;",
    "StellarMongoDB": "mongodb://localhost:27017/StellarDB"
  }
}
```

3. For production, configure user secrets:
```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:StellarSQL" "your-sql-connection-string"
dotnet user-secrets set "ConnectionStrings:StellarMongoDB" "your-mongodb-connection-string"
dotnet user-secrets set "JwtSettings:SecretKey" "your-jwt-secret-key"
```

#### Install Dependencies and Run

```bash
# Restore NuGet packages
dotnet restore

# Apply database migrations (for SQL Server)
dotnet ef database update

# Build the project
dotnet build

# Run the API (will be available at https://localhost:7271)
dotnet run
```

The API will be available at:
- HTTPS: `https://localhost:7271`
- HTTP: `http://localhost:5000`
- Swagger UI: `https://localhost:7271/swagger`

### 3. Frontend Setup (Angular)

1. Navigate to the frontend directory:
```bash
cd ../StellarDBFront
```

2. Install dependencies (including optional dependencies required for build):
```bash
npm install
```

3. Configure API endpoint in `src/app/global-config.ts`:
```typescript
export const GlobalConfig = {
  apiUrl: 'https://localhost:7271/api',  // Update if your API runs on different port
  // ... other configurations
}
```

4. Start the development server:
```bash
npm start
```

**Note**: Do not use `--no-optional` or `--omit=optional` flags when installing dependencies, as esbuild and other build tools require optional platform-specific packages.

The frontend will be available at `http://127.0.0.1:4200`

### 4. Database Setup

#### MongoDB Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `StellarDB`
3. The application will automatically create required collections on first run

#### SQL Server Setup
1. Ensure SQL Server is running
2. The application will create the `StellarDB` database automatically
3. Run migrations to create identity tables:
```bash
cd StellarDB
dotnet ef database update
```

### 5. Initial Data Seeding

The application includes automatic data seeding in development mode. On first run, it will populate:
- Admin and Manager user account with roles and claims policies.

## 🔐 Authentication & API Access

### User Registration
 `Email:User` and `Email:Password` user secrets required for email confirmation; otherwise user registration will not work.
1. Navigate to the application frontend
2. Register a new account with email confirmation
3. Login to access the dashboard

### API Authentication
The API uses JWT Bearer tokens. To access protected endpoints:

1. **Login**: POST to `/api/auth/login` with credentials
2. **Use Token**: Include in Authorization header: `Bearer <your-token>`
3. **Refresh**: Use refresh token endpoint when token expires

### Access Levels
- **ReadAccess**: View astronomical data, export functionality
- **WriteAccess**: Create and edit data, import functionality  
- **DeleteAccess**: Remove data entries
- **IdentityAccess**: Full system access over user Identity
- **AdminAccess**: Access on other system administrator tools

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

#### Stars
- `GET /api/star` - List all stars
- `POST /api/star` - Create new star
- `GET /api/star/{id}` - Get star by ID
- `PUT /api/star/{id}` - Update star
- `DELETE /api/star/{id}` - Delete star

#### Planets
- `GET /api/planet` - List all planets
- `POST /api/planet` - Create new planet
- `GET /api/planet/{id}` - Get planet by ID
- `PUT /api/planet/{id}` - Update planet
- `DELETE /api/planet/{id}` - Delete planet

## 🔧 Configuration

### Environment Variables
The application supports configuration through environment variables:

- `ASPNETCORE_ENVIRONMENT` - Set to `Production` for production builds
- `ConnectionStrings__StellarSQL` - SQL Server connection string
- `ConnectionStrings__StellarMongoDB` - MongoDB connection string
- `JwtSettings__SecretKey` - JWT signing key
- `JwtSettings__Issuer` - JWT issuer
- `JwtSettings__Audience` - JWT audience

### JWT Configuration
Configure JWT settings in `appsettings.json`:
```json
{
  "JwtSettings": {
    "Issuer": "StellarDB",
    "Audience": "StellarDB-Frontend",
    "TokenExpirationInMinutes": 60,
    "RefreshTokenExpirationInDays": 7
  }
}
```

## 🛠️ Troubleshooting

### Common Issues

#### Frontend Build Issues
- **Error: "The package '@esbuild/linux-x64' could not be found"**: Make sure to install all dependencies including optional ones using `npm install` (without `--no-optional` flag)
- **Font loading errors**: If building offline or behind a firewall, some Google Fonts may fail to load during build. This doesn't affect the functionality in development mode.

#### Backend Issues  
- **Database connection errors**: Verify MongoDB and SQL Server are running and connection strings are correct
- **JWT errors**: Ensure JWT secret key is configured in user secrets or appsettings
- **StellarDB Email**: Ensure `Email:User` and `Email:Password` user secret values are set up for proper account registration

#### API Connection Issues
- **CORS errors**: Verify the frontend API URL matches the backend URL in `global-config.ts`
- **Authentication issues**: Check that JWT tokens are being sent with API requests
