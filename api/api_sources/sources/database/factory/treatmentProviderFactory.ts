/*
 * Copyright © 2019 Province of British Columbia
 * Licensed under the Apache License, Version 2.0 (the "License")
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * **
 * http://www.apache.org/licenses/LICENSE-2.0
 * **
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * File: treatmentProviderFactory.ts
 * Project: lucy
 * File Created: Tuesday, 3rd September 2019 11:58:59 am
 * Author: pushan
 * -----
 * Last Modified: Tuesday, 3rd September 2019 11:59:04 am
 * Modified By: pushan
 * -----
 */
import { TreatmentProviderContractor , TreatmentProviderContractorController } from '../models';
import { CodeFactory } from './helper';

export const treatmentProviderContractorFactory = CodeFactory<TreatmentProviderContractor, TreatmentProviderContractorController>(TreatmentProviderContractorController.shared);
// -----------------------------------------------------------------

