import { logger, AbstractObservable, uuid } from 'mn-tools';
import { ISaveJob, ISavingManagerListener, TSaver, TSavingStatus } from '.';
import { IApplicationListener } from '../application';
import { IRouterListener } from '../router';

const log = logger('SavingManager');

export class SavingManagerService
  extends AbstractObservable<ISavingManagerListener>
  implements Partial<IApplicationListener>, Partial<IRouterListener>
{
  private _timeout!: NodeJS.Timeout;
  private _status: TSavingStatus = 'saved';
  private _queue: { [key: string]: ISaveJob } = {};

  public applicationWillClose() {
    if (!!Object.keys(this._queue).length) {
      return 'Vous avez du travail non encore sauvegardé. Voulez vous vraimer tout jeter ?';
    }
    return undefined;
  }

  public routerStateWillLeave() {
    return this.applicationWillClose();
  }

  public constructor() {
    super();
    app.addListener(this);
    app.$router.addListener(this);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public saver<E = any>(): TSaver<E> {
    return ((uuid) => {
      log.debug('Create Saver', uuid);
      return (jobOrFunction: ISaveJob<E> | (() => Promise<void>)) => {
        let job: ISaveJob<E>;
        if (typeof jobOrFunction === 'function') {
          job = {
            id: uuid,
            payload: undefined!,
            handler: jobOrFunction,
          };
        } else {
          job = jobOrFunction;
          job.id = job.id ? `${uuid}::${job.id}` : uuid;
        }
        log.debug('Queuing Job', job.id);
        this.onSaveState('unsaved');
        this._queue[job.id!] = job;
        clearTimeout(this._timeout);
        this._timeout = setTimeout(() => app.$errorManager.handlePromise(this.forceSave()), 3000);
      };
    })(uuid());
  }

  protected onSaveState(savingState: TSavingStatus) {
    log.debug('Sauvegarde', savingState);
    this._status = savingState;
    app.$errorManager.handlePromise(this.dispatchAsync('onSavingManagerStatusChanged', this._status));
  }

  public async forceSave() {
    const timer = setTimeout(() => {
      this.onSaveState('saving');
    }, 1000);
    const jobs = Object.values(this._queue);
    log.debug('Saving Jobs: ', jobs);
    this._queue = {};
    for (const job of jobs) {
      await job.handler(job.payload);
    }
    clearTimeout(timer);
    this.onSaveState('saved');
  }

  public get savingState() {
    return this._status;
  }
}
