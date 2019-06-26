/**
 * Documentation:
 *  - https://docs.mapbox.com/mapbox-gl-js/overview
 *
 * API Explorer:
 *  - https://docs.mapbox.com/api-playground/#/?_k=dmxd1m
 */

import '../../styles';
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');

import * as React from 'react';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { css, GlamorValue } from '../../common';

const DEFAULT = {
  MAP_STYLE: 'mapbox://styles/mapbox/streets-v11',
};

export type IMapProps = {
  accessToken: string;
  mapStyle?: mapboxgl.Style | string; // https://docs.mapbox.com/api/maps/#styles
  style?: GlamorValue;
};
export type IMapState = {};

export class Map extends React.PureComponent<IMapProps, IMapState> {
  public state: IMapState = {};
  private state$ = new Subject<Partial<IMapState>>();
  private unmounted$ = new Subject<{}>();

  private map: mapboxgl.Map;
  private el!: HTMLDivElement;
  private elRef = (ref: HTMLDivElement) => (this.el = ref);

  /**
   * [Lifecycle]
   */
  public componentWillMount() {
    const state$ = this.state$.pipe(takeUntil(this.unmounted$));
    state$.subscribe(e => this.setState(e));
  }

  public componentDidMount() {
    const { mapStyle = DEFAULT.MAP_STYLE } = this.props;
    mapboxgl.accessToken = this.props.accessToken;
    this.map = new mapboxgl.Map({ container: this.el, style: mapStyle });
  }

  public componentWillUnmount() {
    this.unmounted$.next();
    this.unmounted$.complete();
  }

  /**
   * [Render]
   */
  public render() {
    return <div ref={this.elRef} {...css(this.props.style)} />;
  }
}
