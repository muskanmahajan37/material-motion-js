/** @license
 *  Copyright 2016 - present The Material Motion Authors. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"); you may not
 *  use this file except in compliance with the License. You may obtain a copy
 *  of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 *  WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 *  License for the specific language governing permissions and limitations
 *  under the License.
 */

import {
  MotionObservable,
} from './observables/proxies';

import {
  Dict,
  Observable,
  ObservableWithMotionOperators,
  Observer,
  Subscription,
} from './types';

import {
  isIterable,
  isObservable,
} from './typeGuards';

export type CombineLatestOptions = {
  waitForAllValues?: boolean,
};
export function combineLatest<V, T extends Array<V | Observable<V>>, U extends Array<V>>(streams: T, options?: CombineLatestOptions): ObservableWithMotionOperators<U>;
export function combineLatest<V, T extends Dict<V | Observable<V>>, U extends Dict<V>>(streams: T, options?: CombineLatestOptions): ObservableWithMotionOperators<U>;
export function combineLatest<V, T extends Dict<V | Observable<V>> | Array<V | Observable<V>>, U extends Dict<V> | Array<V>>(streams: T, { waitForAllValues = true }: CombineLatestOptions = {}): ObservableWithMotionOperators<U> {
  return new MotionObservable(
    (observer: Observer<U>) => {
      const outstandingKeys = new Set(Object.keys(streams));

      let nextValue: U;

      if (isIterable(streams)) {
        nextValue = [] as Array<V> as U;
      } else {
        nextValue = {} as Dict<V> as U;
      }

      const subscriptions: Dict<Subscription> = {};

      let initializing = true;
      outstandingKeys.forEach(checkKey);
      initializing = false;

      // TypeScript doesn't know whether the index signature for `streams` (and
      // hence, `nextValue` and `outstandingKeys`) is a string or a number.
      // Thus, it throws an error at a simple `streams[key]`.  Since we know
      // that whichever it is, `key` can index into all three collections, we
      // cast each to `Dict<V>` and `key` to `string`.  Then, TypeScript will
      // happily index into the collections using `key`.
      function checkKey(key: string) {
        const maybeStream: any = (streams as Dict<V>)[key];

        if (isObservable(maybeStream)) {
          subscriptions[key] = maybeStream.subscribe(
            (value: any) => {
              outstandingKeys.delete(key);

              (nextValue as Dict<V>)[key] = value as V;
              dispatchNextValue();
            }
          );
        } else {
          outstandingKeys.delete(key);

          (nextValue as Dict<V>)[key] = maybeStream as V;
          dispatchNextValue();
        }
      }

      function dispatchNextValue() {
        if (waitForAllValues ? outstandingKeys.size === 0 : !initializing) {
          observer.next(nextValue);
        }
      }

      dispatchNextValue();

      return function disconnect() {
        Object.values(subscriptions).forEach(
          subscription => subscription.unsubscribe()
        );
      };
    }
  );
}
