# Angular Expert — Reference Manual

> **Scope**: This manual is the Single Source of Truth for all Angular code in `frontend/`.
> **Angular version target**: 19+ (standalone-first, signals, new control flow)

---

## 1. Project Architecture (Clean Architecture Layers)

```
frontend/src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── domain/              # Entities, value objects, enums
│   │   ├── application/         # Use cases (orchestration logic)
│   │   ├── infrastructure/      # HTTP services, storage adapters
│   │   └── guards/
│   ├── features/                # Feature modules (lazy-loaded)
│   │   └── <feature>/
│   │       ├── domain/          # Feature-specific entities
│   │       ├── application/     # Feature use cases
│   │       ├── presentation/    # Components, pages, pipes, directives
│   │       └── <feature>.routes.ts
│   ├── shared/                  # Reusable UI components, pipes, directives
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── utils/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
├── environments/
└── styles/
    ├── _variables.scss
    ├── _mixins.scss
    ├── _typography.scss
    └── styles.scss
```

## 2. Component Rules

### Standalone Components (Default)
```typescript
// ✅ ALWAYS standalone
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedButtonComponent],
  templateUrl: './feature-name.component.html',
  styleUrl: './feature-name.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureNameComponent {}
```

### Rules
- **Always** use `ChangeDetectionStrategy.OnPush`
- **Always** use standalone components (no `NgModule` declarations)
- **Prefix**: `app-` for all selectors
- **One component per file**
- **Template**: external `.html` file (no inline templates except trivial wrappers)
- **Styles**: external `.scss` file, scoped

## 3. Dependency Injection

### Preferred: `inject()` Function
```typescript
// ✅ Preferred
export class MyComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
}
```

### Injection Tokens
```typescript
// Define in core/infrastructure/tokens/
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

// Provide in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: API_BASE_URL, useValue: environment.apiUrl },
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
  ]
};
```

### Service Registration
| Scope      | How to Register                                   |
|------------|---------------------------------------------------|
| Singleton  | `@Injectable({ providedIn: 'root' })`             |
| Feature    | `providers: []` in feature route config            |
| Component  | `providers: []` in `@Component` decorator          |

## 4. Reactive Patterns

### Signals (Preferred for State)
```typescript
// ✅ Use signals for component & service state
export class ParkingService {
  private readonly _spots = signal<ParkingSpot[]>([]);
  readonly spots = this._spots.asReadonly();
  readonly availableCount = computed(() => this._spots().filter(s => s.available).length);

  updateSpot(spot: ParkingSpot): void {
    this._spots.update(spots => spots.map(s => s.id === spot.id ? spot : s));
  }
}
```

### RxJS (For Async Streams)
```typescript
// ✅ Use RxJS for HTTP, WebSockets, complex async
export class ParkingHttpService {
  private readonly http = inject(HttpClient);

  getSpots(): Observable<ParkingSpot[]> {
    return this.http.get<ParkingSpot[]>('/api/spots').pipe(
      retry({ count: 2, delay: 1000 }),
      catchError(this.handleError)
    );
  }
}
```

### Rules
- **Signals** for synchronous/local state
- **RxJS** for HTTP calls, WebSocket streams, complex async composition
- **Never subscribe in components** without cleanup — use `takeUntilDestroyed()` or `async` pipe
- **No `subscribe()`** in templates — use `| async` or `toSignal()`

## 4.1 BLoC (Business Logic Component) Pattern

In ParkingHub, we use the BLoC pattern to manage state and business logic in the frontend, keeping components as pure "Presentation" layers.

```typescript
// features/parking/application/parking-list.bloc.ts
@Injectable()
export class ParkingListBloc {
  private readonly spotRepo = inject(SpotRepository);
  
  // State (Signals)
  private readonly _state = signal<ParkingListState>({ loading: false, data: [] });
  readonly state = this._state.asReadonly();

  // Inputs (Methods)
  async loadSpots() {
    this._state.update(s => ({ ...s, loading: true }));
    try {
      const data = await this.spotRepo.findAll();
      this._state.set({ loading: false, data });
    } catch (error) {
      this._state.update(s => ({ ...s, loading: false, error }));
    }
  }
}
```

### BLoC Rules
- **Component → BLoC**: Component calls methods on BLoC.
- **BLoC → Component**: BLoC exposes signals or observables for the Component to consume.
- **BLoC → Repository**: BLoC interacts with Domain Ports (Repositories).
- **Presentation Layer**: Components should **only** render UI and dispatch events to BLoCs. No direct HTTP or complex logic.
- **Service Registration**: BLoCs should be provided at the **Feature** or **Component** level, not global 'root', unless shared across features.

## 5. New Control Flow

```html
<!-- ✅ Use new block syntax (Angular 17+) -->
@if (isLoading()) {
  <app-spinner />
} @else if (error()) {
  <app-error-message [message]="error()" />
} @else {
  <ul>
    @for (spot of spots(); track spot.id) {
      <app-parking-spot [spot]="spot" />
    } @empty {
      <li>No parking spots available.</li>
    }
  </ul>
}

@switch (status()) {
  @case ('active') { <app-active-badge /> }
  @case ('inactive') { <app-inactive-badge /> }
  @default { <app-unknown-badge /> }
}
```

### Rules
- **Always** use `@if`, `@for`, `@switch` (never `*ngIf`, `*ngFor`, `[ngSwitch]`)
- **Always** specify `track` in `@for` with a unique identifier
- **Use `@empty`** for empty-state UI
- **Use `@defer`** for lazy-rendering heavy components

## 6. Routing

```typescript
// app.routes.ts — top-level routes with lazy loading
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/presentation/dashboard.component')
      .then(m => m.DashboardComponent),
  },
  {
    path: 'parking',
    loadChildren: () => import('./features/parking/parking.routes')
      .then(m => m.PARKING_ROUTES),
    canActivate: [authGuard],
  },
  { path: '**', loadComponent: () => import('./shared/components/not-found/not-found.component') },
];
```

### Rules
- **Lazy load** every feature via `loadComponent` or `loadChildren`
- **Functional guards** (`canActivate: [authGuard]`) over class-based guards
- **No `NgModule`-based routing**

## 7. Testing Standards

| Type          | Tool          | Location                              |
|---------------|---------------|---------------------------------------|
| Unit          | Jest          | `*.spec.ts` colocated with source     |
| Integration   | Jest + Testing Library | `*.integration.spec.ts`      |
| E2E           | Playwright    | `e2e/`                                |

### Unit Test Pattern
```typescript
describe('ParkingSpotComponent', () => {
  it('should display spot number', () => {
    const { getByText } = render(ParkingSpotComponent, {
      inputs: { spot: mockSpot({ number: 'A-12' }) }
    });
    expect(getByText('A-12')).toBeTruthy();
  });
});
```

## 8. Naming Conventions

| Element        | Convention                   | Example                        |
|----------------|------------------------------|--------------------------------|
| Component      | `PascalCase` + `Component`   | `ParkingSpotComponent`         |
| Service        | `PascalCase` + `Service`     | `ParkingService`               |
| Guard          | `camelCase` + `Guard`        | `authGuard`                    |
| Interceptor    | `camelCase` + `Interceptor`  | `authInterceptor`              |
| Pipe           | `PascalCase` + `Pipe`        | `TimeAgoPipe`                  |
| Interface      | `PascalCase` (no `I` prefix) | `ParkingSpot`                  |
| Enum           | `PascalCase`                 | `SpotStatus`                   |
| File           | `kebab-case`                 | `parking-spot.component.ts`    |
| Folder         | `kebab-case`                 | `parking-spots/`               |
