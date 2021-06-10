import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
const API_USERS_URL = `${environment.apiUrl}/provLoc`;
@Injectable({
  providedIn: "root",
})
export class ProvLocService {
  constructor(private http: HttpClient) {}

  getProvLocalidades() {
    return this.http.get(API_USERS_URL);
  }
}
