# StellarDB

StellarDB is a comprehensive astronomical database system consisting of:
- **Backend API**: .NET 9.0 Web API with SQL Server and MongoDB support
- **Frontend**: Angular 20.1.0 application with Material UI and TailwindCSS

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites and SDK Installation
- Download and install .NET 9.0 SDK (required for backend):
  ```bash
  wget https://dotnet.microsoft.com/en-us/download/dotnet/scripts/v1/dotnet-install.sh
  chmod +x dotnet-install.sh
  ./dotnet-install.sh --channel 9.0
  export PATH="/home/runner/.dotnet:$PATH"
  ```
- Node.js v20+ and npm are required (usually pre-installed)
- Verify installations: `dotnet --version` (should be 9.0.x), `node --version`, `npm --version`

### Backend (.NET API) Build and Run
- Navigate to project root: `cd /path/to/StellarDB`
- Restore packages: `dotnet restore` -- takes ~2 minutes. NEVER CANCEL. Set timeout to 5+ minutes.
- Build the solution: `dotnet build` -- takes ~4 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
- Run the API: `cd StellarDB && dotnet run`
  - HTTP endpoint: http://localhost:5292
  - HTTPS endpoint: https://localhost:7271 (if using `dotnet run --launch-profile https`)
  - Swagger UI: http://localhost:5292/swagger/index.html
- **VALIDATION**: Always verify API is working by accessing Swagger UI at http://localhost:5292/swagger/index.html

### Frontend (Angular) Build and Run
- Navigate to frontend: `cd StellarDBFront`
- Install dependencies: `npm install` -- takes ~2 seconds
- Development build: `npx ng build --configuration=development` -- takes ~11 seconds
- **IMPORTANT**: Production build fails due to external font loading restrictions. Always use development configuration.
- Start development server: `npm start`
  - Runs on: http://127.0.0.1:58211/
- **VALIDATION**: Always verify frontend loads by accessing http://127.0.0.1:58211/

### Testing
- **Backend Tests**: `dotnet test` -- No test projects exist, command completes quickly
- **Frontend Tests**: Frontend unit tests have configuration issues and fail to run
- **Manual Validation**: Always test both API (via Swagger) and frontend (via browser) after changes

## Known Issues and Workarounds

### Build Issues
- **Frontend production build fails**: Use `--configuration=development` for all builds
- **Font loading errors**: External font URLs (fonts.googleapis.com) are blocked - development builds bypass this
- **Bundle size warnings**: Development configuration ignores bundle size limits

### Test Issues
- **Frontend tests fail**: Multiple import/export mismatches in test files - these do not affect application functionality
- **No backend tests**: Solution contains no test projects

### Import Path Issues
- **Case sensitivity**: Angular Material imports must use lowercase `@angular/material/select`, not `@Angular/material/select`
- **Missing commas**: Check routing files for syntax errors

## Configuration Details

### Database Configuration
- **SQL Server**: Connection string in `appsettings.json` points to `localhost` with trusted connection
- **MongoDB**: Connection string configured for `mongodb://localhost:27017/StellarDB`
- **Note**: Databases are not required for basic API startup, but some endpoints may fail without them

### API Endpoints
- Frontend expects API at: `https://localhost:7271/api` (configured in `global-config.ts`)
- Backend runs on: `http://localhost:5292` by default
- Use HTTPS profile for production: `dotnet run --launch-profile https`

### Port Configuration
- Backend HTTP: 5292
- Backend HTTPS: 7271
- Frontend: 58211 (configured in `angular.json` and `package.json`)

## Validation Scenarios

After making any changes, always validate:

1. **Backend functionality**:
   ```bash
   cd StellarDB && dotnet run
   # In another terminal:
   curl http://localhost:5292/swagger/index.html
   ```

2. **Frontend functionality**:
   ```bash
   cd StellarDBFront && npm start
   # In another terminal:
   curl http://127.0.0.1:58211/
   ```

3. **Full-stack integration**:
   - Start backend with HTTPS: `dotnet run --launch-profile https`
   - Start frontend: `npm start`
   - Verify frontend can communicate with API

## Common Commands Reference

### Repository Structure
```
/path/to/StellarDB/
├── StellarDB/                 # .NET 9.0 Web API backend
│   ├── Controllers/           # API controllers
│   ├── Models/               # Data models
│   ├── Services/             # Business logic services
│   ├── Data/                 # Entity Framework contexts
│   └── Program.cs            # Application entry point
├── StellarDBFront/           # Angular 20.1.0 frontend
│   ├── src/app/              # Angular application source
│   ├── src/app/Views/        # Component views
│   ├── angular.json          # Angular configuration
│   └── package.json          # npm dependencies
└── StellarDB.sln             # Visual Studio solution file
```

### Frequently Used Commands
- **Full rebuild**: `dotnet clean && dotnet restore && dotnet build`
- **Frontend clean build**: `cd StellarDBFront && rm -rf node_modules dist && npm install && npx ng build --configuration=development`
- **Start both services**: Run backend in one terminal, frontend in another
- **Check running processes**: `ps aux | grep -E "(dotnet|ng serve)"`

## Development Notes

- **Angular version**: 20.1.0 with Material UI components and TailwindCSS styling
- **Backend features**: Identity framework, Swagger documentation, CORS enabled, CSV/Excel import services
- **Database support**: Dual database architecture with SQL Server (Entity Framework) and MongoDB
- **API documentation**: Swagger UI available at `/swagger` with DeepSea theme customization

## Troubleshooting

### Common Errors
- **NETSDK1045**: Install .NET 9.0 SDK using the installation script above
- **Cannot find module '@Angular/material/select'**: Fix capitalization to `@angular/material/select`
- **Font loading failed**: Use development configuration instead of production
- **Bundle size exceeded**: Use development configuration which ignores bundle limits
- **Port already in use**: Check for existing processes: `lsof -i :5292` or `lsof -i :58211`

### Reset Environment
If builds are failing unexpectedly:
```bash
# Backend reset
cd StellarDB && dotnet clean
# Frontend reset  
cd StellarDBFront && rm -rf node_modules dist && npm install
```