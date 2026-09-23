import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { delay } from 'rxjs/operators';
import { AppBreadcrumbService } from 'src/app/app.breadcrumb.service';
import { PermissionGuardService } from 'src/app/shared/services/permission-guard.service';
import { Auditoria } from '../models/auditoria.models';
import { AuditoriaService } from '../services/auditoria.service';

@Component({
	selector: 'app-auditoria-list',
	templateUrl: './auditoria-list.component.html',
	styleUrls: ['./auditoria-list.component.scss']
})
export class AuditoriaListComponent implements OnInit {
	mostrarFiltros: boolean = false;
	public searchFormGroup: FormGroup;
	public pageSize: number = 10;
	public start: number = 0;
	public filter: string;
	public totalRecords: number = 0;
	public sortAsc: boolean = true;
	public sortField: string;

	public loading: boolean = true;
	public auditoria: Auditoria[];

	public showDialog: boolean = false;
	public entity: Auditoria | null = null;

	constructor(
		private breadcrumbService: AppBreadcrumbService,
		private permission: PermissionGuardService,
		private formBuilder: FormBuilder,
		private service: AuditoriaService,
	) {
		this.breadcrumbService.setItems([
			{ label: "Administración" },
			{ label: "Auditoria", routerLink: ["/auditoria"] },
		]);

		this.searchFormGroup = this.formBuilder.group({
			metodo: [],
			modulo: [],
			accion: [],
			nombreUsuario: [],
		});
	}

	ngOnInit(): void {
		this.service.connect().pipe(delay(0)).subscribe((l) => { this.loading = l; });
	}

	checkPermission(nombre: string): boolean {
		return this.permission.hasPermission(nombre);
	}

	toggleFiltros() {
		this.mostrarFiltros = !this.mostrarFiltros;
	}

	load($event: any) {
		this.filter = $event?.globalFilter ? $event.globalFilter : null;
		this.start = $event?.first;
		this.pageSize = $event?.rows ? $event.rows : null;
		this.sortField = $event?.sortField;
		this.sortAsc = $event?.sortOrder == 1 ? true : false;
		this.loadData();
	}

	loadData() {
		this.loading = true;
		this.service.getAll(this.filter, this.pageSize, this.start, this.sortField, this.sortAsc, this.searchFormGroup.value)
			.subscribe((response) => {
				this.loading = false;
				if (response) {
					this.auditoria = response.data?.lista;
					this.totalRecords = response.data?.totalRecords;
				}
			}, error => {
				this.loading = false;
			});
	}

	clearFilters(): void {
		this.searchFormGroup.reset();
		this.start = 0;
		this.loadData();
	}

	openDetail(row: Auditoria) {
		this.showDialog = true;
		this.entity = { ...row };
	}

}
