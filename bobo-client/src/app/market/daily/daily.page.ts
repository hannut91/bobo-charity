import {Component, OnInit} from '@angular/core';
import {NavController, LoadingController, AlertController} from '@ionic/angular';

import {Product} from './Product';
import {UserService} from '../../../shared/services/user.service';

@Component({
    selector: 'app-market-daily',
    templateUrl: 'daily.page.html',
    styleUrls: ['daily.page.scss']
})
export class ProductListPage implements OnInit {

    public products: Product[] = [];

    constructor(public navCtrl: NavController,
                private userService: UserService,
                private loadingController: LoadingController,
                private alertController: AlertController) {
        let products = [
            new Product(
                'Water 10L',
                18,
                '../assets/products/water.png',
            ),
            new Product(
                'Basic White Shirt',
                200,
                '../assets/products/shirt.png',
            ),
            new Product(
                'Instant Rice',
                42,
                '../assets/products/rice.png',
            ),
            new Product(
                'Instant Cup Noodles',
                30,
                '../assets/products/ramen.png',
            ),
        ];
        // Increase array items to apply page scroll
        products = products.concat(products).concat(products).concat(products);

        // Re-create products so it will not have the same memory address
        this.products = products.map(prod => new Product(
            prod.name,
            prod.price,
            prod.img,
        ));
    }

    ngOnInit() {
    }

    get finalValue(): number {
        return this.products.reduce((sum, prod) => sum + (prod._quantity * prod.price), 0);
    }

    async purchase() {
        const loading = await this.loadingController.create({
            message: 'Please wait...',
            translucent: true,
        });

        await loading.present();

        const memo = this.products
            .filter((i: any) => i._quantity)
            .reduce((acc, com) => acc + `${com.name} ${com._quantity} ${com._quantity * com.price}\n`, '');

        this.userService.pay(this.finalValue, memo)
            .subscribe(async () => {
                loading.dismiss();

                const alert = await this.alertController.create({
                    header: 'Notice',
                    message: 'Successfully purchased!',
                    buttons: ['OK']
                });

                await alert.present();
            }, async (err) => {
                loading.dismiss();

                const alert = await this.alertController.create({
                    header: 'Notice',
                    message: 'Insufficient balance.',
                    buttons: ['OK']
                });

                await alert.present();
            });
    }
}
