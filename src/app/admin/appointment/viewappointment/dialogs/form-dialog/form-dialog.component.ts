import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { ChangeDetectorRef, Component, Inject } from "@angular/core";
import { AppointmentService } from "../../appointment.service";
import {
  FormControl,
  Validators,
  FormGroup,
  FormBuilder,
} from "@angular/forms";
import { Appointment } from "../../appointment.model";
import { MAT_DATE_LOCALE } from "@angular/material/core";
import { formatDate } from "@angular/common";
import { PacienteService } from "src/app/core/service/pacientes/paciente.service";

@Component({
  selector: "app-form-dialog",
  templateUrl: "./form-dialog.component.html",
  styleUrls: ["./form-dialog.component.css"],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: "en-GB" }],
})
export class FormDialogComponent {
  action: string;
  dialogTitle: string;
  appointmentForm: FormGroup;
  appointment: Appointment;
  cargarTurno: boolean = false;

  lugaresAtencion: string[] = [
    "Consultorios en Neuquén Capital",
    "Consultorios en Añelo",
    "Consultorios en Buta Ranquil",
    "Clínica y Maternidad Eva Perón",
    "Clínica y Maternidad Juan Domingo Perón",
    "Sanatorio Plaza Huincul",
  ];

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public appointmentService: AppointmentService,
    public pacienteService: PacienteService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Set the defaults
    this.action = data.action;
    if (this.action === "edit") {
      console.log(data.appointment.date);
      this.dialogTitle = data.appointment.name;
      this.appointment = data.appointment;
    } else {
      this.dialogTitle = "Cargar Turno";
      this.createContactForm();
    }
  }

  ngOnInit() {}

  createContactForm(data?) {
    this.appointmentForm = this.fb.group({
      img: [data ? data.datosPersonales.foto : ""],
      documento: [data ? data.dni : ""],
      nombre: [data ? data.datosPersonales.nombre : ""],
      apellido: [data ? data.datosPersonales.apellido : ""],
      email: [data ? data.datosContacto.email : ""],
      mobile: [data ? data.datosContacto.celular : ""],
      lugarTurno: [""],
      gender: [data ? data.sexo : ""],
      date: ["", [Validators.required]],
      time: ["", [Validators.required]],

      doctor: ["", [Validators.required]],
      injury: [""],
    });
  }

  cargarPaciente() {
    const dni = `dni=${this.appointmentForm.get("documento").value}`;
    console.log("dni", dni);
    this.pacienteService.getDni(dni).subscribe((resp: any) => {
      console.log("res", resp);
      this.createContactForm(resp.persona[0]);
      this.cargarTurno = true;
    });
  }

  submit() {
    // emppty stuff
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
}
