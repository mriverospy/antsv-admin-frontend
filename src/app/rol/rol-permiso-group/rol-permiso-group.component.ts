import { Component, OnInit, OnChanges, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MessageResponse } from 'src/app/shared/models/message-response.model';
import { Rol } from '../models/rol.model';
import { Permiso } from '../../permiso/models/permiso.model';
import { RolPermiso } from '../models/rol-permiso.model';
import { RolService } from '../services/rol.service';

export interface PermisoGrupo {
  key: string;
  label: string;
  children?: PermisoGrupo[];
  permisos?: Permiso[];
  checked?: boolean;
  indeterminate?: boolean;
}
/**
 * @author Luis Cardozo
 */
@Component({
  selector: 'app-rol-permiso-group',
  templateUrl: './rol-permiso-group.component.html',
  styleUrls: ['./rol-permiso-group.component.scss']
})
export class RolPermisoGroupComponent implements OnInit, OnChanges {

  @Input() row: Rol;
  @Input() permisos: Permiso[];
  @Input() visible: boolean;
  @Output() setVisible: EventEmitter<boolean> = new EventEmitter<boolean>(true);
  @Output() onResponse: EventEmitter<MessageResponse> = new EventEmitter<MessageResponse>(true);

  permisosAsociados: Permiso[] = [];
  grupos: PermisoGrupo[] = [];
  gruposFiltrados: PermisoGrupo[] = [];
  searchText: string = '';
  submitted = false;
  activeIndex: number | number[] = [];

  constructor(
    private service: RolService
  ) { }

