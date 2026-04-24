# Migration Guide: Quasar/Vue → Angular + PrimeNG

## 📖 Visão Geral da Migração

Este documento descreve o processo completo de migração da aplicação **Quasar + Vue 2** para **Angular 21 + PrimeNG 21**.

### Estatísticas da Aplicação Atual
- **Total de Componentes**: 80 componentes `.vue`
- **Páginas**: 51 páginas
- **Serviços**: 19 serviços (`*.js`)
- **Framework Atual**: Quasar Framework v1.22.2 com Vue 2.6
- **Dependências Principais**: axios, vuex, vuelidate, apexcharts, socket.io-client

---

## 🎯 Estratégia de Migração

### Fases
1. **Fase 1**: Setup e Configuração Inicial (Angular 21 + PrimeNG 21)
2. **Fase 2**: Migração de Serviços (Repository Pattern)
3. **Fase 3**: Migração de Componentes Base
4. **Fase 4**: Migração de Componentes Complexos
5. **Fase 5**: Integração de Features (routing, auth, estado)
6. **Fase 6**: Testes e Otimizações

### Princípios
- ✅ Migrar feature por feature (não tudo de uma vez)
- ✅ Manter funcionalidades idênticas
- ✅ Usar TypeScript strict mode
- ✅ Implementar testes desde o início
- ✅ Refatorar para design patterns

---

## 📋 Pré-requisitos

```bash
# Node.js 20+
node --version

# Angular CLI
npm install -g @angular/cli@21

# Criar novo projeto
ng new izing-angular --package-manager=npm
cd izing-angular

# Instalar dependências principais
npm install primeng primeicons
npm install -D jest @types/jest ts-jest
npm install axios
npm install socket.io-client
npm install date-fns lodash
npm install drawflow apexcharts
```

---

## 🏗️ Estrutura de Diretórios (Target)

```
src/
├── app/
│   ├── core/                          # Serviços, guards, interceptors
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   └── auth.interceptor.ts
│   │   ├── http/
│   │   │   └── http.interceptor.ts
│   │   └── storage/
│   │       └── local-storage.service.ts
│   │
│   ├── features/                      # Features organizadas
│   │   ├── atendimento/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── atendimento.routes.ts
│   │   │
│   │   ├── campanhas/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   └── campanhas.routes.ts
│   │   │
│   │   ├── contatos/
│   │   ├── cobrancas/
│   │   ├── dashboard/
│   │   ├── usuarios/
│   │   └── ... (outros módulos)
│   │
│   ├── shared/                        # Componentes reutilizáveis
│   │   ├── components/
│   │   │   ├── header/
│   │   │   ├── sidebar/
│   │   │   ├── footer/
│   │   │   └── ...
│   │   ├── directives/
│   │   ├── pipes/
│   │   ├── models/
│   │   └── constants/
│   │
│   ├── app.routes.ts                 # Rotas principais
│   ├── app.config.ts                 # Configurações
│   └── app.component.ts              # Root component
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── styles/
│       ├── variables.css
│       ├── global.css
│       └── theme.css
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
└── main.ts                            # Entry point

```

---

## 🔄 Mapeamento de Conceitos

### Vue → Angular

| Vue 2 Quasar | Angular 21 |
|-------------|-----------|
| `.vue` single-file | Component class + template |
| `data()` | `signal()` |
| `computed` | `computed()` |
| `watch` | `effect()` |
| `methods` | Component methods |
| `v-model` | `[(ngModel)]` ou `control.valueChanges` |
| `v-if` | `@if () {}` (control flow) |
| `v-for` | `@for (item of items; track item.id) {}` |
| `v-bind:prop` | `[prop]="value"` |
| `@click` | `(click)="method()"` |
| `$q.notify` | Custom notification service + PrimeNG |
| Vuex store | Signal-based services |
| Vuelidate | Reactive Forms validators |

---

## 📝 Passo a Passo Detalhado

### Passo 1: Configuração Inicial

#### 1.1 Criar projeto Angular
```bash
ng new izing-angular --skip-git=true
cd izing-angular
npm install primeng primeicons
```

