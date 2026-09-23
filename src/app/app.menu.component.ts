import { Component, OnInit } from "@angular/core";
import { AppComponent } from "./app.component";
import { PermissionGuardService } from "./shared/services/permission-guard.service";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-menu",
  styleUrls: ["./app.menu.component.scss"],
  template: `
    <div class="menu-search-container">
      <input
        type="text"
        placeholder="Buscar en el menú..."
        [(ngModel)]="searchQuery"
        (input)="onSearch($event)"
        class="menu-search-input"
        autocomplete="off"
      />
    </div>

    <ul class="layout-menu" *ngIf="!searchQuery || searchQuery.trim() === ''">
      <li
        app-menuitem
        *ngFor="let item of model; let i = index"
        [item]="item"
        [index]="i"
        [root]="true"
      ></li>
    </ul>

    <div
      class="search-results"
      *ngIf="searchQuery && searchQuery.trim() !== ''"
    >
      <div *ngFor="let group of groupedResults" class="search-group">
        <div class="search-group-header">{{ group.section }}</div>
        <ul class="search-group-items">
          <li
            *ngFor="let result of group.items"
            class="search-item"
            (click)="navigateToItem(result.item)"
          >
            <a class="search-item-link">
              <span
                [innerHTML]="highlightMatch(result.item.label, searchQuery)"
              ></span>
              <span class="breadcrumb">{{ result.breadcrumb }}</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="no-results" *ngIf="groupedResults.length === 0">
        <i class="pi pi-search"></i>
        <span>No se encontraron resultados para "{{ searchQuery }}"</span>
      </div>
    </div>
  `,
})
export class AppMenuComponent implements OnInit {
  model: any[];
  searchQuery: string = "";
  groupedResults: any[] = [];
  allMenuItems: any[] = [];

  constructor(
    public app: AppComponent,
    private permissionService: PermissionGuardService
  ) { }

  ngOnInit() {
    this.model = [{ label: 'Administración', items: [
      { label: 'Mi Perfil', icon: 'pi pi-fw pi-user', routerLink: ['/perfil'] },
      { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/usuario'], visible: this.permissionService.hasPermission('usuarios:ver') },
      { label: 'Perfiles / Roles', icon: 'pi pi-fw pi-check-square', routerLink: ['/rol'], visible: this.permissionService.hasPermission('roles:ver') },
      { label: 'Permisos', icon: 'pi pi-fw pi-lock', routerLink: ['/permiso'], visible: this.permissionService.hasPermission('permisos:ver') },
      { label: 'Tipos de Documento', icon: 'pi pi-fw pi-file-edit', routerLink: ['/tipo-documento'], visible: this.permissionService.hasPermission('tipoDocumento:ver') },
      { label: 'Auditoría', icon: 'pi pi-fw pi-flag', routerLink: ['/auditoria'], visible: this.permissionService.hasPermission('auditoria:ver') },
      { label: 'Notificaciones', icon: 'pi pi-fw pi-bell', routerLink: ['/notificaciones'] },
    ] }];

    // Inicializar la lista completa de elementos del menú para búsqueda
    this.initializeSearchableItems();
  }

  // Inicializar elementos buscables
  private initializeSearchableItems(): void {
    this.allMenuItems = [];
    this.extractSearchableItems(this.model, "");
  }

  // Extraer todos los elementos del menú recursivamente
  private extractSearchableItems(items: any[], parentPath: string): void {
    if (!items) return;

    items.forEach((item) => {
      if (item.visible !== false && item.label) {
        const currentPath = parentPath
          ? `${parentPath} > ${item.label}`
          : item.label;

        // Si tiene items hijos, procesar recursivamente
        if (item.items && item.items.length > 0) {
          this.extractSearchableItems(item.items, currentPath);
        } else if (item.routerLink) {
          // Solo agregar elementos que tengan routerLink (páginas finales)
          const section = parentPath ? parentPath.split(" > ")[0] : item.label;
          this.allMenuItems.push({
            item: item,
            breadcrumb: currentPath,
            section: section,
            matchScore: 0,
          });
        }
      }
    });
  }

  // Manejar búsqueda
  onSearch(event: any): void {
    const query = event.target.value.toLowerCase().trim();

    if (!query) {
      this.groupedResults = [];
      return;
    }

    // Filtrar elementos que coincidan con la búsqueda
    const filteredResults = this.allMenuItems.filter((searchResult: any) => {
      const label = searchResult.item.label.toLowerCase();
      const breadcrumb = searchResult.breadcrumb.toLowerCase();

      // Buscar coincidencias en el label o en el breadcrumb completo
      return label.includes(query) || breadcrumb.includes(query);
    });

    // Calcular score de coincidencia
    filteredResults.forEach((result: any) => {
      const label = result.item.label.toLowerCase();
      result.matchScore = this.calculateMatchScore(label, query);
    });

    // Ordenar por score de coincidencia
    filteredResults.sort((a: any, b: any) => b.matchScore - a.matchScore);

    // Agrupar por sección
    this.groupedResults = this.groupBySection(filteredResults);
  }

  // Calcular score de coincidencia
  private calculateMatchScore(text: string, query: string): number {
    if (text === query) return 100; // Coincidencia exacta
    if (text.startsWith(query)) return 80; // Empieza con la búsqueda
    if (text.includes(query)) return 60; // Contiene la búsqueda

    // Buscar coincidencias de palabras individuales
    const words = query.split(" ");
    let score = 0;
    words.forEach((word) => {
      if (text.includes(word)) score += 20;
    });

    return score;
  }

  // Agrupar resultados por sección
  private groupBySection(results: any[]): any[] {
    const groups = new Map<string, any[]>();

    results.forEach((result: any) => {
      const section = result.section;
      if (!groups.has(section)) {
        groups.set(section, []);
      }
      groups.get(section)!.push(result);
    });

    // Convertir Map a Array y ordenar secciones
    return Array.from(groups.entries())
      .map(([section, items]) => ({ section, items }))
      .sort((a: any, b: any) => a.section.localeCompare(b.section));
  }

  // Resaltar coincidencias en el texto
  highlightMatch(text: string, query: string): string {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<strong>$1</strong>");
  }

  // Navegar al elemento seleccionado
  navigateToItem(item: any): void {
    if (item.routerLink) {
      // Usar el router para navegar
      window.location.href = `#${item.routerLink.join("/")}`;
      // Scroll to top when navigating
      this.scrollToTop();
    }

    // Limpiar búsqueda después de navegar
    this.searchQuery = "";
    this.groupedResults = [];
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