  ngOnInit(): void {
    this.initComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && changes['visible'].currentValue) {
      this.initComponent();
    }
    if (changes['permisos'] || changes['row']) {
      this.initComponent();
    }
  }

  initComponent(): void {
    this.permisosAsociados = [];
    this.submitted = false;
    this.searchText = '';
    this.activeIndex = [];

    // Inicializar permisos asociados del rol
    if (this.row?.permisos && this.row.permisos.length > 0) {
      this.permisosAsociados = [...this.row.permisos];
    }

    // Construir estructura de grupos
    this.buildGrupos();
    this.applyFilter();
  }

  /**
   * Construir la estructura jerárquica de grupos basada en el formato nombre del permiso
   * Formato esperado: modulo:accion o modulo:submodulo:accion
   */
  buildGrupos(): void {
    if (!this.permisos || this.permisos.length === 0) {
      this.grupos = [];
      return;
    }

    const gruposMap = new Map<string, PermisoGrupo>();

    this.permisos.forEach(permiso => {
      if (!permiso.nombre) return;

      const partes = permiso.nombre.split(':');
      const grupoPrincipal = partes[0];

      // Obtener o crear grupo principal
      if (!gruposMap.has(grupoPrincipal)) {
        gruposMap.set(grupoPrincipal, {
          key: grupoPrincipal,
          label: this.humanizeKey(grupoPrincipal),
          children: [],
          permisos: [],
          checked: false,
          indeterminate: false
        });
      }

      const grupo = gruposMap.get(grupoPrincipal)!;

      // Si hay más de un segmento, crear subgrupos
      if (partes.length > 2) {
        const subgrupoPath = partes.slice(1, -1).join(':');
        const accion = partes[partes.length - 1];

        let subgrupo = grupo.children?.find(c => c.key === subgrupoPath);

        if (!subgrupo) {
          subgrupo = {
            key: subgrupoPath,
            label: this.formatSubgrupoLabel(subgrupoPath),
            children: [],
            permisos: [],
            checked: false,
            indeterminate: false
          };
          grupo.children!.push(subgrupo);
        }

        // Agregar permiso al subgrupo
        subgrupo.permisos!.push(permiso);
      } else {
        // Permiso directo al grupo principal
        grupo.permisos!.push(permiso);
      }
    });

    // Convertir Map a Array y ordenar
    this.grupos = Array.from(gruposMap.values())
      .sort((a, b) => a.label.localeCompare(b.label));

    // Ordenar subgrupos y permisos, separando permisos de menú
    this.grupos.forEach(grupo => {
      if (grupo.children) {
        grupo.children.sort((a, b) => a.label.localeCompare(b.label));
        grupo.children.forEach(subgrupo => {

          // Separar permisos de menú al principio
          const menuPermisos = subgrupo.permisos!.filter(p => this.isMenuAccessPermiso(p));
          const otrosPermisos = subgrupo.permisos!.filter(p => !this.isMenuAccessPermiso(p));
          
          menuPermisos.sort((a, b) => {
            const nombreA = a.descripcion || a.nombre || '';
            const nombreB = b.descripcion || b.nombre || '';
            return nombreA.localeCompare(nombreB);
          });
          
          otrosPermisos.sort((a, b) => {
            const nombreA = a.descripcion || a.nombre || '';
            const nombreB = b.descripcion || b.nombre || '';
            return nombreA.localeCompare(nombreB);
          });
          
          subgrupo.permisos = [...menuPermisos, ...otrosPermisos];
        });
      }

      if (grupo.permisos) {
        // Separar permisos de menú al principio del grupo principal
        const menuPermisos = grupo.permisos.filter(p => this.isMenuAccessPermiso(p));
        const otrosPermisos = grupo.permisos.filter(p => !this.isMenuAccessPermiso(p));
        
        menuPermisos.sort((a, b) => {
          const nombreA = a.descripcion || a.nombre || '';
          const nombreB = b.descripcion || b.nombre || '';
          return nombreA.localeCompare(nombreB);
        });
        
        otrosPermisos.sort((a, b) => {
          const nombreA = a.descripcion || a.nombre || '';
          const nombreB = b.descripcion || b.nombre || '';
          return nombreA.localeCompare(nombreB);
        });
        
        grupo.permisos = [...menuPermisos, ...otrosPermisos];
      }
    });

    // Sincronizar estados iniciales
    this.syncAllGroupStates();
  }

  /**
   * Manejador general de formatos de permisos: lowerCamelCase, upperCamelCase, kebab-case, snake_case
   * Ejemplo práctico que se pueden encontrar y administrar de forma unificada:
   * - clienteProductoRelacion es igual a: Cliente Producto Relacion
   * - comiteEvaluaciones es igual a: Comite Evaluaciones
   * - cliente-producto-relacion es igual a: Cliente Producto Relacion
   * - cliente_producto_relacion es igual a: Cliente Producto Relacion
   */
  humanizeKey(str: string): string {
    if (!str) return '';

    // Primero, reemplazar separadores conocidos (kebab-case, snake_case) por espacios
    let normalized = str.replace(/[-_]/g, ' ');

    // Si todavía no hay espacios, probablemente es camelCase
    if (!normalized.includes(' ')) {
      // Insertar espacio antes de cada letra mayúscula que sigue a una minúscula o número
      normalized = normalized.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
      // Insertar espacio después de una letra mayúscula seguida de minúscula (para UpperCamelCase)
      normalized = normalized.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
    }

    // Dividir por espacios y capitalizar cada palabra
    return normalized
      .split(' ')
      .filter(word => word.length > 0) // Filtrar espacios vacíos
      .map(word => {
        // Capitalizar: primera letra mayúscula, resto minúscula
        const lower = word.toLowerCase();
        return lower.charAt(0).toUpperCase() + lower.slice(1);
      })
      .join(' ');
  }

  /**
   * Formatea el label del subgrupo
   */
  formatSubgrupoLabel(path: string): string {
    return path.split(':').map(p => this.humanizeKey(p)).join(' / ');
  }

  /**
   * Convierte texto a Title Case 
   */
  toTitleCase(str: string): string {
    return this.humanizeKey(str);
  }

  /**
   * Aplica filtro de búsqueda
   */
  applyFilter(): void {
    if (!this.searchText || this.searchText.trim() === '') {
      this.gruposFiltrados = this.grupos;
      return;
    }

    const searchLower = this.searchText.toLowerCase().trim();

    this.gruposFiltrados = this.grupos
      .map(grupo => {
        // Filtrar permisos del grupo principal
        const permisosFiltrados = grupo.permisos?.filter(p =>
          this.matchesSearch(p, searchLower)
        ) || [];

        // Filtrar subgrupos
        const subgruposFiltrados = grupo.children?.map(subgrupo => {
          const subPermisosFiltrados = subgrupo.permisos?.filter(p =>
            this.matchesSearch(p, searchLower)
          ) || [];

          if (subPermisosFiltrados.length === 0) return null;

          return {
            ...subgrupo,
            permisos: subPermisosFiltrados
          };
        }).filter(s => s !== null) as PermisoGrupo[] || [];

        // Si no hay permisos ni subgrupos, excluir el grupo
        if (permisosFiltrados.length === 0 && subgruposFiltrados.length === 0) {
          return null;
        }

        return {
          ...grupo,
          permisos: permisosFiltrados,
          children: subgruposFiltrados
        };
      })
      .filter(g => g !== null) as PermisoGrupo[];

    // Sincronizar estados después del filtro
    this.syncAllGroupStates();
  }

  /**
   * Verifica si un permiso coincide con el texto de búsqueda
   */
  matchesSearch(permiso: Permiso, searchText: string): boolean {
    const nombre = (permiso.nombre || '').toLowerCase();
    const descripcion = (permiso.descripcion || '').toLowerCase();

    return nombre.includes(searchText) || descripcion.includes(searchText);
  }

  /**
   * Verifica si un permiso es de acceso al menú (formato: modulo:ver)
   */
  isMenuAccessPermiso(permiso: Permiso): boolean {
    if (!permiso.nombre) return false;
    const partes = permiso.nombre.split(':');
    // Formato: modulo:ver (exactamente 2 partes y la segunda es "ver")
    return partes.length === 2 && partes[1].toLowerCase() === 'ver';
  }

  /**
   * Obtiene el nombre del módulo desde un permiso de menú
   */
  getModuloNameFromMenuPermiso(permiso: Permiso): string {
    if (!permiso.nombre) return '';
    const partes = permiso.nombre.split(':');
    if (partes.length === 2 && partes[1].toLowerCase() === 'ver') {
      return this.humanizeKey(partes[0]);
    }
    return '';
  }

  /**
   * Obtiene el nombre legible del permiso
   */
  getPermisoLabel(permiso: Permiso): string {
    // Si es permiso de acceso al menú, mostrar formato especial
    if (this.isMenuAccessPermiso(permiso)) {
      const moduloName = this.getModuloNameFromMenuPermiso(permiso);
      return `Acceso al módulo: ${moduloName}`;
    }
    
    // Si hay descripción, usarla
    if (permiso.descripcion) {
      return permiso.descripcion;
    }
    
    // Si no hay descripción, humanizar el nombre técnico
    if (permiso.nombre) {
      // Extraer la acción (último segmento después de :)
      const partes = permiso.nombre.split(':');
      if (partes.length > 1) {
        // Si hay subgrupos, humanizar cada parte
        return partes.map(p => this.humanizeKey(p)).join(' / ');
      }
      return this.humanizeKey(permiso.nombre);
    }
    
    return 'Sin nombre';
  }

  /**
   * Obtiene el tooltip del permiso
   */
  getPermisoTooltip(permiso: Permiso): string {
    if (this.isMenuAccessPermiso(permiso)) {
      return 'Permite visualizar el módulo en el menú principal';
    }
    return permiso.descripcion || permiso.nombre || 'Sin descripción';
  }

  /**
   * Determina el tipo de badge según palabras clave en nombre/descripción
   * Retorna: 'menu' | 'read' | 'write' | 'admin' | 'danger' | null
   */
  getPermisoBadgeType(permiso: Permiso): 'menu' | 'read' | 'write' | 'admin' | 'danger' | null {
  
    // Primero verificar si es permiso de menú
    if (this.isMenuAccessPermiso(permiso)) {
      return 'menu';
    }

    const texto = ((permiso.nombre || '') + ' ' + (permiso.descripcion || '')).toLowerCase();

    // Riesgo / Baja / Eliminacion
    const dangerKeywords = ['eliminar', 'borrar', 'quitar', 'remover', 'desactivar', 'elimin', 'delete', 'remove', 'drop'];
    if (dangerKeywords.some(keyword => texto.includes(keyword))) {
      return 'danger';
    }

    // Administración
    const adminKeywords = ['administrar', 'aprobar', 'rechazar', 'procesar', 'gestionar', 'asignar', 'configurar', 'admin', 'approve', 'reject', 'process', 'manage', 'assign'];
    if (adminKeywords.some(keyword => texto.includes(keyword))) {
      return 'admin';
    }

    // Escritura
    const writeKeywords = ['crear', 'editar', 'modificar', 'cambiar', 'actualizar', 'guardar', 'agregar', 'insertar', 'create', 'edit', 'update', 'save', 'add', 'insert'];
    if (writeKeywords.some(keyword => texto.includes(keyword))) {
      return 'write';
    }

    // Lectura 
    const readKeywords = ['listar', 'consultar', 'obtener', 'mostrar', 'visualizar', 'buscar', 'view', 'list', 'read', 'show', 'search', 'consult'];
    if (readKeywords.some(keyword => texto.includes(keyword))) {
      return 'read';
    }

    return null;
  }

  /**
   * Verifica si un permiso está asociado
   */
  isPermisoSelected(permiso: Permiso): boolean {
    return this.permisosAsociados.some(p => p.idPermiso === permiso.idPermiso);
  }

  /**
   * Toggle de permiso individual
   */
  togglePermiso(permiso: Permiso, grupo: PermisoGrupo, subgrupo?: PermisoGrupo): void {
    const index = this.permisosAsociados.findIndex(p => p.idPermiso === permiso.idPermiso);

    if (index >= 0) {
      // Desmarcar
      this.permisosAsociados.splice(index, 1);
    } else {
      // Marcar
      this.permisosAsociados.push(permiso);
    }

    // Sincronizar estado del grupo/subgrupo
    if (subgrupo) {
      this.syncGrupoState(subgrupo);
      this.syncGrupoState(grupo);
    } else {
      this.syncGrupoState(grupo);
    }
  }

  /**
   * Toggle de grupo completo
   */
  toggleGrupo(grupo: PermisoGrupo): void {
    const allSelected = this.isGrupoCompletamenteSeleccionado(grupo);

    if (allSelected) {
      // Desmarcar todos
      this.deseleccionarGrupo(grupo);
    } else {
      // Marcar todos
      this.seleccionarGrupo(grupo);
    }

    // Sincronizar estado del grupo
    this.syncGrupoState(grupo);
  }

  /**
   * Toggle de subgrupo
   */
  toggleSubgrupo(subgrupo: PermisoGrupo, grupoPadre: PermisoGrupo): void {
    const allSelected = this.isGrupoCompletamenteSeleccionado(subgrupo);

    if (allSelected) {
      this.deseleccionarGrupo(subgrupo);
    } else {
      this.seleccionarGrupo(subgrupo);
    }

    // Sincronizar estados
    this.syncGrupoState(subgrupo);
    this.syncGrupoState(grupoPadre);
  }

  /**
   * Selecciona todos los permisos de un grupo
   */
  seleccionarGrupo(grupo: PermisoGrupo): void {
    // Agregar permisos directos del grupo
    if (grupo.permisos) {
      grupo.permisos.forEach(permiso => {
        if (!this.isPermisoSelected(permiso)) {
          this.permisosAsociados.push(permiso);
        }
      });
    }

    // Agregar permisos de subgrupos
    if (grupo.children) {
      grupo.children.forEach(subgrupo => {
        this.seleccionarGrupo(subgrupo);
      });
    }
  }

  /**
   * Deselecciona todos los permisos de un grupo
   */
  deseleccionarGrupo(grupo: PermisoGrupo): void {
    // Remover permisos directos del grupo
    if (grupo.permisos) {
      grupo.permisos.forEach(permiso => {
        const index = this.permisosAsociados.findIndex(p => p.idPermiso === permiso.idPermiso);
        if (index >= 0) {
          this.permisosAsociados.splice(index, 1);
        }
      });
    }

    // Remover permisos de subgrupos
    if (grupo.children) {
      grupo.children.forEach(subgrupo => {
        this.deseleccionarGrupo(subgrupo);
      });
    }
  }

  /**
   * Verifica si un grupo está completamente seleccionado
   */
  isGrupoCompletamenteSeleccionado(grupo: PermisoGrupo): boolean {
    let totalPermisos = 0;
    let permisosSeleccionados = 0;

    // Contar permisos directos
    if (grupo.permisos) {
      totalPermisos += grupo.permisos.length;
      permisosSeleccionados += grupo.permisos.filter(p => this.isPermisoSelected(p)).length;
    }

    // Contar permisos de subgrupos
    if (grupo.children) {
      grupo.children.forEach(subgrupo => {
        const subTotal = this.countPermisosEnGrupo(subgrupo);
        const subSeleccionados = this.countPermisosSeleccionadosEnGrupo(subgrupo);
        totalPermisos += subTotal;
        permisosSeleccionados += subSeleccionados;
      });
    }

    return totalPermisos > 0 && permisosSeleccionados === totalPermisos;
  }

  /**
   * Cuenta permisos en un grupo (incluyendo subgrupos)
   */
  countPermisosEnGrupo(grupo: PermisoGrupo): number {
    let count = grupo.permisos?.length || 0;
    if (grupo.children) {
      grupo.children.forEach(subgrupo => {
        count += this.countPermisosEnGrupo(subgrupo);
      });
    }
    return count;
  }

  /**
   * Cuenta permisos seleccionados en un grupo
   */
  countPermisosSeleccionadosEnGrupo(grupo: PermisoGrupo): number {
    let count = grupo.permisos?.filter(p => this.isPermisoSelected(p)).length || 0;
    if (grupo.children) {
      grupo.children.forEach(subgrupo => {
        count += this.countPermisosSeleccionadosEnGrupo(subgrupo);
      });
    }
    return count;
  }

  /**
   * Sincroniza el estado (checked/indeterminate) de un grupo
   */
  syncGrupoState(grupo: PermisoGrupo): void {
    const total = this.countPermisosEnGrupo(grupo);
    const seleccionados = this.countPermisosSeleccionadosEnGrupo(grupo);

    if (total === 0) {
      grupo.checked = false;
      grupo.indeterminate = false;
      return;
    }

    grupo.checked = seleccionados === total;
    grupo.indeterminate = seleccionados > 0 && seleccionados < total;
  }

  /**
   * Sincroniza el estado de todos los grupos
   */
  syncAllGroupStates(): void {
    const grupos = this.searchText ? this.gruposFiltrados : this.grupos;

    grupos.forEach(grupo => {
      // Sincronizar subgrupos primero
      if (grupo.children) {
        grupo.children.forEach(subgrupo => {
          this.syncGrupoState(subgrupo);
        });
      }

      // Sincronizar grupo principal
      this.syncGrupoState(grupo);
    });
  }

  /**
   * Guarda los permisos asociados
   */
  guardar(): void {
    this.submitted = true;

    if (this.permisosAsociados.length <= 0) {
      return;
    }

    const rolPermiso = new RolPermiso();
    rolPermiso.rol = this.row;
    rolPermiso.permisos = this.permisosAsociados;

    this.service.asociarPermisos(rolPermiso).subscribe(resp => {
      this.onResponse.emit(resp);
      if ([200, 201].indexOf(resp.code) !== -1) {
        this.close();
      }
    });
  }

  /**
   * Cierra el diálogo
   */
  close(): void {
    this.setVisible.emit(false);
    this.searchText = '';
    this.permisosAsociados = [];
  }

  /**
   * Limpia el filtro de búsqueda
   */
  clearSearch(): void {
    this.searchText = '';
    this.applyFilter();
  }

  /**
   * Maneja el cambio en el input de búsqueda
   */
  onSearchChange(): void {
    this.applyFilter();
  }

  /**
   * Obtiene el texto del badge según el tipo
   */
  getBadgeText(badgeType: 'menu' | 'read' | 'write' | 'admin' | 'danger' | null): string {
    if (!badgeType) return '';
    switch (badgeType) {
      case 'menu':
        return 'ACCESO';
      case 'read':
        return 'Ver';
      case 'write':
        return 'Editar';
      case 'admin':
        return 'Admin';
      case 'danger':
        return 'Baja';
      default:
        return '';
    }
  }

  /**
   * Verifica si un grupo tiene permisos de acceso al menú
   */
  hasMenuAccessPermisos(permisos: Permiso[] | undefined): boolean {
    if (!permisos || permisos.length === 0) return false;
    return permisos.some(p => this.isMenuAccessPermiso(p));
  }

  /**
   * Verifica si un grupo tiene permisos funcionales (no de menú)
   */
  hasFuncionalPermisos(permisos: Permiso[] | undefined): boolean {
    if (!permisos || permisos.length === 0) return false;
    return permisos.some(p => !this.isMenuAccessPermiso(p));
  }
}

