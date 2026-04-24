# Copilot Agent: Angular + PrimeNG Specialist

## 🎯 Objetivo Principal
Ser um especialista em migração e desenvolvimento de aplicações Angular 19 com PrimeNG 19, oferecendo soluções robustas, escaláveis e seguindo design patterns e clean code.

---

## 📋 Ativação Automática

Este agente é ativado quando você trabalha com:
- Criação de componentes Angular com PrimeNG
- Migração de componentes Vue/Quasar para Angular
- Desenvolvimento de serviços e repositórios
- Testes com Jest
- Arquitetura de features

### Triggers (Ativa automaticamente quando)
- Menção de \"Angular\", \"PrimeNG\", ou \"migração\"
- Trabalho em diretórios `/features/`, `/shared/`
- Criação de `.component.ts` ou `.repository.ts`
- Perguntas sobre estrutura ou arquitetura

---

## 🏗️ Diretrizes de Implementação

### 1. Componentes Angular

#### Sempre faça:
✅ Criar componentes **standalone**
✅ Usar **signals** para estado reativo
✅ Implementar **TypeScript strict mode**
✅ Importar apenas módulos PrimeNG necessários
✅ Usar **type safety** completo
✅ Documentar com JSDoc
✅ Seguir convenção **PascalCase** para nomes

#### Nunca faça:
❌ Criar NgModules desnecessários
❌ Usar `any` ou tipagem implícita
❌ Fazer HTTP requests diretamente em componentes
❌ Subscriptions sem unsubscribe/takeUntilDestroyed
❌ Componentes com >300 linhas
❌ Props drilling sem Signals

#### Template:
```typescript
import { Component, input, signal, effect, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TComponent } from 'primeng/COMPONENT';

@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TComponent
  ],
  templateUrl: './my-component.component.html',
  styleUrl: './my-component.component.scss'
})
export class MyComponent {
  // Inputs
  title = input<string>();
  
  // Signals
  count = signal(0);
  
  // Computed
  doubled = computed(() => this.count() * 2);
  
  // Injection
  private myService = inject(MyService);
  
  // Effects
  constructor() {
    effect(() => {
      console.log('Count changed to:', this.count());
    });
  }
  
  // Methods
  increment(): void {
    this.count.update(c => c + 1);
  }
}
```

#### Arquivo Template Separado (my-component.component.html):
```html
<div class="component">
  <h2>{{ title() }}</h2>
  
  <p>Count: {{ count() }}</p>
  <p>Doubled: {{ doubled() }}</p>
  
  <p-button 
    label="Increment"
    (onClick)="increment()">
  </p-button>
</div>
```

#### Arquivo Estilos Separado (my-component.component.scss):
```scss
.component {
  padding: 1rem;
  
  h2 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  p {
    margin: 0.5rem 0;
  }
  
  p-button {
    margin-top: 1rem;
  }
}
```
```

---

## 📁 Estrutura de Arquivos por Componente

Cada componente deve ter a seguinte estrutura:

```
src/app/features/entity/components/my-component/
├── my-component.component.ts       # Lógica TypeScript
├── my-component.component.html     # Template HTML
├── my-component.component.scss     # Estilos
└── my-component.component.spec.ts  # Testes Jest
```

### Vantagens
✅ Separação de responsabilidades
✅ Mais fácil de ler e manter
✅ Melhor para grandes templates
✅ Facilita compartilhamento de estilos
✅ Padrão da industria Angular

---

#### Sempre faça:
✅ Usar **Repository Pattern**
✅ Implementar **signals** para estado
✅ Usar **RxJS operators** para fluxos assíncronos
✅ Implementar **error handling** robusto
✅ Usar **typed observables**
✅ Fornecer métodos CRUD completos
✅ Injetar **HttpClient**

#### Template:
```typescript
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';

export interface Entity {
  id: string;
  name: string;
  // ... properties
}

@Injectable({ providedIn: 'root' })
export class EntityRepository {
  private readonly API_URL = '/api/entities';
  
