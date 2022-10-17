import { JwtService } from './../../core/services/jwt.service';
import { Invoice, InvoicePaginationRsp } from './../models/invoice';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const BASE_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {
  constructor(private http: HttpClient, private jwtService: JwtService) {}

  getInvoices({page, perPage, sortField, sortDir, filter}: any): Observable<InvoicePaginationRsp> {
    let queryString = `${BASE_URL}/invoices?page=${page + 1}&perPage=${perPage}`;
    if(sortField && sortDir){
      queryString = `${queryString}&sortField=${sortField}&sortDir=${sortDir}`
    }
    if(filter){
      queryString = `${queryString}&filter=${filter}`
    }
    return this.http.get<InvoicePaginationRsp>(queryString);
  }

  createInvoice(body: Invoice): Observable<Invoice> {
    return this.http.post<Invoice>(`${BASE_URL}/invoices`, body);
  }

  deleteInvoice(id: string): Observable<Invoice> {
    return this.http.delete<Invoice>(`${BASE_URL}/invoices/${id}`);
  }

  getInvoice(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${BASE_URL}/invoices/${id}`);
  }

  updateInvoice( id: string , body: Invoice) {
    return this.http.put<Invoice>(`${BASE_URL}/invoices/${id}`, body);
  }

  downloadInvoice(id:string){
    return this.http.get(`${BASE_URL}/invoices/${id}/download`,{
      responseType: 'blob' //response type is used to read binary data
    });
  }
}
