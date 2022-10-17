import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Invoice } from '../models/invoice';
import { InvoiceService } from './invoice.service';
import { take, map } from 'rxjs';
import { Observable } from 'rxjs';

@Injectable()
export class EditInvoiceResolverService implements Resolve<Invoice> {

  constructor(private invoiceService: InvoiceService,
    private router: Router) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Invoice> | Invoice | any{
    let id: string | any = route.paramMap.get('id');
    return this.invoiceService.getInvoice(id).pipe(
        take(1),
        map(invoice => {
          if (invoice) {
            return invoice;
          }
          else {
            this.router.navigate(['/dashboard', 'invoices']);
            return ;
          }
        })
      );
  }

}