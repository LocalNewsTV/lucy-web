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
 * File: schema.helper.spec.ts
 * Project: lucy
 * File Created: Wednesday, 23rd October 2019 2:56:27 pm
 * Author: pushan (you@you.you)
 * -----
 * Last Modified: Wednesday, 23rd October 2019 2:56:43 pm
 * Modified By: pushan (you@you.you>)
 * -----
 */
import * as fs from 'fs';
import * as _ from 'underscore';
import { should, expect } from 'chai';
import { BaseSchema } from '../baseSchema';
import { getYAMLFilePath } from '../schemaYaml.loader';
import { SchemaHelper } from '../schema.helper';
import { getSQLFilePath, getSQLFileData } from '../sql.loader';

class Test2Schema extends BaseSchema {
    get schemaFilePath(): string {
        return getYAMLFilePath('sample.schema.yaml');
    }

    migrationFilePath(): string {
        return getSQLFilePath(`${this.className}.sql`);
    }

    get migrationSQL(): string {
        return getSQLFileData(`${this.className}.sql`);
    }
}

const schema = new Test2Schema();
describe('Test Schema Helper Utility', () => {
    before(() => {});
    it('should create migration files', () => {
        const dryRun = process.env.ENVIRONMENT === 'local' ? false : true;
        const r1 = SchemaHelper.shared.createMigrationFiles(schema, dryRun);
        const r2 = SchemaHelper.shared.createRevertMigrationFiles(schema, dryRun);
        should().exist(r1);
        should().exist(r2);
        if (!dryRun) {
            const sqlFiles = SchemaHelper.shared.allSqlFiles(schema); 
            _.each(sqlFiles.allFiles, (path: string) => {
                console.log(`${path}`);
                expect(fs.existsSync(path)).to.be.equal(true);
            });

            // Check root migration file content
            should().exist(schema.migrationSQL);

            // Check() a version migration sql file content
            should().exist(getSQLFileData(sqlFiles.migrations.test2));
            should().exist(getSQLFileData(sqlFiles.migrations.test));

            // Check() revert migration sql file which will us as down cmd
            should().exist(getSQLFileData(sqlFiles.revertMigrations.test));
            should().exist(getSQLFileData(sqlFiles.revertMigrations.test2));
        }

        // Remove all migration file
        const r = SchemaHelper.shared.removeAllMigrationFile(schema, dryRun);
        should().exist(r);
    });

    it('should give migration files', () => {
        const fileInfo = SchemaHelper.shared.migrationFiles(schema);
        expect(fileInfo).to.be.eql(schema.migrationFiles);
        // Root migration file name
        expect(fileInfo.root).to.be.equal(schema.className);

        // Migration file name of particular version
        expect(fileInfo.test2).to.be.equal(`${schema.className}-${schema.table.versions[1].fileName}.up.sql`);
    });
});


// ---------------------------------
