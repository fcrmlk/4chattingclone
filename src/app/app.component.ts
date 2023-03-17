import { Component, ViewContainerRef } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    // Set toastr container ref configuration for toastr positioning on screen
    constructor(public toastr: ToastrService) {
    }
}
