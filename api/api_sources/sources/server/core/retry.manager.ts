import { LoggerBase } from '../logger'
export class RetryManager<T> extends LoggerBase {
    noOfRetry = 0
    maxRetry = 5
    delay = 10000;

    object: any;
    key: string
    error: any;
    _retry(callback: any) {
        if (this.noOfRetry >= this.maxRetry) {
            callback(null);
        } else {
            RetryManager.logger.info(` // ** --- Will try [${this.key}] with retry count: ${this.noOfRetry}`);
            this.object[this.key]().then((data?: T) => {
                callback(data);
            }).catch((err: any)=> {
                this.noOfRetry = this.noOfRetry + 1;
                this.error = err;
                setTimeout(() => {
                    if (this.noOfRetry === this.maxRetry) {
                        RetryManager.logger.error(` // ** --- Retry fail with error: ${err}`);
                    } else {
                        RetryManager.logger.info(` // ** --- Retrying with delay ${this.delay} ms`);
                    }
                    this._retry(callback);
                }, this.delay);
                
            })
        }
    }

    async tryAction(object: any, key: string): Promise<T> {
        this.object = object;
        this.key = key;
        RetryManager.logger.info(` ACTION : ${ typeof object}`);
        return new Promise<T>((resolve, reject) => {
            this._retry((info?: T) => {
                this.object = null;
                this.key = '';
                if (info && info !== null) {
                    resolve(info);
                } else {
                    reject(Error(this.error || 'Unable to complete action'));
                }
            });
        });
    }
}

export const SharedRetryManager = new RetryManager();