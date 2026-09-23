import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBaseDynamic } from './gh-form-base-dynamic.component';

// PrimeNG Modules
import { TabViewModule } from 'primeng/tabview';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressBarModule } from 'primeng/progressbar';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    FormBaseDynamic
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabViewModule,
    EditorModule,
    FileUploadModule,
    ProgressBarModule,
    ButtonModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    CheckboxModule,
    RadioButtonModule,
    SelectButtonModule,
    InputTextareaModule,
    InputTextModule,
    InputNumberModule,
    InputSwitchModule,
    TooltipModule
  ],
  exports: [
    FormBaseDynamic
  ]
})
export class FormBaseDynamicModule { }