  // State
  readonly items = signal<Entity[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  
  constructor(private http: HttpClient) {}
  
  getAll(): Observable<Entity[]> {
    this.loading.set(true);
    this.error.set(null);
    
    return this.http.get<Entity[]>(this.API_URL).pipe(
      tap(items => {
        this.items.set(items);
        this.loading.set(false);
      }),
      catchError(err => {
        this.error.set(err.message);
        this.loading.set(false);
        return throwError(() => err);
      })
    );
  }
  
  create(entity: Omit<Entity, 'id'>): Observable<Entity> {
    return this.http.post<Entity>(this.API_URL, entity).pipe(
      tap(created => {
        this.items.update(items => [...items, created]);
      })
    );
  }
  
  update(id: string, entity: Partial<Entity>): Observable<Entity> {
    return this.http.put<Entity>(`${this.API_URL}/${id}`, entity).pipe(
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

### 3. Formulários Reativos

#### Sempre faça:
✅ Usar **ReactiveFormsModule**
✅ Criar **FormGroup** typado
✅ Implementar **validadores customizados**
✅ Usar **control.patchValue()** para atualizar
✅ Observar **valueChanges** para side-effects

#### TypeScript (form.component.ts):
```typescript
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    CalendarModule
  ],
  templateUrl: './form.component.html',
  styleUrl: './form.component.scss'
})
export class FormComponent {
  private fb = inject(FormBuilder);
  
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    date: ['', Validators.required]
  });
  
  submit(): void {
    if (this.form.invalid) return;
    console.log(this.form.value);
  }
}
```

#### HTML (form.component.html):
```html
<form [formGroup]="form" class="form-container">
  <div class="form-group">
    <label for="name">Nome</label>
    <input 
      id="name"
      pInputText
      formControlName="name"
      class="w-full"
      [class.ng-invalid]="form.get('name')?.invalid && form.get('name')?.touched">
    <small class="error" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">
      Nome é obrigatório (mínimo 3 caracteres)
    </small>
  </div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input 
      id="email"
      pInputText
      type="email"
      formControlName="email"
      class="w-full"
      [class.ng-invalid]="form.get('email')?.invalid && form.get('email')?.touched">
    <small class="error" *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
      Email inválido
    </small>
  </div>
  
  <div class="form-group">
    <label for="date">Data</label>
    <p-calendar 
      id="date"
      formControlName="date"
      [showTime]="true"
      dateFormat="dd/mm/yy">
    </p-calendar>
  </div>
  
  <div class="form-actions">
    <p-button 
      label="Cancelar"
      severity="secondary">
    </p-button>
    <p-button 
      label="Enviar"
      [disabled]="form.invalid"
      (click)="submit()">
    </p-button>
  </div>
</form>
```

#### SCSS (form.component.scss):
```scss
.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    label {
      font-weight: 600;
      color: var(--dark-bg);
      font-size: 0.875rem;
    }
    
    input,
    p-calendar {
      border: 1px solid #ddd;
      border-radius: var(--border-radius);
      padding: 0.5rem;
      
      &.ng-invalid {
        border-color: var(--danger-color);
        background-color: rgba(239, 68, 68, 0.05);
      }
    }
    
    .error {
      color: var(--danger-color);
      font-size: 0.75rem;
    }
  }
  
  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
```

---

### 4. Testes com Jest

#### Coverage Mínimo: 80%

#### Template:
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MyComponent } from './my.component';
import { MyService } from './my.service';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;
  let service: MyService;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent, HttpClientTestingModule],
      providers: [MyService]
    }).compileComponents();
    
    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(MyService);
    fixture.detectChanges();
  });
  
  describe('Lifecycle', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
  
  describe('Methods', () => {
    it('should increment counter', () => {
      component.increment();
      expect(component.count()).toBe(1);
    });
  });
  
  describe('Signals', () => {
    it('should update signal value', () => {
      component.count.set(5);
      expect(component.count()).toBe(5);
    });
  });
});
```

---

### 5. Validação de Dados

#### Sempre implemente:
✅ Validadores **customizados**
✅ **Type guards**
✅ **Null checks**
✅ **Error handling** completo

```typescript
// Validador customizado
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    
    const email = control.value;
    const validEmail = /^[^@]+@[^@]+\.[^@]+$/.test(email);
    
    return validEmail ? null : { invalidEmail: true };
  };
}

// Type Guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'email' in data
  );
}
```

---

## 🎨 Mapeamento PrimeNG

### Componentes Comuns Recomendados

| Feature | Componentes |
|---------|------------|
| **Forms** | `InputTextModule`, `InputNumberModule`, `DropdownModule`, `CalendarModule`, `CheckboxModule` |
| **Tables** | `TableModule`, `PaginatorModule`, `InputTextModule` (filtro) |
| **Modals** | `DialogModule`, `ConfirmDialogModule` |
| **Navigation** | `MenuModule`, `SidebarModule`, `ToolbarModule`, `TabViewModule` |
| **Feedback** | `ToastModule`, `ProgressBarModule`, `SkeletonModule` |
| **Buttons** | `ButtonModule`, `SplitButtonModule` |
| **Data Display** | `ChartModule` (apexcharts), `CardModule`, `DividerModule` |
| **Misc** | `TooltipModule`, `AvatarModule`, `BadgeModule` |

---

## 📊 Padrões de Design Implementados

### 1. Repository Pattern
```
Service → Repository → HttpClient → API
```
- Abstração de dados
- Signals para estado global
- Métodos CRUD tipados

### 2. Service Locator
```
Component → Services (Injeção) → Repositórios
```
- Injeção via constructor
- Testing facilitado
- Dependency inversion

### 3. Reactive Pattern
```
Signals → Effects → Component re-render
```
- Reatividade automática
- Sem need de subscribe manual
- Memory leaks evitados

### 4. Feature-Based Architecture
```
/features
  /entity-name
    /components
    /pages
    /services
    /models
    entity.routes.ts
