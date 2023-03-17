import { Component, OnInit, ElementRef, ViewContainerRef } from '@angular/core';
import { SitesettingsService } from '../../services/sitesettings.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { FileuploadDirective } from '../../shared/directives/fileupload.directive';
import { environment } from './../../../environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss']
})

export class BannersComponent implements OnInit {
  user: any;
  url: any;
  siteinfo: any;
  uploadForm: FormGroup;
  uploadlogoForm: FormGroup;
  uploadsliderForm: FormGroup;
  logo: File;
  sitedata: any;
  constructor(
    private service: SitesettingsService, private router: Router,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private elem: ElementRef,
    public toastr: ToastrService, vcr: ViewContainerRef,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.url = environment.API_URL;
    this.createForm();
    this.getsitedata();
  }

  createForm() {
    this.uploadForm = new FormGroup({
      banner_image: new FormControl('', [FileuploadDirective.validate])
    });

    this.uploadlogoForm = new FormGroup({
      logo: new FormControl('', [FileuploadDirective.validate])
    });

    this.uploadsliderForm = new FormGroup({
      slider: new FormControl('', [FileuploadDirective.validate])
    });

  }

  getsitedata() {
    this.service.getsitesettings().subscribe(res => {
      this.sitedata = res.result;
    });
  }


  uploadBanner(Form) {
    if (this.uploadForm.valid) {
      const files = this.elem.nativeElement.querySelector('#banner_image').files;
      if (!this.validateFile(files[0].name)) {
        this.translate.get('Kindly upload jpg ,png (or) jpeg images').subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
        });
        return false;
      } else {
        const fData: FormData = new FormData;
        const file = files[0];
        fData.append('banner_image', file, file.name);
        this.service.uploadBanners(fData).subscribe(data => {
          if (data.status) {
            this.uploadForm.reset();
            this.getsitedata();
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.success(res, '', { 'timeOut': 3000 });
            });
            this.router.navigate(['admin/banners/']);
            window.scrollTo(0, 0);
          } else {
            this.uploadForm.reset();
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.error(res, '', { 'timeOut': 3000 });
            });
          }
        });
      }
    } else {
      this.validateAllFormFields(this.uploadForm);
    }
  }


  uploadLogo(Form) {
    if (this.uploadlogoForm.valid) {
      const files = this.elem.nativeElement.querySelector('#logo').files;
      if (!this.validateFile(files[0].name)) {
        this.translate.get('Kindly upload jpg ,png (or) jpeg images').subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
        });
        return false;
      } else {
        const fData: FormData = new FormData;
        const file = files[0];
        fData.append('logo_image', file, file.name);
        this.service.uploadLogos(fData).subscribe(data => {
          if (data.status) {
            this.uploadlogoForm.reset();
            this.getsitedata();
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.success(res, '', { 'timeOut': 3000 });
            });
            this.router.navigate(['admin/banners/']);
            window.scrollTo(0, 0);
          } else {
            this.uploadlogoForm.reset();
            this.translate.get(data.message).subscribe((res: string) => {
              this.toastr.error(res, '', { 'timeOut': 3000 });
            });
          }
        });
      }
    } else {
      this.validateAllFormFields(this.uploadlogoForm);
    }
  }

  uploadSlider(Form) {
    if (this.uploadsliderForm.valid) {
      const files = this.elem.nativeElement.querySelector('#slider').files;
      const file = files[0];
      const imgPromise = this.getImagetype(file);
      imgPromise.then(blob => {
        const validimagetypes = ['89504E47', 'FFD8FFDB', 'FFD8FFE0', 'FFD8FFE1'];
        if (validimagetypes.indexOf(blob.toString()) > -1) {
          const imagedimension = this.getImagedimesion(file);
          imagedimension.then(imagetype => {
            imagetype = imagetype.toString();
            if (imagetype === 'success') {
              const fData: FormData = new FormData;
              fData.append('slider_image', file, file.name);
              this.service.uploadSliders(fData).subscribe(data => {
                if (data.status) {
                  this.uploadsliderForm.reset();
                  this.getsitedata();
                  this.translate.get(data.message).subscribe((res: string) => {
                    this.toastr.success(res, '', { 'timeOut': 3000 });
                  });
                  this.router.navigate(['admin/banners/']);
                  window.scrollTo(0, 0);
                } else {
                  this.uploadsliderForm.reset();
                  this.translate.get(data.message).subscribe((res: string) => {
                    this.toastr.error(res, '', { 'timeOut': 3000 });
                  });
                }
              });
            } else {
              this.uploadsliderForm.reset();
              this.translate.get('Minimum Image dimension is 720 * 1280 pixels').subscribe((res: string) => {
                this.toastr.error(res, '', { 'timeOut': 3000 });
              });
              return false;
            }
          }).catch(e => console.log(e));
        } else {
          this.uploadsliderForm.reset();
          this.translate.get('Kindly upload jpg ,png (or) jpeg images').subscribe((res: string) => {
            this.toastr.error(res, '', { 'timeOut': 3000 });
          });
          return false;
        }
      }).catch(e => console.log(e));
    } else {
      this.validateAllFormFields(this.uploadsliderForm);
    }
  }

  getImagetype(file) {
    const reader = new FileReader();
    return new Promise(function (resolve, reject) {
      reader.onload = (function (theFile) {
        return function (e) {
          const uint = new Uint8Array(e.target.result);
          const bytes = []
          uint.forEach((byte) => {
            bytes.push(byte.toString(16));
          })
          const hex = bytes.join('').toUpperCase();
          resolve(hex);
        };
      })(file);
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  }

  getImagedimesion(file) {
    const reader = new FileReader();
    let valid = 'failure';
    return new Promise(function (resolve, reject) {
      reader.onload = (function (theFile) {
        return function (e) {
          const img = new Image();
          img.onload = () => {
            this.width = Number(img.width);
            this.height = Number(img.height);
            if ((img.width >= 720) && (img.height >= 1280)) {
              valid = 'success';
            }
            resolve(valid);
          };
          img.src = e.target.result;
        };
      })(file);
      reader.readAsDataURL(file);
    });
  }

  removeSlide(id) {
    this.service.deleteslider(id).subscribe(data => {
      if (data.status) {
        this.translate.get(data.message).subscribe((res: string) => {
          this.toastr.success(res, '', { 'timeOut': 3000 });
        });
        window.scrollTo(0, 0);
        this.getsitedata();
      } else {
        window.scrollTo(0, 0);
        this.translate.get(data.message).subscribe((res: string) => {
          this.toastr.error(res, '', { 'timeOut': 3000 });
        });
      }
    });
  }

  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  validateFile(name: String) {
    const ext = name.substring(name.lastIndexOf('.') + 1);
    if (ext.toLowerCase() === 'png' || ext.toLowerCase() === 'jpg' || ext.toLowerCase() === 'jpeg') {
      return true;
    } else {
      return false;
    }
  }

  onFormReset() {
    this.uploadForm.reset();
  }

  onFormlogoReset() {
    this.uploadlogoForm.reset();
  }


  onFormsliderReset() {
    this.uploadsliderForm.reset();
  }

  refresh(): void {
    window.location.reload();
  }

}
