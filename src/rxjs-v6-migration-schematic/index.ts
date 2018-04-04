import { Rule, SchematicContext, Tree, SchematicsException, chain, TaskExecutor, TaskConfigurationGenerator, TaskExecutorFactory } from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { latestVersions } from './latestVersions';
import { Observable, AsyncSubject } from 'rxjs';
import { spawn } from 'child_process';

function updatePackageJson(project: (pkg: any) => any) {
  return (tree: Tree, _context: SchematicContext) => {
    const pkgPath = '/package.json';
    const buffer = tree.read(pkgPath);
    if (buffer == null) {
      throw new SchematicsException('Could not read package.json');
    }
    const content = buffer.toString();
    const pkg = JSON.parse(content);

    if (pkg === null || typeof pkg !== 'object' || Array.isArray(pkg)) {
      throw new SchematicsException('Error reading package.json');
    }
    if (!pkg.devDependencies) {
      pkg.devDependencies = {};
    }

    tree.overwrite(pkgPath, JSON.stringify(project(pkg), null, 2));
    _context.addTask(new NodePackageInstallTask());

    return tree;
  };
}

export function rxjsV6MigrationSchematic(options: any): Rule {
  return updatePackageJson((pkg: any) => {
    pkg.dependencies['rxjs'] = latestVersions['rxjs'];
    pkg.dependencies['rxjs-compat'] = latestVersions['rxjs-compat'];
    return pkg;
  });
}

export function rxjsV6AddLintRules(options: any): Rule {
  return updatePackageJson((pkg: any) => {
    pkg.devDependencies['rxjs-tslint'] = latestVersions['rxjs-tslint'];
  });
}

export function tslintFixTask(): TaskExecutor<any> {
  return () => new Observable<any>(subscriber => {
    const childProcess = spawn('tslint', ['--fix']).on('close', (code) => {
      if (code === 0) {
        subscriber.next();
        subscriber.complete();
      }
    });

    return () => {
      if (childProcess && !childProcess.killed) {
        childProcess.kill();
      }
    };
  });
}


export class TsLintFixTaskFactory implements TaskExecutorFactory<string> {
  name = "TSLintFix";

  create(options: any) {
    return tslintFixTask();
  }
}