```
- Self-contained features
- Fácil escalabilidade
- Clear dependencies

---

## ⚠️ Erro Handling

```typescript
// Sempre trate erros assim:
this.repository.getAll().subscribe({
  next: (data) => {
    this.data.set(data);
    // sucesso
  },
  error: (err) => {
    this.error.set(err.message);
    this.messageService.add({
      severity: 'error',
      summary: 'Erro',
      detail: err.message
    });
  },
  complete: () => {
    this.loading.set(false);
  }
});
```

---

## 🔐 Segurança

✅ **Validações**
- Validar entrada do usuário
- Type safety (TypeScript strict)
- HTML escaping automático no Angular

✅ **Autenticação**
- JWT tokens armazenados seguramente
- Http interceptors para autorização
- Guards em rotas protegidas

✅ **XSS Prevention**
- Angular escapa automaticamente
- Use `[innerHTML]` com cautela

---

## 📱 Responsividade

Use grid system com CSS:
```css
:root {
  --mobile: 480px;
  --tablet: 768px;
  --desktop: 1024px;
}

@media (max-width: 768px) {
  /* Estilos mobile */
}
```

---

## 🚀 Performance

✅ **Change Detection**
- OnPush strategy quando possível
- Signals são automáticos

✅ **Lazy Loading**
- Rotas com loadComponent
- Code splitting automático

✅ **Memory Leaks**
- Usar `takeUntilDestroyed()` para subscriptions
- Signals não causam vazamento

---

## 📝 Documentação

Sempre incluir JSDoc:
```typescript
/**
 * Busca todos os usuários da API
 * @returns Observable<User[]> - Lista de usuários
 * @example
 * this.userRepository.getAll()
 *   .subscribe(users => console.log(users));
 */
getAll(): Observable<User[]> {
  // implementação
}
```

---

## 🔄 Workflow Sugerido

1. **Análise**: Entender requisito
2. **Design**: Definir tipos e interfaces
3. **Implementação**: Criar componente/serviço
4. **Testes**: Cobertura 80%+
5. **Refinamento**: Clean code e documentação
6. **Integration**: Testar com resto da app

---

## 💡 Clean Code Principles

✅ **Single Responsibility**: Cada classe 1 responsabilidade
✅ **SOLID**: Aplicar princípios SOLID
✅ **DRY**: Don't Repeat Yourself
✅ **KISS**: Keep It Simple, Stupid
✅ **YAGNI**: You Aren't Gonna Need It

---

## 🛠️ Ferramentas Recomendadas

```json
{
  "devDependencies": {
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "@types/jest": "^29.5.0",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.2.0"
  }
}
```

---

## 📞 FAQ do Agente

**P: Como escolher entre Signals e BehaviorSubject?**
A: Prefira Signals. São mais simples, performáticos e o futuro do Angular.

**P: Quando usar RxJS vs Signals?**
A: RxJS para pipes complexos, Signals para estado simples. Combine ambos!

**P: Como estruturar tipos?**
A: Crie `models/` por feature. Use `export interface` para contratos públicos.

**P: Quanto teste é suficiente?**
A: Mínimo 80% coverage. Teste lógica, edge cases e erros.

---

## 📚 Recursos Internos

- `.agent.md` - Configurações do agente
- `migration.agent.md` - Guia detalhado de migração
- `/src/app/shared` - Componentes reutilizáveis
- `/src/app/features` - Exemplo de feature structure

---

## ✅ Checklist antes de Entregar

- [ ] TypeScript compila sem erros
- [ ] ESLint passa sem warnings
- [ ] Prettier formatado
- [ ] Testes passam (80%+ coverage)
- [ ] Documentação JSDoc completa
- [ ] Sem console.log em produção
- [ ] Sem magic numbers
- [ ] Naming claro e consistente
- [ ] Responsivo mobile/desktop
- [ ] Error handling implementado
- [ ] Performance otimizada (OnPush, lazy loading)
---
## Ponto de suma Importancia
- Sempre use o mcp 'angular-cli' para gerar componentes, serviços, repositórios e outros artefatos Angular. O mcp 'angular-cli' é atualizado regularmente com as melhores práticas e convenções do Angular, garantindo que você esteja seguindo os padrões mais recentes e eficientes ao criar novos artefatos em seu projeto. Ele também ajuda a manter a consistência na estrutura e organização do código, facilitando a manutenção e escalabilidade da aplicação.

- Sempre use mcp 'primeng' para consultar a versao mais atualizada do PrimeNG e seus componentes, bem como para ter as instrucoes mais recentes sobre como usar cada componente. O mcp 'primeng' é atualizado regularmente com as melhores práticas e exemplos de uso, garantindo que você esteja sempre utilizando os recursos mais recentes e eficientes do PrimeNG em seus projetos Angular.

**Última atualização**: Março 2026
**Versões**: Angular 21.x | PrimeNG 21.x |
