# KTTC Frontend

The KTTC frontend is an Angular application for managing training activities, including courses, modules, trainees, batches, attempts, analytics, and user settings.

## Features

- Login with session-based user information and permissions
- Dashboard with training summaries and activity information
- Course and module management
- Trainee, batch, and attempt details
- Analytics for dashboard, module, and cohort performance
- Chat functionality
- Account, security, user-management, and danger-zone settings
- Responsive styling with Bootstrap and custom SCSS
- Lucide icons for the application interface

## Technology stack

- Angular 22
- TypeScript 6
- Bootstrap 5
- RxJS 7
- Lucide Angular icons
- Vitest for unit tests
- npm 11

## Prerequisites

- Node.js compatible with the installed Angular 22 toolchain
- npm 11 or a compatible npm version
- A running KTTC backend API on `http://localhost:3000`

## Installation

From the project directory, install the dependencies:

```bash
npm install
```

## Development

Start the Angular development server:

```bash
npm start
```

Open [http://localhost:4200](http://localhost:4200) in a browser. The application reloads automatically when source files change.

## Available scripts

| Command | Description |
| --- | --- |
| `npm start` | Starts the development server. |
| `npm run build` | Creates a production build in `dist/`. |
| `npm run watch` | Builds continuously using the development configuration. |
| `npm test` | Runs the unit tests with Vitest through Angular CLI. |
| `npm run ng -- generate component <name>` | Generates an Angular component. |

## Backend configuration

The local API configuration is stored in `src/app/environment/environment.ts`:

```ts
export const environment = {
	production: false,
	baseUrl: 'http://localhost:3000',
	apiUrl: 'http://localhost:3000/api',
};
```

The frontend uses `baseUrl` for login and `apiUrl` for application services such as courses, modules, trainees, batches, attempts, analytics, and chat. Update these values when connecting to a different backend environment.

## Application routes

| Area | Routes |
| --- | --- |
| Authentication | `/login` |
| Dashboard | `/dashboard` |
| Courses | `/dashboard/courses`, `/dashboard/courses/new` |
| Modules | `/dashboard/modules/new` |
| Trainees | `/dashboard/trainees` |
| Batch details | `/dashboard/trainees/batches/:batchId` |
| Trainee details | `/dashboard/trainees/batches/:batchId/trainee/:traineeId` |
| Attempt details | `/dashboard/trainees/attempts/:attemptId` |
| Settings | `/settings/account`, `/settings/security`, `/settings/user-management`, `/settings/danger-zone` |

The root route redirects to `/login`.

## Project structure

```text
src/
├── app/
│   ├── dashboard/       # Dashboard shell, courses, trainees, and analytics views
│   ├── environment/     # Backend API configuration
│   ├── login/           # Login page
│   ├── services/        # HTTP services for application data
│   └── settings/        # Account and administration settings
├── index.html
├── main.ts
└── styles.scss
public/                  # Static assets such as the favicon
```

## Build

Create an optimized production build with:

```bash
npm run build
```

The compiled output is written to the `dist/` directory.

## Testing

Run the unit test suite with:

```bash
npm test
```

End-to-end testing is not currently configured in `package.json`.

## Angular resources

- [Angular documentation](https://angular.dev/)
- [Angular CLI documentation](https://angular.dev/tools/cli)
- [Bootstrap documentation](https://getbootstrap.com/docs/5.3/)
- [Vitest documentation](https://vitest.dev/)