#### 1.2 Configurar Angular.json
```json
{
  "projects": {
    "izing-angular": {
      "projectType": "application",
      "schematics": {
        "@schematics/angular:component": {
          "style": "scss",
          "standalone": true
        },
        "@schematics/angular:application": {
          "strict": true
        }
      },
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/primeng/resources/themes/lara-light-blue/theme.css",
              "node_modules/primeng/resources/primeng.min.css",
              "node_modules/primeicons/primeicons.css",
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

#### 1.3 Configurar TypeScript (tsconfig.json)
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### 1.4 Configurar app.config.ts
```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';
import { errorInterceptor } from './core/http/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    ),
    provideAnimations(),
  ],
};
```

---

### Passo 2: Criar Serviços Core

#### 2.1 AuthService
```typescript
// src/app/core/auth/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  configs?: {
    isDark?: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API_URL = '/api/auth';
  
  readonly user = signal<User | null>(this.loadUserFromStorage());
  readonly token = signal<string | null>(this.loadTokenFromStorage());
  readonly isAuthenticated = computed(() => !!this.user());
  
  constructor(private http: HttpClient) {}
  
  login(email: string, password: string): Observable<{ user: User; token: string }> {
    return this.http.post<{ user: User; token: string }>(
      `${this.API_URL}/login`,
      { email, password }
    ).pipe(
      tap(response => {
        this.user.set(response.user);
        this.token.set(response.token);
        localStorage.setItem('usuario', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
      })
    );
  }
  
  logout(): void {
    this.user.set(null);
    this.token.set(null);
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
  }
  
  private loadUserFromStorage(): User | null {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }
  
  private loadTokenFromStorage(): string | null {
    return localStorage.getItem('token');
  }
}
```

#### 2.2 HttpInterceptor
```typescript
// src/app/core/http/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  
  return next(req);
};
```

---

### Estrutura de Arquivos Separados

Cada componente Angular deve ter seus arquivos organizados:

```
src/app/features/contatos/components/contact-form/
├── contact-form.component.ts        # Lógica e component decorator
├── contact-form.component.html      # Template HTML
├── contact-form.component.scss      # Estilos especificos
└── contact-form.component.spec.ts   # Testes Jest

src/app/features/contatos/pages/contact-list/
├── contact-list.component.ts        # Lógica da página
├── contact-list.component.html      # Template da página
├── contact-list.component.scss      # Estilos da página
└── contact-list.component.spec.ts   # Testes

src/app/shared/components/header/
├── header.component.ts
├── header.component.html
├── header.component.scss
└── header.component.spec.ts
```

**Vantagens de separar HTML/SCSS do TS:**
- ✅ Código mais limpo e legível
- ✅ Templates podem ter muitas linhas
- ✅ Reutilização de estilos
- ✅ Padrão da indústria Angular
- ✅ Facilita code review
- ✅ IDE mais responsiva

---

#### 3.1 Exemplo: ContactRepository
```typescript
// src/app/features/contatos/services/contact.repository.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError } from 'rxjs';
import { of } from 'rxjs';

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  tags: string[];
}

@Injectable({ providedIn: 'root' })
export class ContactRepository {
  private readonly API_URL = '/api/contacts';
  
  readonly items = signal<Contact[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  
  constructor(private http: HttpClient) {}
  
  getAll(): Observable<Contact[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<Contact[]>(this.API_URL).pipe(
      tap(contacts => {
        this.items.set(contacts);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.message);
        this.loading.set(false);
        return of([]);
      })
    );
  }
  
  getById(id: string): Observable<Contact> {
    return this.http.get<Contact>(`${this.API_URL}/${id}`);
  }
  
  create(contact: Omit<Contact, 'id'>): Observable<Contact> {
    return this.http.post<Contact>(this.API_URL, contact).pipe(
      tap(newContact => {
        this.items.update(items => [...items, newContact]);
      })
    );
  }
  
