import {Component, OnInit} from '@angular/core';
import {AlertController} from '@ionic/angular';

import {HellpeeService} from '../../../shared/services/hellpee.service';

@Component({
    selector: 'app-tab2',
    templateUrl: 'sponsor_list.page.html',
    styleUrls: ['sponsor_list.page.scss']
})
export class SponsorListPage implements OnInit {
    helpees = [];

    constructor(private helpeeService: HellpeeService,
                private alertController: AlertController) {
    }

    ngOnInit() {
        this.helpeeService.getHellpees()
            .subscribe((data: any) => {
                this.helpees = data.helpees;
            }, async (err) => {
                const alert = await this.alertController.create({
                    message: 'You do not have permission',
                    header: 'Notice',
                    buttons: ['OK'],
                });
                await alert.present();
                history.back();
            });
    }
}


