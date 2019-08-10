import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {filter, mergeMap} from 'rxjs/operators';
import {AlertController, LoadingController} from '@ionic/angular';

import {HellpeeService} from '../../../shared/services/hellpee.service';
import {TransactionService} from '../../../shared/services/transaction.service';

@Component({
    selector: 'app-helpee',
    templateUrl: 'helpee.page.html',
    styleUrls: ['helpee.page.scss']
})
export class HelpeePage implements OnInit {
    helpee = {
        name: '',
        description: '',
        address: '',
        _id: 0,
    };
    transactions = [];

    constructor(private activatedRoute: ActivatedRoute,
                private alertController: AlertController,
                private helpeeService: HellpeeService,
                private transactionService: TransactionService,
                private loadingController: LoadingController) {
    }

    ngOnInit() {
        this.activatedRoute.params.pipe(
            filter((data: any) => !!data.id),
            mergeMap((data: any) => {
                return this.helpeeService.getHelpee(data.id);
            }),
        ).subscribe((helpee: any) => {
            this.helpee = helpee;

            this.transactionService.getTransactions({
                query: {
                    to: this.helpee.address,
                }
            }).subscribe((data: any) => {
                this.transactions = data.transactions;
            });
        });
    }

    async showData(hash: string) {
        const loading = await this.loadingController.create({
            message: 'Please wait...',
            translucent: true,
        });

        await loading.present();

        this.transactionService.getData(hash)
            .subscribe(async (data: any) => {
                loading.dismiss();

                const alert = await this.alertController.create({
                    header: 'Message',
                    message: data.value,
                    buttons: ['OK']
                });

                await alert.present();
            }, async (err) => {
                loading.dismiss();

                const alert = await this.alertController.create({
                    header: 'Message',
                    message: 'Data is not ready. Please try again later.',
                    buttons: ['OK']
                });

                await alert.present();
            });
    }
}
