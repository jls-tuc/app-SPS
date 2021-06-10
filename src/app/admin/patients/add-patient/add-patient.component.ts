import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

// TODO:servicios

import { ValidarPersonaService } from "src/app/core/service/renaper/validar.persona.service";

import Swal from "sweetalert2";
import * as moment from "moment";
import { debounceTime } from "rxjs/operators";
import { Localidades } from "src/app/core/models/localidades.interface";
import { ProvLocService } from "src/app/core/service/prov-loc.service";

@Component({
  selector: "app-add-patient",
  templateUrl: "./add-patient.component.html",
  styleUrls: ["./add-patient.component.css"],
})
export class AddPatientComponent {
  public fechahoy: string = moment().format("YYYY-MM-DD");
  public fechamin: string = "2020-03-01";
  pacienteForm: FormGroup;
  datosRenaper: {};
  verStep2 = false;
  ocultarBusqueda = false;
  verStep4 = false;

  edad: string;
  mostrarEdad;
  sexo: string[] = ["F", "M"];
  genero: string[] = ["femenino", "masculino", "otro"];
  estadoCivil: string[] = [
    "casado",
    "separado",
    "divorciado",
    "viudo",
    "soltero",
    "otro",
  ];
  public cargar_datos: boolean = false;
  public buscar_datos: boolean = true;
  public provLoc: any[] = [];
  localidades: any[] = [];
  public provincia: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ValidarPersona: ValidarPersonaService,
    private provLocService: ProvLocService
  ) {
    this.buildForm();
  }
  ngOnInit() {
    this.obtProvLoc();

    this.cdr.markForCheck();
  }

  buildForm(data?) {
    this.pacienteForm = this.fb.group({
      nroForm: [null],
      fechaAlta: [""],
      estado: [""],
      datosPersonales: this.fb.group({
        nombre: [data ? data.nombres : ""],
        apellido: [data ? data.apellido : ""],
        documento: [data ? data.documento : "", Validators.required],
        fechaNacimiento: [data ? data.fechaNacimiento : ""],
        edad: [""],
        sexo: [data ? data.sexo : "", Validators.required],
        genero: [data ? data.genero : ""],
        nroTramite: [data ? data.ID_TRAMITE_PRINCIPAL : ""],
        cuil: [data ? data.cuil : ""],
        fechaFallecimiento: [data ? data.mensaf : "Sin informar"],
        estadoCivil: [data ? data.estadoCivil : ""],
        foto: [data ? data.foto : ""],
        nacionalidad: [data ? data.nacionalidad : ""],
      }),
      direccion: this.fb.group({
        provincia: [data ? data.provincia : ""],
        localidad: [data ? data.ciudad : ""],
        codigoPostal: [data ? data.cpostal : ""],
        calle: [data ? data.calle : ""],
        numero: [data ? data.numero : ""],
        block: [data ? data : ""],
        piso: [data ? data.piso : ""],
        dpto: [data ? data.departamento : ""],
      }),
      datosContacto: this.fb.group({
        telefono: ["", Validators.required],
        celular: [""],
        email: [
          "",
          [
            Validators.required,
            Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$"),
          ],
        ],
      }),
      datosContactoEmergencia: this.fb.group({
        parentesco: [""],
        nombre: [""],
        apellido: [""],
        telefono: ["", Validators.required],
        celular: [""],
        email: [
          "",
          [
            Validators.required,
            Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$"),
          ],
        ],
      }),
    });
    this.cdr.markForCheck();
    this.pacienteForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe((value) => {
        console.log(value);
      });
  }

  obtProvLoc() {
    this.provLocService.getProvLocalidades().subscribe((data: any) => {
      this.provLoc = data.data;
      this.provincia = [
        ...new Set(this.provLoc.map((item) => item.provincia_nombre)),
      ];
    });
  }

  provSelect(e?: any) {
    this.localidades = this.provLoc.filter(
      (data) => data.provincia_nombre === e
    );
    this.ngOnInit();
    this.cdr.detectChanges();
  }

  calcularEdad() {
    if (this.edad) {
      //console.log("edad", this.edad);
      const convertAge = new Date(this.edad);
      const timeDiff = Math.abs(Date.now() - convertAge.getTime());
      this.mostrarEdad = Math.floor(timeDiff / (1000 * 3600 * 24) / 365);
      this.pacienteForm.patchValue({
        datosPersonales: { edad: this.mostrarEdad },
      });

      this.cdr.markForCheck();
      //console.log(this.pacienteForm);
    }
  }

  async validarDNI() {
    let doc = this.pacienteForm.get("datosPersonales.documento").value;
    let sexo = this.pacienteForm.get("datosPersonales.sexo").value;
    let params = `dni=${
      this.pacienteForm.get("datosPersonales.documento").value
    }&sexo=${this.pacienteForm.get("datosPersonales.sexo").value}`;

    this.ValidarPersona.getPersonaRenaper(params).subscribe(
      async (data: any) => {
        console.log("data", data);
        if (data.ID_TRAMITE_PRINCIPAL !== 0) {
          this.ocultarBusqueda = true;
          this.datosRenaper = data;
          data.documento = this.pacienteForm.get(
            "datosPersonales.documento"
          ).value;
          data.sexo = this.pacienteForm.get("datosPersonales.sexo").value;
          this.buildForm(data);
          this.edad = data.fechaNacimiento;
          this.calcularEdad();
          this.cdr.markForCheck();
        } else {
          Swal.fire({
            position: "top-end",
            icon: "warning",
            title: "Por favor, verifique los datos ingresados.",
            showConfirmButton: false,
            timer: 3500,
          });
        }
      }
    );
  }

  guardar() {}

  // TODO:persona

  get documentoNoValido() {
    return (
      this.pacienteForm.get("datosPersonales.documento").invalid &&
      this.pacienteForm.get("datosPersonales.documento").touched
    );
  }

  get sexoNoValido() {
    return (
      this.pacienteForm.get("datosPersonales.sexo").invalid &&
      this.pacienteForm.get("datosPersonales.sexo").touched
    );
  }

  get campoTelefono() {
    return this.pacienteForm.get("datosContactoEmergencia.telefono");
  }
  get campoCalle() {
    return this.pacienteForm.get("direccion.calle");
  }
  get campoNumero() {
    return this.pacienteForm.get("direccion.numero");
  }
  get campoPiso() {
    return this.pacienteForm.get("direccion.piso");
  }
  get campoDepto() {
    return this.pacienteForm.get("direccion.dpto");
  }
  get campoLocalidad() {
    return this.pacienteForm.get("direccion.localidad");
  }
}
