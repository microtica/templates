import { ClientService } from './services/client.service';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './../Shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientListingComponent } from './components/client-listing/client-listing.component';
import { FormDialogComponent } from './components/form-dialog/form-dialog.component';

@NgModule({
  declarations: [ClientListingComponent, FormDialogComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule,HttpClientModule, MaterialModule],
  exports: [ClientListingComponent],
  providers: [ClientService],
  entryComponents: [FormDialogComponent]
})
export class ClientsModule {}
