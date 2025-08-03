import { sleep } from 'mn-tools';
import { IJob } from 'api/main';

// Arbitrary 3 seconds
const REFRESH_PERIOD = 3000;

export class ApiJob {
  private _id: string;
  private _progress?: number;
  private _total?: number;
  private _description?: string;
  private _message?: string;

  public constructor(job: IJob) {
    this._id = job.id;
    app.$errorManager.handlePromise(app.$api.dispatchAsync('apiJobStarted', job));
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

  public async wait<RESULT>(onProgress?: (job: IJob<RESULT>) => void, signal?: AbortSignal) {
    let attempts = 0;
    while (true) {
      if (signal?.aborted) throw new Error('Aborted');
      attempts++;

      const jobs = await app.$api.job.list({ ids: [this._id] });
      if (!jobs.length) {
        if (attempts > 10) throw new Error('Job not found');
        await sleep(REFRESH_PERIOD);
        continue;
      }

      const job = jobs[0] as IJob<RESULT>;
      this._total = job.total;
      this._message = job.message;
      this._description = job.description;
      this._progress = job.progress;

      if (onProgress) onProgress(job);
      await app.$api.dispatchAsync('apiJobProgress', job);

      if (job.state !== 'done') {
        await sleep(REFRESH_PERIOD);
        continue;
      }

      await app.$api.dispatchAsync('apiJobFinished', job);

      return job.result;
    }
  }
}
