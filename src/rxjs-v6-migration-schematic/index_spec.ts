import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import * as path from 'path';


const collectionPath = path.join(__dirname, '../collection.json');


describe('rxjs-v6-migration-schematic', () => {
  let tree: UnitTestTree;
  beforeEach(() => {
    tree = <UnitTestTree> Tree.empty();
    tree.create('/package.json', `{}`);
  });
  it('adds missing dependencies', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    tree = runner.runSchematic('rxjs-v6-migration-schematic', {}, tree);

    const pkg = JSON.parse(tree.readContent('/package.json'));
    expect(pkg.dependencies['rxjs-compat']).toEqual('^6.0.0-rc.0');
    expect(pkg.devDependencies['rxjs-tslint']).toEqual('0.0.0');
  });

  it('creates the tslint config file', () => {
    const runner = new SchematicTestRunner('schematics', collectionPath);
    tree = runner.runSchematic('rxjs-v6-migration-schematic', {}, tree);

    expect(tree.exists('/migrate-rxjs.tslint.json')).toEqual(true);
  });
});
