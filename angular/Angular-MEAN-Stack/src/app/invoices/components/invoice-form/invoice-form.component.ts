import { Client } from './../../../clients/models/client';
import { ClientService } from './../../../clients/services/client.service';
import { Invoice } from './../../models/invoice';
import { ActivatedRoute, Router } from '@angular/router';
import { InvoiceService } from './../../services/invoice.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-invoice-form',
  templateUrl: './invoice-form.component.html',
  styleUrls: ['./invoice-form.component.scss'],
})
export class InvoiceFormComponent implements OnInit {
  invoiceForm!: FormGroup;
  private invoice!: Invoice;
  editMode = false;
  clients: Client[] = [];

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.setInvoiceToForm();
    this.setClients();
  }

  get f() {
    return this.invoiceForm.controls;
  }

  createForm() {
    this.invoiceForm = this.fb.group({
      item: ['', Validators.required],
      date: ['', Validators.required],
      due: ['', Validators.required],
      qty: ['', Validators.required],
      client: ['', Validators.required],
      rate: [''],
      tax: [''],
    });
  }

  onSubmit() {
    //user want to edit the invoice
    if (this.invoice) {
      this.invoiceService
        .updateInvoice(this.invoice._id, this.invoiceForm.value)
        .subscribe(
          (data) => {
            this._snackBar.open('Invoice updated', 'Success', {
              duration: 2000,
            });
            this.router.navigate(['dashboard/invoices']);
            this.invoiceForm.reset();
          },
          (err) => {
            this.errorHandler(err, 'Failed to update invoice');
          }
        );
    } else {
      this.invoiceService.createInvoice(this.invoiceForm.value).subscribe(
        (data) => {
          this._snackBar.open('Invoice creted!', 'Success', {
            duration: 2000,
          });
          this.router.navigate(['dashboard/invoices']);
          this.invoiceForm.reset();
        },
        (err) => {
          this.errorHandler(err, 'Failed to create Invoice');
        }
      );
    }
  }

  onCancel() {
    this.router.navigate(['dashboard/invoices']);
  }

  private setInvoiceToForm() {
    this.route.params.subscribe((params) => {
      // console.log('id :>> ', id);
      let id = params['id'];
      if (!id) {
        return;
      }
      // this.invoiceService.getInvoice(id).subscribe(
      //   (invoice) => {
      //     this.editMode = true;
      //     this.invoice = invoice;
      //     this.invoiceForm.patchValue(this.invoice);
      //   },
      //   (err) => this.errorHandler(err, 'Failed to get Invoice')
      // );

      this.route.data.subscribe((data) => {
        this.invoice = data['invoice'];

        if(this.invoice.client){
          this.invoiceForm.patchValue({client: this.invoice.client._id});
        }
        this.invoiceForm.patchValue({
          item: this.invoice.item,
          qty: this.invoice.qty,
          date: this.invoice.date,
          due: this.invoice.due,
          rate: this.invoice.rate,
          tax: this.invoice.tax,
        });        
      })
    })
  }

  private errorHandler(error: any, message: string) {
    console.error(error);
    this._snackBar.open(message, 'Error', {
      duration: 2000,
    });
  }

  private setClients() {
    this.clientService.getClients().subscribe(
      (clients) => {
        this.clients = clients;
      },
      (err) => this.errorHandler(err, 'Failed to get clients')
    );
  }
}