  update(id: string, contact: Partial<Contact>): Observable<Contact> {
    return this.http.put<Contact>(`${this.API_URL}/${id}`, contact).pipe(
      tap(updated => {
        this.items.update(items =>
          items.map(item => item.id === id ? updated : item)
        );
      })
    );
  }
  
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.items.update(items => items.filter(item => item.id !== id));
      })
    );
  }
}
```

---

### Passo 4: Criar Componentes Base com PrimeNG

#### 4.1 Header Component

**header.component.ts**:
```typescript
import { Component, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ToolbarModule, ButtonModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  authService = inject(AuthService);
  
  menuItems = computed(() => [
    {
      label: this.authService.user()?.name || 'User',
      items: [
        { label: 'Profile', icon: 'pi pi-user' },
        { label: 'Settings', icon: 'pi pi-cog' },
        { separator: true },
        { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.authService.logout() }
      ]
    }
  ]);
}
```

**header.component.html**:
```html
<p-toolbar>
  <ng-template pTemplate="left">
    <h1 class="logo">IZING</h1>
  </ng-template>
  
  <ng-template pTemplate="right">
    <p-button 
      [icon]="'pi pi-user'"
      [rounded]="true"
      [text]="true"
      (onClick)="menu.toggle($event)">
    </p-button>
    
    <p-menu 
      #menu 
      [popup]="true"
      [model]="menuItems()">
    </p-menu>
  </ng-template>
</p-toolbar>
```

**header.component.scss**:
```scss
:host {
  display: block;
  border-bottom: 1px solid var(--primary-color);
}

.logo {
  margin: 0;
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: bold;
}
```

#### 4.2 Página de Contatos

**contact-list.component.ts**:
```typescript
// src/app/features/contatos/pages/contact-list/contact-list.component.ts
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { ContactRepository, Contact } from '../../services/contact.repository';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './contact-list.component.html',
  styleUrl: './contact-list.component.scss'
})
export class ContactListComponent implements OnInit {
  contactRepository = inject(ContactRepository);
  fb = inject(FormBuilder);
  messageService = inject(MessageService);
  
  displayDialog = signal(false);
  editingId = signal<string | null>(null);
  
  form = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    tags: [[] as string[]]
  });
  
  ngOnInit(): void {
    this.contactRepository.getAll().subscribe();
  }
  
  openDialog(): void {
    this.form.reset();
    this.editingId.set(null);
    this.displayDialog.set(true);
  }
  
  editContact(contact: Contact): void {
    this.form.patchValue({
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      tags: contact.tags
    });
    this.editingId.set(contact.id);
    this.displayDialog.set(true);
  }
  
  saveContact(): void {
    if (!this.form.valid) return;
    
    const data = this.form.value;
    const id = this.editingId();
    
    if (id) {
      this.contactRepository.update(id, data as Partial<Contact>).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Contato atualizado'
          });
          this.displayDialog.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.message
          });
        }
      });
    } else {
      this.contactRepository.create(data as Omit<Contact, 'id'>).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: 'Contato criado'
          });
          this.displayDialog.set(false);
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.message
          });
        }
      });
    }
  }
  
  deleteContact(id: string): void {
    if (!confirm('Deseja deletar este contato?')) return;
    
    this.contactRepository.delete(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Contato deletado'
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.message
        });
      }
    });
  }
}
```

**contact-list.component.html**:
```html
<div class="p-4">
  <div class="header">
    <h2>Contatos</h2>
    <p-button 
      label="Novo Contato"
      icon="pi pi-plus"
      (onClick)="openDialog()">
    </p-button>
  </div>
  
  <p-table 
    [value]="contactRepository.items()"
    [loading]="contactRepository.loading()"
    [paginator]="true"
    [rows]="10"
    [globalFilterFields]="['name','email']">
    
    <ng-template pTemplate="header">
      <tr>
        <th pSortableColumn="name">Nome <p-sortIcon field="name"></p-sortIcon></th>
        <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
        <th>Telefone</th>
        <th>Ações</th>
      </tr>
    </ng-template>
    
    <ng-template pTemplate="body" let-contact>
      <tr>
        <td>{{ contact.name }}</td>
        <td>{{ contact.email }}</td>
        <td>{{ contact.phone }}</td>
        <td class="actions">
          <p-button 
            icon="pi pi-pencil"
            severity="info"
            [rounded]="true"
            [text]="true"
            pTooltip="Editar"
            (onClick)="editContact(contact)">
          </p-button>
          <p-button 
            icon="pi pi-trash"
            severity="danger"
            [rounded]="true"
            [text]="true"
            pTooltip="Deletar"
            (onClick)="deleteContact(contact.id)">
          </p-button>
        </td>
      </tr>
    </ng-template>
  </p-table>
  
  <p-dialog 
    [(visible)]="displayDialog()"
    [header]="editingId() ? 'Editar Contato' : 'Novo Contato'"
    [modal]="true"
    [style]="{'width': '50vw'}"
    [breakpoints]="{'960px': '75vw', '640px': '90vw'}">
    
    <form [formGroup]="form" class="form-group">
      <div class="field">
        <label for="name">Nome *</label>
        <input 
          id="name"
          pInputText
          formControlName="name"
          class="w-full">
      </div>
      
      <div class="field">
        <label for="email">Email *</label>
        <input 
          id="email"
          pInputText
          type="email"
          formControlName="email"
          class="w-full">
      </div>
      
      <div class="field">
        <label for="phone">Telefone *</label>
        <input 
          id="phone"
          pInputText
          formControlName="phone"
          class="w-full">
      </div>
    </form>
    
    <ng-template pTemplate="footer">
      <p-button 
        label="Cancelar"
        severity="secondary"
        (onClick)="displayDialog.set(false)">
      </p-button>
      <p-button 
        label="Salvar"
        [loading]="contactRepository.loading()"
        [disabled]="form.invalid"
        (onClick)="saveContact()">
      </p-button>
    </ng-template>
  </p-dialog>
  
  <p-toast></p-toast>
