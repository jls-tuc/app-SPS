import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../environments/environment";
const API_USERS_URL = `${environment.apiUrl}/paciente`;
@Injectable({
  providedIn: "root",
})
export class PacienteService {
  constructor(public http: HttpClient) {}

  crearForm(data: any) {
    return this.http.post(API_USERS_URL, data);
  }

  getDni(data: any) {
    return this.http.get(API_USERS_URL + `/?${data}`);
  }
}
