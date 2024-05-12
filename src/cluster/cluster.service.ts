import * as _cluster from 'cluster';
const cluster = _cluster as any as _cluster.Cluster;
import * as os from 'os';
import { Injectable } from '@nestjs/common';

const numCPUs = os.cpus().length;

@Injectable()
export class ClusterService {
  static clusterize(callback: any): void {
    const clusterWorkerSize = os.cpus().length;
    if (clusterWorkerSize > 1) {
      if (cluster.isMaster) {
        for (let i = 0; i < numCPUs - 1; i++) {
          cluster.fork();
        }
        cluster.on('exit', (worker) => {
          console.log(`Worker ${worker.process.pid} died. Restarting`);
          cluster.fork();
        });
      } else {
        console.log(`Cluster server started on ${process.pid}`);
        callback();
      }
    }
  }
}
