import { sleep } from 'mn-tools';
import { IJob } from 'api/main';

const REFRESH_PERIOD = 3100;

export class ApiJob {
  private _id: string;
  private _progress!: number;
  private _total!: number;
  private _description!: string;
  private _message!: string;

  public constructor(jobId: string) {
    this._id = jobId;
  }

  public get id() {
    return this._id;
  }
  public get total() {
    return this._total;
  }
  public get progress() {
    return this._progress;
  }
  public get description() {
    return this._description;
  }
  public get message() {
    return this._message;
  }

  public async wait<RES>(cb?: (job: IJob) => void) {
    while (true) {
      let response = await app.$api.job.list({ id: this._id });
      if (!response.length) {
        await sleep(REFRESH_PERIOD);
        continue;
      }

      let job = response[0];
      this._total = job.total;
      this._message = job.message;
      this._description = job.description;
      this._progress = job.progress;

      if (cb) {
        cb(job);
      } else {
        app.$api.dispatch('apiJobProgress', job);
      }
      if (job.state !== 'done') {
        await sleep(REFRESH_PERIOD);
        continue;
      }
      if (cb) {
        cb(job);
      } else {
        app.$api.dispatch('apiJobFinished', job);
      }

      return job.result as RES;
    }
  }
}
