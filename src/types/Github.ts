import octokit from 'octokit';

type PromiseResponseType<T> = T extends Promise<infer U> ? U : never;
type RequestReturnType<T extends ((...args: any[]) => Promise<any>)> = PromiseResponseType<ReturnType<T>>

export type Repo = RequestReturnType<octokit.Octokit['rest']['repos']['get']>['data'];
