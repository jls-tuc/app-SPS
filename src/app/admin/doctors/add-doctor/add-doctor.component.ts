import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ProvLocService } from "src/app/core/service/prov-loc.service";
import { ValidarPersonaService } from "src/app/core/service/renaper/validar.persona.service";
import * as moment from "moment";
import Swal from "sweetalert2";
import { debounceTime } from "rxjs/operators";
import { ProfesionalService } from "src/app/core/service/profesional/profesional.service";

@Component({
  selector: "app-add-doctor",
  templateUrl: "./add-doctor.component.html",
  styleUrls: ["./add-doctor.component.sass"],
})
export class AddDoctorComponent implements OnInit {
  docForm: FormGroup;
  public fechamin: string = "2020-03-01";
  public fechahoy: string = moment().format("YYYY-MM-DD");
  datosRenaper: {};
  ocultarBusqueda = false;
  verStep2 = false;
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
  public provLoc: any[] = [];
  localidades: any[] = [];
  public provincia: any[] = [];
  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private ValidarPersona: ValidarPersonaService,
    private profesionalService: ProfesionalService,
    private provLocService: ProvLocService
  ) {
    this.buildForm();
  }
  ngOnInit() {
    this.obtProvLoc();
    this.cdr.markForCheck();
  }
  buildForm(data?) {
    this.docForm = this.fb.group({
      nroForm: [null],
      fechaAlta: [""],
      estado: [""],
      datosPersonales: this.fb.group({
        nombre: [data ? data.nombres : ""],
        apellido: [data ? data.apellido : ""],
        dni: [data ? data.dni : "", Validators.required],
        fechaNacimiento: [data ? data.fechaNacimiento : ""],
        edad: [""],
        sexo: [data ? data.sexo : "", Validators.required],
        genero: [data ? data.genero : "", Validators.required],
        nroTramite: [data ? data.ID_TRAMITE_PRINCIPAL : ""],
        cuil: [data ? data.cuil : ""],
        fechaFallecimiento: [data ? data.mensaf : "Sin informar"],
        estadoCivil: [data ? data.estadoCivil : "", Validators.required],
        foto: [data ? data.foto : ""],
        origenf: [data ? data.origenf : ""],
      }),
      firmas: this.fb.group({
        imgArchivo: [""],
        fecha: [""],
      }),
      direccion: this.fb.group({
        provincia: [data ? data.provincia : ""],
        localidad: [data ? data.ciudad : ""],
        codigoPostal: [data ? data.cpostal : ""],
        calle: [data ? data.calle : ""],
        numero: [data ? data.numero : ""],
        block: [data ? data.monoblock : ""],
        piso: [data ? data.piso : ""],
        dpto: [data ? data.departamento : ""],
      }),
      datosContacto: this.fb.group({
        telefono: [""],
        celular: [""],
        email: [
          "",
          [
            Validators.required,
            Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$"),
          ],
        ],
      }),
      formacionAcacemica: this.fb.group({
        profesion: [""],
        entidadFormadora: [""],
        titulo: [""],
        tituloFileId: [""],
        fechaTitulo: [""],
        fechaEgreso: [""],
        renovacion: [""],
        papelesVerificados: [""],
        matriculado: [""],
        fechaDeInscripcion: [""],
      }),
    });
    this.cdr.markForCheck();
    this.docForm.valueChanges.pipe(debounceTime(500)).subscribe((value) => {
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
      this.docForm.patchValue({
        datosPersonales: { edad: this.mostrarEdad },
      });

      this.cdr.markForCheck();
      //console.log(this.pacienteForm);
    }
  }
  async validarDNI() {
    const params = `dni=${this.docForm.get("datosPersonales.dni").value}&sexo=${
      this.docForm.get("datosPersonales.sexo").value
    }`;

    this.ValidarPersona.getPersonaRenaper(params).subscribe(
      async (data: any) => {
        console.log("data", data);
        if (data.ID_TRAMITE_PRINCIPAL !== 0) {
          this.ocultarBusqueda = true;
          this.datosRenaper = data;
          data.dni = this.docForm.get("datosPersonales.dni").value;
          data.sexo = this.docForm.get("datosPersonales.sexo").value;
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

  guardar() {
    if (this.docForm.invalid) {
      return Object.values(this.docForm.controls).forEach((control) => {
        if (control instanceof FormGroup) {
          Object.values(control.controls).forEach((ctrl) =>
            ctrl.markAsTouched()
          );
        } else {
          control.markAsTouched();
        }
      });
    } else {
      /* this.pacienteForm.patchValue({
        direccion: `${
          this.pacienteForm.get("datos_Seguimiento.numero").value
        } ${this.pacienteForm.get("datos_Seguimiento.calle").value} ${
          this.pacienteForm.get("datos_Seguimiento.localidad").value
        } Neuquen`,
      }); */ //TODO:Para cargar la Geo Location
      const datos = this.docForm.value;

      this.profesionalService.crearForm(datos).subscribe(async (data: any) => {
        if (data.ok === true) {
          await Swal.fire(
            "El paciente fue registrado correctamente",
            "Puede continuar",
            "success"
          );
          await this.docForm.reset();
          this.router.navigate(["/admin/patients/all-patients"]);
        } else {
          Swal.fire("Verificar la conexion", "", "error");
        }
      });
    }
  }

  // TODO:persona

  get dniNoValido() {
    return (
      this.docForm.get("datosPersonales.dni").invalid &&
      this.docForm.get("datosPersonales.dni").touched
    );
  }

  get sexoNoValido() {
    return (
      this.docForm.get("datosPersonales.sexo").invalid &&
      this.docForm.get("datosPersonales.sexo").touched
    );
  }

  get campoTelefono() {
    return this.docForm.get("datosContactoEmergencia.telefono");
  }
  get campoCalle() {
    return this.docForm.get("direccion.calle");
  }
  get campoNumero() {
    return this.docForm.get("direccion.numero");
  }
  get campoPiso() {
    return this.docForm.get("direccion.piso");
  }
  get campoDepto() {
    return this.docForm.get("direccion.dpto");
  }
  get campoLocalidad() {
    return this.docForm.get("direccion.localidad");
  }
}
