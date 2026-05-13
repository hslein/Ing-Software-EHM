# 📊 Project Resume: EHM - Vehicle Management System

## Overview
**EHM** is a modern full-stack web application built as a monorepo using **Nx**, designed to showcase and manage vehicle information across multiple brands and categories. The system demonstrates professional software engineering practices with clear separation between frontend and backend components.

---

## 🏗️ Project Architecture

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Package Manager** | npm/pnpm | - | Dependency management |
| **Monorepo Tool** | Nx | 22.6.2 | Workspace orchestration |
| **Node.js** | Node.js | 24.14.1 | Runtime environment |
| **Runtime Environment** | NVM | - | Node version management |

---

## 📁 Project Structure

```
Ing-Software-EHM (Monorepo Root)
│
├── 📦 apps/
│   ├── ehm_back/          # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts           # Entry point
│   │   │   ├── app.module.ts     # Root module
│   │   │   ├── app.controller.ts # API endpoints
│   │   │   ├── app.service.ts    # Business logic
│   │   │   └── assets/           # Static resources
│   │   ├── package.json
│   │   └── tsconfig.app.json
│   │
│   └── ehm_front/         # Frontend (Vue 3)
│       ├── src/
│       │   ├── main.ts           # Vue app entry
│       │   ├── App.vue           # Root component
│       │   ├── components/       # Vue components
│       │   │   └── NavBar.vue
│       │   ├── app/
│       │   │   ├── App.spec.ts   # Tests
│       │   │   └── NxWelcome.vue
│       │   ├── styles.css
│       │   └── vue-shims.d.ts
│       ├── vite.config.mts
│       ├── index.html
│       └── package.json
│
├── 📚 packages/           # Shared libraries (if any)
│
├── ⚙️ Configuration Files
│   ├── nx.json            # Nx workspace configuration
│   ├── package.json       # Root package dependencies
│   ├── tsconfig.json      # TypeScript global config
│   └── tsconfig.base.json # TypeScript base paths
│
└── 📖 Documentation
    ├── README.md          # Setup instructions
    └── AGENTS.md          # Development guidelines
```

---

## 🚀 Backend (ehm_back)

### Framework: **NestJS**
A progressive Node.js framework for building efficient and scalable server-side applications.

### Key Dependencies
- `@nestjs/common` - Core utilities
- `@nestjs/core` - Framework core
- `@nestjs/platform-express` - Express adapter
- `rxjs` - Reactive programming library

### Architecture Pattern
- **Module-based** architecture following Domain-Driven Design principles
- **Controllers** - Handle HTTP requests
- **Services** - Contain business logic
- **Modules** - Group related functionality

### Current Implementation
```
AppModule
├── AppController
│   └── GET / → getHello()
└── AppService
    └── getHello() → Returns greeting message
```

### Generator Commands (NestJS CLI)
```bash
# Create a new module
nest g module name

# Create a service
nest g service name --no-spec

# Create a controller
nest g controller name --no-spec
```

---

## 🎨 Frontend (ehm_front)

### Framework: **Vue 3**
A progressive JavaScript framework for building user interfaces with reactive data binding.

### Build Tool: **Vite**
Modern, fast build tool providing rapid hot module replacement (HMR) during development.

### Key Dependencies
- `vue@3.5.13` - Vue.js framework
- `axios^1.6.0` - HTTP client for API calls
- `@vitejs/plugin-vue^6.0.1` - Vue support in Vite

### Features Implemented
1. **Vehicle Catalog**
   - Multi-brand showcase (Mazda example)
   - Vehicle categorization (SUV, Sedan, Deportivo, Pickup)
   - Dynamic vehicle data structure

2. **Navigation Component**
   - NavBar.vue - Global navigation

3. **Responsive Design**
   - CSS styling
   - Vue component composition

### Data Structure Example
```typescript
type Vehicle = {
  id: string;
  model: string;
  type: 'suv' | 'sedan' | 'deportivo' | 'pickup';
  image: string;
}

type Brand = {
  name: string;
  image: string;
  vehicles: Vehicle[];
}
```

---

## 🔧 Development Workflow

### Initial Setup
1. Install NVM (Node Version Manager)
2. Install Node.js v24.14.1
3. Install Nx globally
4. Clone repository
5. Install dependencies: `npm install`

### Running the Project
```bash
# Start both frontend and backend in parallel
npm run start

# Backend serves on: http://localhost:3000
# Frontend serves on: http://localhost:4200
```

### Development Commands
```bash
# Backend
cd apps/ehm_back
nest g module users          # Generate new module

# Frontend
npm run build                 # Production build
npm run test                  # Run tests with Vitest
```

---

## 📊 Key Features

### ✅ Multi-App Management
- **Nx Workspace**: Efficiently manages multiple applications
- **Shared Configuration**: TypeScript, linting, and build configs
- **Parallel Execution**: Run backend and frontend simultaneously
- **Dependency Management**: Clear separation of concerns

### ✅ Modern Web Stack
- **TypeScript**: Type-safe development
- **Component-based UI**: Vue 3 composition API
- **RESTful API**: NestJS controllers
- **Hot Module Replacement**: Fast development feedback

### ✅ Testing Infrastructure
- **Vitest**: Fast unit testing framework
- **Vue Test Utils**: Component testing
- **Test UI**: Visual test runner

### ✅ Code Quality
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **TSC Compiler**: Type compilation

---

## 🎯 Project Goals

1. **Educational**: Demonstrate modern full-stack architecture
2. **Scalable**: Monorepo structure supports growth
3. **Maintainable**: Clear separation between frontend and backend
4. **Professional**: Industry-standard tools and practices

---

## 📈 Development Roadmap (Future Enhancements)

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication & authorization
- [ ] API documentation (Swagger/OpenAPI)
- [ ] CI/CD pipeline setup
- [ ] E2E testing framework
- [ ] Deployment configuration (Docker)
- [ ] Advanced filtering & search
- [ ] Real-time features with WebSockets

---

## 👥 Team & Configuration

- **Package Manager**: npm/pnpm (supports monorepo workspaces)
- **Node Version**: 24.14.1 (managed by NVM)
- **Nx Version**: 22.6.2
- **License**: MIT

---

## 📚 Key Concepts Demonstrated

| Concept | Implementation |
|---------|-----------------|
| **Monorepo** | Nx workspace with multiple apps |
| **Modularity** | NestJS modules + Vue components |
| **Type Safety** | TypeScript throughout |
| **Build Optimization** | Vite with HMR |
| **Dependency Management** | npm workspaces |
| **Configuration Management** | tsconfig paths, nx.json |
| **Parallel Execution** | nx run-many command |

---

## 🔗 Important Files & Commands

### Configuration Files
- `nx.json` - Nx workspace settings
- `tsconfig.base.json` - Shared TypeScript paths
- `package.json` - Root dependencies

### Build & Run
```bash
npm run start              # Start all apps
nx build ehm_back         # Build backend only
nx serve ehm_front        # Serve frontend only
```

### Documentation
- `README.md` - Setup and installation guide
- `AGENTS.md` - Development team guidelines

---

## 📝 Summary

**EHM** is a professional, production-ready monorepo showcasing:
- Clean architecture with clear separation of concerns
- Modern web technologies (Vue 3 + NestJS)
- Professional development practices
- Scalable, maintainable codebase
- Organized workflow using Nx

This project serves as an excellent foundation for building enterprise-level applications with a focus on code quality, performance, and developer experience.

---

**Last Updated**: April 2026  
**Status**: Active Development  
**Version**: 0.0.1
