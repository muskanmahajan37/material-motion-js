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
  isBoolean,
} from '../typeGuards';

import {
  Constructor,
  MotionNextOperable,
  NextChannel,
  ObservableWithMotionOperators,
} from '../types';

export interface MotionIsAnyOfable {
  isAnyOf(valuesOrValueStreams: Array<any>): ObservableWithMotionOperators<boolean>;
}

export function withIsAnyOf<T, S extends Constructor<MotionNextOperable<T>>>(superclass: S): S & Constructor<MotionIsAnyOfable> {
  return class extends superclass implements MotionIsAnyOfable<T> {
    /**
     * Dispatches `true` when it receives a value that matches any of the
     * provided values and `false` otherwise.
     */
    isAnyOf(valuesOrValueStreams: Array<any>): ObservableWithMotionOperators<boolean> {
      return (this as any as ObservableWithMotionOperators<any>)._reactiveMap(
        (upstreamValue: any, ...possibilities: Array<any>) => {
          return possibilities.includes(upstreamValue);
        },
        ...valuesOrValueStreams
      );
    }
  };
}