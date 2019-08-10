import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {AlertController, LoadingController} from '@ionic/angular';
import {HellpeeService} from '../../../../shared/services/hellpee.service';
import {TransactionService} from '../../../../shared/services/transaction.service';
import {filter, mergeMap} from 'rxjs/operators';

@Component({
    selector: 'app-tab2',
    templateUrl: 'sponsorhelpee.page.html',
    styleUrls: ['sponsorhelpee.page.scss']
})
export class SponsorListPage implements OnInit {
    name = '';
    description = '';
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
        this.activatedRoute.queryParams.pipe(
            filter((data: any) => !!data._id),
            mergeMap((data: any) => {
                return this.helpeeService.getHelpee(data._id);
            }),
        ).subscribe((helpee: any) => {
            this.helpee = helpee;
            this.name = helpee.name;
            this.description = helpee.description;

            this.transactionService.getTransactions({
                query: {
                    from: this.helpee.address,
                }
            }).subscribe((data: any) => {
                this.transactions = data.transactions;
                console.log(this.transactions);
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
            }, (err) => {
                loading.dismiss();
            });
    }
}