</div>
```

**contact-list.component.scss**:
```scss
.p-4 {
  padding: 2rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    margin: 0;
    color: var(--dark-bg);
  }
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
      font-weight: 600;
    }
    
    input {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      
      &.ng-invalid {
        border-color: var(--danger-color);
      }
    }
  }
}

@media (max-width: 960px) {
  .p-4 {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    gap: 1rem;
    
    p-button {
      width: 100%;
    }
  }
}
```

---

### Passo 5: Configurar Roteamento

```typescript
// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'app',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'contatos',
        loadComponent: () => import('./features/contatos/pages/contact-list/contact-list.component')
          .then(m => m.ContactListComponent)
      },
      {
        path: 'campanhas',
        loadComponent: () => import('./features/campanhas/pages/campaign-list/campaign-list.component')
          .then(m => m.CampaignListComponent)
      },
      // ... outras rotas
    ]
  },
  {
    path: '',
    redirectTo: 'app/dashboard',
    pathMatch: 'full'
  }
];
```

---

### Passo 6: Testes com Jest

```typescript
// src/app/features/contatos/pages/contact-list/contact-list.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';

import { ContactListComponent } from './contact-list.component';
import { ContactRepository } from '../../services/contact.repository';

describe('ContactListComponent', () => {
  let component: ContactListComponent;
  let fixture: ComponentFixture<ContactListComponent>;
  let repository: ContactRepository;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactListComponent, HttpClientTestingModule],
      providers: [ContactRepository, MessageService]
    }).compileComponents();
    
    fixture = TestBed.createComponent(ContactListComponent);
    component = fixture.componentInstance;
    repository = TestBed.inject(ContactRepository);
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should load contacts on init', () => {
    spyOn(repository, 'getAll').and.returnValue(of([]));
    fixture.detectChanges();
    expect(repository.getAll).toHaveBeenCalled();
  });
});
```

---

## 📊 Componentes PrimeNG Mais Utilizados

Baseado na aplicação atual (Quasar), os componentes PrimeNG mais usados serão:

| Componente | Uso | Módulo |
|-----------|-----|--------|
| **Button** | Botões gerais | `ButtonModule` |
| **Table/DataTable** | Listagem de dados | `TableModule` |
| **Dialog** | Modais | `DialogModule` |
| **InputText** | Campos de texto | `InputTextModule` |
| **Dropdown** | Seleção | `DropdownModule` |
| **Calendar** | Data/Hora | `CalendarModule` |
| **Toast** | Notificações | `ToastModule` |
| **Toolbar** | Header/Footer | `ToolbarModule` |
| **Sidebar** | Menu lateral | `SidebarModule` |
| **TabView** | Abas | `TabViewModule` |
| **Card** | Containers | `CardModule` |
| **ProgressBar** | Progresso | `ProgressBarModule` |
| **Menu** | Menus | `MenuModule` |
| **Checkbox** | Checkboxes | `CheckboxModule` |
| **RadioButton** | Radio buttons | `RadioButtonModule` |

---

## 🧪 Checklist de Migração

### ✅ Setup
- [ ] Projeto Angular 21 criado
- [ ] Dependências instaladas (PrimeNG, RxJS, etc)
- [ ] TypeScript strict mode configurado
- [ ] Jest configurado
- [ ] Variáveis CSS definidas

### ✅ Serviços Base
- [ ] AuthService criado e testado
- [ ] HttpInterceptors configurados
- [ ] LocalStorage service criado
- [ ] Repositórios base implementados

### ✅ Componentes Compartilhados
- [ ] Header component
- [ ] Sidebar component
- [ ] Footer component
- [ ] Layout padrão

### ✅ Autenticação
- [ ] Login page
- [ ] Auth guard
- [ ] Token management
- [ ] Logout functionality

### ✅ Features (Primeira rodada)
- [ ] [x] Dashboard
- [ ] Contatos
- [ ] Campanhas
- [ ] Cobrançs

### ✅ Features (Segunda rodada)
- [ ] Atendimento
- [ ] Chat Flow
- [ ] Auto-resposta
- [ ] Fila de atendimento
- [ ] Usuários
- [ ] Configurações

### ✅ Qualidade
- [ ] 80%+ de code coverage
- [ ] Eslint configurado
- [ ] Prettier configurado
- [ ] Documentação completa

---

## 🚀 Comandos Úteis

```bash
# Criar novo componente standalone
ng generate component features/contatos/components/contact-form --standalone

