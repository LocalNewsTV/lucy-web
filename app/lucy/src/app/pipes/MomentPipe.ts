/**
 *  Copyright © 2019 Province of British Columbia
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * 	Unless required by applicable law or agreed to in writing, software
 * 	distributed under the License is distributed on an "AS IS" BASIS,
 * 	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 	See the License for the specific language governing permissions and
 * 	limitations under the License.
 *
 * 	Created by Amir Shayegh on 2019-10-23.
 */
import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
    name: 'momentPipe'
})
export class MomentPipe implements PipeTransform {
    transform(value: Date|moment.Moment, ...args: any[]): any {
        const [format] = args;
        return moment.tz(value, 'UTC').format(format);
    }
}