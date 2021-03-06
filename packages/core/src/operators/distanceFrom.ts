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
  Constructor,
  Dict,
  MotionReactiveMappable,
  Observable,
  ObservableWithMotionOperators,
  Point2D,
} from '../types';

import {
  isDefined,
  isPoint2D,
} from '../typeGuards';

export type DistanceFromOrigin<T> = (T & (Point2D | number)) | Observable<T & (Point2D | number)>;

export type DistanceFromArgs<T> = {
  origin$: DistanceFromOrigin<T>,
};

export interface MotionMeasurable<T> {
  distanceFrom(kwargs: DistanceFromArgs<T>): ObservableWithMotionOperators<number>;
  distanceFrom(origin$: DistanceFromOrigin<T>): ObservableWithMotionOperators<number>;
}

export function withDistanceFrom<T, S extends Constructor<MotionReactiveMappable<T>>>(superclass: S): S & Constructor<MotionMeasurable<T>> {
  return class extends superclass implements MotionMeasurable<T> {
    /**
     * Emits the distance that each upstream emission is from a given origin.
     * The origin may be a number or a point, but `distanceFrom` will always
     * emit a number; distance is computed using Pythagorean theorem.
     */
    distanceFrom(kwargs: DistanceFromArgs<T>): ObservableWithMotionOperators<number>;
    distanceFrom(origin$: DistanceFromOrigin<T>): ObservableWithMotionOperators<number>;
    distanceFrom({ origin$ }: DistanceFromArgs<T> & DistanceFromOrigin<T>): ObservableWithMotionOperators<number> {
      if (!isDefined(origin$)) {
        origin$ = arguments[0] as DistanceFromOrigin<T>;
      }

      return this._reactiveMap({
        transform({ upstream, origin }: Dict<(T & number) | (T & Point2D)>) {
          if (isPoint2D(upstream)) {
            return Math.sqrt(
              ((origin as Point2D).x - upstream.x) ** 2 +
              ((origin as Point2D).y - upstream.y) ** 2
            );
          } else {
            return Math.abs(origin as number - upstream);
          }
        },
        inputs: {
          origin: origin$,
        },
      });
    }
  };
}