# Criar novo serviço
ng generate service features/contatos/services/contact.repository --skip-tests=false

# Executar testes
npm run test

# Build para produção
npm run build

# Lint e format
npm run lint
npm run format
```

---

## 📞 Questões Frequentes

### P: Como migrar props do Vue para Angular?
**R**: Props no Vue → `input()` no Angular:
```typescript
// Vue
props: { title: String }

// Angular
title = input<string>();
```

### P: Como substituir `$q.notify`?
**R**: Use `MessageService` do PrimeNG:
```typescript
messageService.add({
  severity: 'success',
  summary: 'Sucesso',
  detail: 'Operação realizada'
});
```

### P: Como migrar Vuex?
**R**: Use Signal-based services:
```typescript
@Injectable({ providedIn: 'root' })
export class StateService {
  readonly items = signal<Item[]>([]);
  readonly selectedItem = signal<Item | null>(null);
}
```

### P: Como fazer HTTP requests?
**R**: Use HttpClient com repository pattern:
```typescript
this.http.get<T>(url).pipe(
  tap(data => this.items.set(data))
).subscribe();
```

---

## 🎓 Recursos de Aprendizado

- [Angular Official Docs](https://angular.io)
- [PrimeNG Components](https://primeng.org)
- [Angular Signals Guide](https://angular.io/guide/signals)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Library](https://jestjs.io)

---

## 📞 Support

Para dúvidas durante a migração, consulte:
1. Documentação oficial do [Angular Docs](https://angular.io)
2. [PrimeNG Documentation](https://primeng.org/setup)
3. O arquivo `.agent.md` deste projeto

---


## Ponto de suma Importancia
- Sempre use o mcp 'angular-cli' para gerar componentes, serviços, repositórios e outros artefatos Angular. O mcp 'angular-cli' é atualizado regularmente com as melhores práticas e convenções do Angular, garantindo que você esteja seguindo os padrões mais recentes e eficientes ao criar novos artefatos em seu projeto. Ele também ajuda a manter a consistência na estrutura e organização do código, facilitando a manutenção e escalabilidade da aplicação.

- Sempre use mcp 'primeng' para consultar a versao mais atualizada do PrimeNG e seus componentes, bem como para ter as instrucoes mais recentes sobre como usar cada componente. O mcp 'primeng' é atualizado regularmente com as melhores práticas e exemplos de uso, garantindo que você esteja sempre utilizando os recursos mais recentes e eficientes do PrimeNG em seus projetos Angular.

- Baseie a construcao do layout no tema poiseidon do primeng, adaptando as cores e estilos para se alinhar com a identidade visual da marca IZING. O tema Poiseidon oferece uma base sólida e moderna para o design da interface, e personalizá-lo permitirá criar uma experiência de usuário única e consistente com a marca.

**Última atualização**: Março 2026
**Versões**: Angular 21.x | PrimeNG 21.x |