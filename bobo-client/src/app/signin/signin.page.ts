import {Component} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {UserService} from '../../shared/services/user.service';
import {Router} from '@angular/router';
import {LoadingController} from '@ionic/angular';

@Component({
    selector: 'app-signin',
    templateUrl: 'signin.page.html',
    styleUrls: ['signin.page.scss']
})
export class SigninPage {
    controls = {
        email: '',
        password: '',
    };

    signinForm = this.fb.group(this.controls);

    constructor(private fb: FormBuilder,
                private userService: UserService,
                private router: Router,
                private loadingController: LoadingController) {
    }

    async signin() {
        const loading = await this.loadingController.create({
            message: 'Please wait...',
            translucent: true,
        });

        await loading.present();

        this.userService.signin(this.signinForm.getRawValue())
            .subscribe((data: any) => {
                const {role} = data;

                loading.dismiss();

                if (role === 'helper') {
                    this.router.navigate(['/tabs/tab1']);
                } else {
                    this.router.navigate(['/helpee-tabs/market']);
                }
            }, (err) => {
                loading.dismiss();
            });
    }
}


