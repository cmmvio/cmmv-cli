/* eslint-env node */
import * as fs from 'node:fs';
import * as path from 'node:path';

export const configureContract = async ({
  contractOptions,
  cacheOptions,
  fields,
}) => {
  const sourcePath = path.resolve(process.cwd(), 'src');
  const contractPath = path.resolve(sourcePath, 'contracts');

  if (fs.existsSync(sourcePath) && fs.existsSync(contractPath)) {
    try {
      const contractFile = `import { AbstractContract, Contract, ContractField } from '@cmmv/core';

@Contract({
    controllerName: '${contractOptions.controllerName}',
    protoPath: '${contractOptions.protoPath}',
    protoPackage: '${contractOptions.protoPackage}',
    ${contractOptions.imports.length ? `imports: ${JSON.stringify(contractOptions.imports)},` : ''}
    ${contractOptions.enableCache ? `cache: ${JSON.stringify(cacheOptions)},` : ''}
    generateController: ${contractOptions.generateController},
    generateEntities: ${contractOptions.generateEntities},
})
export class ${contractOptions.controllerName}Contract extends AbstractContract {
${fields
  .map(
    (field) => `
    @ContractField({
        protoType: '${field.protoType}',
        ${field.protoRepeated ? `protoRepeated: true,` : ''}
        ${field.unique ? `unique: true,` : ''}
        ${field.nullable ? `nullable: true,` : ''}
        ${field.validations ? `validations: ${JSON.stringify(field.validations)},` : ''}
    })
    ${field.name}: ${field.protoType === 'bool' ? 'boolean' : 'string'};
`,
  )
  .join('\n')}
}`;

      const filePath = path.join(
        contractPath,
        `${contractOptions.controllerName.toLowerCase()}.contract.ts`,
      );
      fs.writeFileSync(filePath, contractFile);
    } catch {
      console.log('❌ Failed to create contract.');
    }
  } else {
    console.log('❌ Please navigate to a valid CMMV project.');
  }
};
